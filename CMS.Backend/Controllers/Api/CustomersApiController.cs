using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/customers")]
    [ApiController]
    public class CustomersApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CustomersApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/customers
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var customers = await _context.Customers
                .OrderByDescending(c => c.Id)
                .Select(c => new
                {
                    c.Id,
                    c.FullName,
                    c.Email,
                    c.Phone,
                    c.Address,
                    OrderCount = c.Orders != null ? c.Orders.Count : 0
                    // Không trả về Password vì lý do bảo mật
                })
                .ToListAsync();

            return Ok(customers);
        }

        // GET: api/customers/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var customer = await _context.Customers
                .Include(c => c.Orders)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (customer == null)
                return NotFound(new { message = "Không tìm thấy khách hàng này" });

            return Ok(new
            {
                customer.Id,
                customer.FullName,
                customer.Email,
                customer.Phone,
                customer.Address,
                Orders = customer.Orders?.Select(o => new
                {
                    o.Id,
                    o.OrderDate,
                    o.Status,
                    StatusText = o.Status == 0 ? "Chờ duyệt" : o.Status == 1 ? "Đang giao" : "Đã hoàn thành"
                })
            });
        }

        // POST: api/customers
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Customer model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kiểm tra email trùng
            if (await _context.Customers.AnyAsync(c => c.Email == model.Email))
                return BadRequest(new { message = "Email này đã được đăng ký" });

            _context.Customers.Add(model);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = model.Id }, new
            {
                model.Id,
                model.FullName,
                model.Email,
                model.Phone,
                model.Address
            });
        }

        // POST: api/customers/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Customer loginModel)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Email == loginModel.Email && c.Password == loginModel.Password);

            if (customer == null)
            {
                return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác" });
            }

            return Ok(new
            {
                customer.Id,
                customer.FullName,
                customer.Email,
                customer.Phone,
                customer.Address
            });
        }

        // PUT: api/customers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Customer model)
        {
            if (id != model.Id)
                return BadRequest(new { message = "ID không khớp" });

            var existing = await _context.Customers.FindAsync(id);
            if (existing == null)
                return NotFound(new { message = "Không tìm thấy khách hàng này" });

            existing.FullName = model.FullName;
            existing.Email = model.Email;
            existing.Phone = model.Phone;
            existing.Address = model.Address;

            await _context.SaveChangesAsync();
            return Ok(new { existing.Id, existing.FullName, existing.Email, existing.Phone, existing.Address });
        }

        // DELETE: api/customers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return NotFound(new { message = "Không tìm thấy khách hàng này" });

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa khách hàng thành công" });
        }
    }
}
