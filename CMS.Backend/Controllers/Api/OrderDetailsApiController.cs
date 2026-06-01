using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/orderdetails")]
    [ApiController]
    public class OrderDetailsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrderDetailsApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/orderdetails/order/5  (Lấy chi tiết các mặt hàng trong 1 đơn)
        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetByOrder(int orderId)
        {
            var details = await _context.OrderDetails
                .Where(d => d.OrderId == orderId)
                .Include(d => d.Product)
                .Select(d => new
                {
                    d.Id,
                    d.OrderId,
                    d.ProductId,
                    ProductName = d.Product != null ? d.Product.Name : null,
                    ProductImage = d.Product != null ? d.Product.ImageUrl : null,
                    d.Quantity,
                    d.UnitPrice,
                    SubTotal = d.Quantity * d.UnitPrice
                })
                .ToListAsync();

            return Ok(details);
        }

        // GET: api/orderdetails/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var detail = await _context.OrderDetails
                .Include(d => d.Product)
                .Include(d => d.Order)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (detail == null)
                return NotFound(new { message = "Không tìm thấy chi tiết đơn hàng này" });

            return Ok(new
            {
                detail.Id,
                detail.OrderId,
                detail.ProductId,
                ProductName = detail.Product?.Name,
                detail.Quantity,
                detail.UnitPrice,
                SubTotal = detail.Quantity * detail.UnitPrice
            });
        }

        // POST: api/orderdetails  (Thêm sản phẩm vào đơn hàng)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderDetail model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kiểm tra đơn hàng tồn tại
            if (!await _context.Orders.AnyAsync(o => o.Id == model.OrderId))
                return BadRequest(new { message = "Đơn hàng không tồn tại" });

            // Kiểm tra sản phẩm tồn tại
            var product = await _context.Products.FindAsync(model.ProductId);
            if (product == null)
                return BadRequest(new { message = "Sản phẩm không tồn tại" });

            // Tự động lấy giá hiện tại nếu không truyền UnitPrice
            if (model.UnitPrice == 0)
                model.UnitPrice = product.Price;

            _context.OrderDetails.Add(model);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = model.Id }, model);
        }

        // PUT: api/orderdetails/5  (Cập nhật số lượng)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] OrderDetail model)
        {
            var existing = await _context.OrderDetails.FindAsync(id);
            if (existing == null)
                return NotFound(new { message = "Không tìm thấy chi tiết đơn hàng này" });

            existing.Quantity = model.Quantity;
            existing.UnitPrice = model.UnitPrice;
            await _context.SaveChangesAsync();

            return Ok(new { existing.Id, existing.Quantity, existing.UnitPrice, SubTotal = existing.Quantity * existing.UnitPrice });
        }

        // DELETE: api/orderdetails/5  (Xóa 1 dòng sản phẩm khỏi đơn)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var detail = await _context.OrderDetails.FindAsync(id);
            if (detail == null)
                return NotFound(new { message = "Không tìm thấy chi tiết đơn hàng này" });

            _context.OrderDetails.Remove(detail);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa thành công" });
        }
    }
}
