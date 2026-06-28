using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/orders")]
    [ApiController]
    public class OrdersApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly CMS.Backend.Services.IEmailService _emailService;

        public OrdersApiController(ApplicationDbContext context, CMS.Backend.Services.IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // GET: api/orders
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new
                {
                    o.Id,
                    o.OrderDate,
                    o.Status,
                    StatusText = o.Status == 0 ? "Chờ duyệt" : o.Status == 1 ? "Đang giao" : "Đã hoàn thành",
                    o.Notes,
                    CustomerName = o.Customer != null ? o.Customer.FullName : null,
                    CustomerEmail = o.Customer != null ? o.Customer.Email : null,
                    ItemCount = o.OrderDetails != null ? o.OrderDetails.Count : 0,
                    TotalAmount = o.OrderDetails != null
                        ? o.OrderDetails.Sum(d => d.Quantity * d.UnitPrice)
                        : 0
                })
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/orders/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                    .ThenInclude(d => d.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng này" });

            return Ok(new
            {
                order.Id,
                order.OrderDate,
                order.Status,
                StatusText = order.Status == 0 ? "Chờ duyệt" : order.Status == 1 ? "Đang giao" : "Đã hoàn thành",
                order.Notes,
                Customer = order.Customer == null ? null : new
                {
                    order.Customer.Id,
                    order.Customer.FullName,
                    order.Customer.Email,
                    order.Customer.Phone,
                    order.Customer.Address
                },
                OrderDetails = order.OrderDetails?.Select(d => new
                {
                    d.Id,
                    d.ProductId,
                    ProductName = d.Product != null ? d.Product.Name : null,
                    d.Quantity,
                    d.UnitPrice,
                    SubTotal = d.Quantity * d.UnitPrice
                }),
                TotalAmount = order.OrderDetails?.Sum(d => d.Quantity * d.UnitPrice) ?? 0
            });
        }

        // GET: api/orders/customer/3
        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(int customerId, [FromQuery] int page = 1, [FromQuery] int pageSize = 5)
        {
            var query = _context.Orders
                .Where(o => o.CustomerId == customerId);

            int totalItems = await query.CountAsync();
            int totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var orders = await query
                .Include(o => o.OrderDetails)
                .OrderByDescending(o => o.OrderDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new
                {
                    o.Id,
                    o.OrderDate,
                    o.Status,
                    StatusText = o.Status == -1 ? "Chờ TT VNPay" : o.Status == 0 ? "Chờ duyệt" : o.Status == 1 ? "Đang giao" : "Đã hoàn thành",
                    TotalAmount = o.OrderDetails != null
                        ? o.OrderDetails.Sum(d => d.Quantity * d.UnitPrice)
                        : 0
                })
                .ToListAsync();

            return Ok(new
            {
                items = orders,
                totalItems,
                totalPages,
                pageNumber = page
            });
        }

        // POST: api/orders
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Order model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kiểm tra tồn kho và trừ số lượng
            if (model.OrderDetails != null && model.OrderDetails.Any())
            {
                foreach (var detail in model.OrderDetails)
                {
                    var product = await _context.Products.FindAsync(detail.ProductId);
                    if (product == null)
                    {
                        return BadRequest(new { message = $"Sản phẩm ID {detail.ProductId} không tồn tại." });
                    }
                    if (product.StockQuantity < detail.Quantity)
                    {
                        return BadRequest(new { message = $"Sản phẩm '{product.Name}' không đủ số lượng tồn kho. Chỉ còn {product.StockQuantity}." });
                    }
                    
                    // Trừ tồn kho
                    product.StockQuantity -= detail.Quantity;
                }
            }

            model.OrderDate = DateTime.Now;
            model.Status = 0; // Mặc định: Chờ duyệt
            _context.Orders.Add(model);
            await _context.SaveChangesAsync();

            // Lấy email khách hàng để gửi
            var customer = await _context.Customers.FindAsync(model.CustomerId);
            if (customer != null && !string.IsNullOrEmpty(customer.Email))
            {
                await _emailService.SendOrderConfirmationAsync(customer.Email, model);
            }

            return CreatedAtAction(nameof(GetById), new { id = model.Id }, new { model.Id, model.OrderDate, model.Status });
        }

        // PUT: api/orders/5/status  (Cập nhật trạng thái đơn hàng)
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] int status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng này" });

            if (status < 0 || status > 2)
                return BadRequest(new { message = "Trạng thái không hợp lệ (0: Chờ duyệt, 1: Đang giao, 2: Đã hoàn thành)" });

            order.Status = status;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái thành công", order.Id, order.Status });
        }

        // DELETE: api/orders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng này" });

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa đơn hàng thành công" });
        }
    }
}
