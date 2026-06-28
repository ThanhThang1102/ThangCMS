using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using System.ComponentModel.DataAnnotations;
using CMS.Backend.Services;

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

            // Kiểm tra số điện thoại trùng
            if (await _context.Customers.AnyAsync(c => c.Phone == model.Phone))
                return BadRequest(new { message = "Số điện thoại này đã được đăng ký" });

            // Mã hóa mật khẩu lưu vào DB dưới dạng AES
            model.Password = Services.EncryptionHelper.Encrypt(model.Password);

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
        public async Task<IActionResult> Login([FromBody] CustomerLoginModel loginModel)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Email == loginModel.Email);

            bool isValid = false;
            bool shouldMigrate = false;

            if (customer != null)
            {
                // Thử giải mã mật khẩu AES
                string decrypted = Services.EncryptionHelper.Decrypt(customer.Password);
                if (decrypted == loginModel.Password)
                {
                    isValid = true;
                    // Nếu giải mã thất bại và trả về chính chuỗi DB, chứng tỏ đó là mật khẩu thô cần migrate
                    if (decrypted == customer.Password)
                    {
                        shouldMigrate = true;
                    }
                }
                else if (customer.Password == loginModel.Password)
                {
                    // Hỗ trợ đăng nhập với mật khẩu thô cũ của khách hàng
                    isValid = true;
                    shouldMigrate = true;
                }
            }

            if (!isValid || customer == null)
            {
                return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác" });
            }

            if (shouldMigrate)
            {
                // Tự động nâng cấp mật khẩu khách hàng sang AES
                customer.Password = Services.EncryptionHelper.Encrypt(loginModel.Password);
                _context.Update(customer);
                await _context.SaveChangesAsync();
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
        public async Task<IActionResult> Update(int id, [FromBody] CustomerUpdateModel model)
        {
            if (id != model.Id)
                return BadRequest(new { message = "ID không khớp" });

            var existing = await _context.Customers.FindAsync(id);
            if (existing == null)
                return NotFound(new { message = "Không tìm thấy khách hàng này" });

            // Kiểm tra email trùng với tài khoản khác
            if (await _context.Customers.AnyAsync(c => c.Email == model.Email && c.Id != id))
                return BadRequest(new { message = "Email này đã được sử dụng bởi khách hàng khác" });

            // Kiểm tra số điện thoại trùng với tài khoản khác
            if (await _context.Customers.AnyAsync(c => c.Phone == model.Phone && c.Id != id))
                return BadRequest(new { message = "Số điện thoại này đã được sử dụng bởi khách hàng khác" });

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

        // POST: api/customers/forgot-password
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModel model, [FromServices] IEmailService emailService)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Email == model.Email);

            if (customer == null)
            {
                return BadRequest(new { message = "Email này không tồn tại trong hệ thống." });
            }

            // Sinh mật khẩu ngẫu nhiên tạm thời (8 ký tự)
            string newPassword = GenerateTemporaryPassword();

            // Mã hóa AES lưu vào DB
            customer.Password = Services.EncryptionHelper.Encrypt(newPassword);
            _context.Update(customer);
            await _context.SaveChangesAsync();

            // Gửi email mật khẩu mới
            await emailService.SendPasswordResetAsync(customer.Email, newPassword);

            return Ok(new { message = "Mật khẩu mới đã được gửi tới địa chỉ email của bạn. Vui lòng kiểm tra hộp thư." });
        }

        private string GenerateTemporaryPassword()
        {
            var random = new Random();
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            return new string(Enumerable.Repeat(chars, 8)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        // POST: api/customers/{id}/change-password
        [HttpPost("{id}/change-password")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return NotFound(new { message = "Không tìm thấy khách hàng này" });

            // Thử giải mã mật khẩu hiện tại trong DB để so khớp
            string decrypted = Services.EncryptionHelper.Decrypt(customer.Password);
            bool isValid = false;

            if (decrypted == model.CurrentPassword)
            {
                isValid = true;
            }
            else if (customer.Password == model.CurrentPassword)
            {
                // Fallback nếu mật khẩu cũ trong DB lưu dạng thô
                isValid = true;
            }

            if (!isValid)
            {
                return BadRequest(new { message = "Mật khẩu hiện tại không chính xác" });
            }

            if (model.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 6 ký tự" });
            }

            // Mã hóa mật khẩu mới dưới dạng AES và lưu trữ
            customer.Password = Services.EncryptionHelper.Encrypt(model.NewPassword);
            _context.Update(customer);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thay đổi mật khẩu thành công!" });
        }
    }

    public class CustomerLoginModel
    {
        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        public string Password { get; set; }
    }

    public class CustomerUpdateModel
    {
        [Required(ErrorMessage = "ID là bắt buộc")]
        public int Id { get; set; }

        [Required(ErrorMessage = "Họ tên là bắt buộc")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; }

        public string? Phone { get; set; }

        public string? Address { get; set; }
    }

    public class ForgotPasswordModel
    {
        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; }
    }

    public class ChangePasswordModel
    {
        [Required(ErrorMessage = "Mật khẩu hiện tại là bắt buộc")]
        public string CurrentPassword { get; set; }

        [Required(ErrorMessage = "Mật khẩu mới là bắt buộc")]
        [MinLength(6, ErrorMessage = "Mật khẩu mới phải có tối thiểu 6 ký tự")]
        public string NewPassword { get; set; }
    }
}

