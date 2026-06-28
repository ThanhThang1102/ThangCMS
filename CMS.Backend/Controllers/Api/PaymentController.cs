using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using CMS.Backend.Services;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/payment")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        public PaymentController(ApplicationDbContext context, IConfiguration config, IEmailService emailService)
        {
            _context = context;
            _config = config;
            _emailService = emailService;
        }

        // -------------------------------------------------------------------------
        // POST api/payment/create-vnpay-url
        // Tạo đơn hàng trạng thái "Chờ thanh toán" (Status = -1) và sinh URL VNPay.
        // KHÔNG trừ tồn kho ở đây — chỉ trừ khi VNPay xác nhận thanh toán thành công.
        // -------------------------------------------------------------------------
        [HttpPost("create-vnpay-url")]
        public async Task<IActionResult> CreateVNPayUrl([FromBody] CreateVNPayRequest req)
        {
            if (req == null || req.OrderDetails == null || !req.OrderDetails.Any())
                return BadRequest(new { message = "Giỏ hàng trống." });

            // ----- 1. Xử lý CustomerId -----
            int customerId = req.CustomerId;
            if (customerId == 0)
            {
                var existing = await _context.Customers
                    .FirstOrDefaultAsync(c => c.Email == req.Email);

                if (existing != null)
                {
                    customerId = existing.Id;
                }
                else
                {
                    var guest = new Customer
                    {
                        FullName = req.FullName ?? "",
                        Email = req.Email ?? "",
                        Phone = req.Phone ?? "",
                        Address = req.Address ?? "",
                        Password = EncryptionHelper.Encrypt("GuestUser123!")
                    };
                    _context.Customers.Add(guest);
                    await _context.SaveChangesAsync();
                    customerId = guest.Id;
                }
            }

            // ----- 2. Kiểm tra tồn kho (chỉ kiểm tra, CHƯA trừ) -----
            foreach (var detail in req.OrderDetails)
            {
                var product = await _context.Products.FindAsync(detail.ProductId);
                if (product == null)
                    return BadRequest(new { message = $"Sản phẩm ID {detail.ProductId} không tồn tại." });
                if (product.StockQuantity < detail.Quantity)
                    return BadRequest(new { message = $"Sản phẩm '{product.Name}' chỉ còn {product.StockQuantity} sản phẩm trong kho." });
            }

            // ----- 3. Tạo đơn hàng với Status = -1 (Chờ thanh toán VNPay) -----
            var order = new Order
            {
                CustomerId = customerId,
                Notes = req.Notes ?? "",
                OrderDate = DateTime.Now,
                Status = -1, // -1 = Chờ thanh toán VNPay (chưa trừ kho)
                OrderDetails = req.OrderDetails.Select(d => new OrderDetail
                {
                    ProductId = d.ProductId,
                    Quantity = d.Quantity,
                    UnitPrice = d.UnitPrice
                }).ToList()
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            long totalAmount = req.OrderDetails.Sum(d => (long)(d.Quantity * d.UnitPrice));

            // ----- 4. Tạo URL VNPay -----
            var vnp = new VNPayHelper();
            string vnpTmnCode = _config["VNPay:TmnCode"]!;
            string vnpHashSecret = _config["VNPay:HashSecret"]!;
            string vnpBaseUrl = _config["VNPay:BaseUrl"]!;
            string vnpReturnUrl = _config["VNPay:ReturnUrl"]!;

            string clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            if (clientIp == "::1") clientIp = "127.0.0.1";

            string txnRef = $"{order.Id}_{DateTimeOffset.Now.ToUnixTimeSeconds()}";

            vnp.AddRequestData("vnp_Version", "2.1.0");
            vnp.AddRequestData("vnp_Command", "pay");
            vnp.AddRequestData("vnp_TmnCode", vnpTmnCode);
            vnp.AddRequestData("vnp_Amount", (totalAmount * 100).ToString());
            vnp.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
            vnp.AddRequestData("vnp_CurrCode", "VND");
            vnp.AddRequestData("vnp_IpAddr", clientIp);
            vnp.AddRequestData("vnp_Locale", "vn");
            vnp.AddRequestData("vnp_OrderInfo", $"Thanh toan don hang #{order.Id}");
            vnp.AddRequestData("vnp_OrderType", "other");
            vnp.AddRequestData("vnp_ReturnUrl", vnpReturnUrl);
            vnp.AddRequestData("vnp_TxnRef", txnRef);
            vnp.AddRequestData("vnp_ExpireDate", DateTime.Now.AddMinutes(15).ToString("yyyyMMddHHmmss"));

            string paymentUrl = vnp.CreateRequestUrl(vnpBaseUrl, vnpHashSecret);

            return Ok(new { paymentUrl, orderId = order.Id });
        }

        // -------------------------------------------------------------------------
        // GET api/payment/vnpay-return  (VNPay redirect về sau khi thanh toán)
        // -------------------------------------------------------------------------
        [HttpGet("vnpay-return")]
        public async Task<IActionResult> VNPayReturn()
        {
            string frontendBase = "http://localhost:3000";
            string vnpHashSecret = _config["VNPay:HashSecret"]!;

            // Xác thực chữ ký
            bool isValid = VNPayHelper.ValidateSignature(Request.Query, vnpHashSecret);
            if (!isValid)
                return Redirect($"{frontendBase}/thanh-toan-that-bai?loi=chu-ky-khong-hop-le");

            string responseCode = Request.Query["vnp_ResponseCode"].ToString();
            string txnRef = Request.Query["vnp_TxnRef"].ToString();
            int orderId = int.Parse(txnRef.Split('_')[0]);

            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return Redirect($"{frontendBase}/thanh-toan-that-bai?loi=don-hang-khong-ton-tai");

            // Tránh xử lý lại nếu đơn đã được cập nhật trước đó
            if (order.Status != -1)
                return Redirect(order.Status >= 1
                    ? $"{frontendBase}/thanh-toan-thanh-cong?ma-don={orderId}"
                    : $"{frontendBase}/thanh-toan-that-bai?ma=da-xu-ly");

            if (responseCode == "00")
            {
                // ✅ Thanh toán thành công — bây giờ mới trừ tồn kho
                if (order.OrderDetails != null)
                {
                    foreach (var d in order.OrderDetails)
                    {
                        var product = await _context.Products.FindAsync(d.ProductId);
                        if (product != null)
                        {
                            product.StockQuantity = Math.Max(0, product.StockQuantity - d.Quantity);
                        }
                    }
                }

                order.Status = 0; // Chờ duyệt (shop cần kiểm tra và đóng gói)
                order.Notes = string.IsNullOrEmpty(order.Notes)
                    ? "[VNPay] Thanh toán thành công"
                    : order.Notes + " | [VNPay] Thanh toán thành công";

                await _context.SaveChangesAsync();

                // Gửi email xác nhận
                if (order.Customer != null && !string.IsNullOrEmpty(order.Customer.Email))
                {
                    try { await _emailService.SendOrderConfirmationAsync(order.Customer.Email, order); }
                    catch { /* bỏ qua nếu mail lỗi */ }
                }

                return Redirect($"{frontendBase}/thanh-toan-thanh-cong?ma-don={orderId}");
            }
            else
            {
                // ❌ Thanh toán thất bại / huỷ — xoá đơn hàng chờ
                if (order.OrderDetails != null)
                    _context.OrderDetails.RemoveRange(order.OrderDetails);
                _context.Orders.Remove(order);
                await _context.SaveChangesAsync();

                return Redirect($"{frontendBase}/thanh-toan-that-bai?ma={responseCode}");
            }
        }
    }

    // ---- DTOs ----
    public class CreateVNPayRequest
    {
        public int CustomerId { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? Notes { get; set; }
        public List<VNPayOrderDetail> OrderDetails { get; set; } = new();
    }

    public class VNPayOrderDetail
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
