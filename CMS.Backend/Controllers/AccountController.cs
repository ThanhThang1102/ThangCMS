using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;
using CMS.Backend.Models;
using BCrypt.Net;

namespace CMS.Backend.Controllers
{
    public class AccountController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AccountController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Login(string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model, string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            if (ModelState.IsValid)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == model.Username);
                bool isPasswordValid = false;
                bool shouldMigrateHash = false;

                if (user != null)
                {
                    // Giải mã mật khẩu lưu dưới dạng AES
                    string decryptedPassword = Services.EncryptionHelper.Decrypt(user.PasswordHash);
                    if (decryptedPassword == model.Password)
                    {
                        isPasswordValid = true;
                    }
                    else
                    {
                        try
                        {
                            // Hỗ trợ tương thích ngược cho mật khẩu cũ lưu dạng BCrypt
                            if (user.PasswordHash != null && user.PasswordHash.StartsWith("$2") && BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
                            {
                                isPasswordValid = true;
                                shouldMigrateHash = true;
                            }
                        }
                        catch
                        {
                            // Bỏ qua lỗi nếu không phải định dạng BCrypt
                        }
                    }
                }

                if (isPasswordValid)
                {
                    if (shouldMigrateHash)
                    {
                        // Tự động nâng cấp mã hóa sang AES
                        user.PasswordHash = Services.EncryptionHelper.Encrypt(model.Password);
                        _context.Update(user);
                        await _context.SaveChangesAsync();
                    }

                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                        new Claim(ClaimTypes.Name, user.Username),
                        new Claim(ClaimTypes.GivenName, user.FullName ?? ""),
                        new Claim(ClaimTypes.Role, user.Role) // Quản trị viên, Biên tập viên
                    };

                    var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                    var principal = new ClaimsPrincipal(identity);

                    await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

                    if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                    {
                        return Redirect(returnUrl);
                    }

                    return RedirectToAction("Index", "Home");
                }

                ModelState.AddModelError(string.Empty, "Tên đăng nhập hoặc mật khẩu không hợp lệ.");
            }

            return View(model);
        }

        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                if (await _context.Users.AnyAsync(u => u.Username == model.Username))
                {
                    ModelState.AddModelError("Username", "Tên đăng nhập đã tồn tại.");
                    return View(model);
                }

                var user = new User
                {
                    Username = model.Username,
                    FullName = model.FullName,
                    PasswordHash = Services.EncryptionHelper.Encrypt(model.Password),
                    Role = "Biên tập viên" // Mặc định là Biên tập viên cho an toàn
                };

                // Nếu là user đầu tiên thì gán quyền Quản trị viên
                if (!await _context.Users.AnyAsync())
                {
                    user.Role = "Quản trị viên";
                }

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return RedirectToAction(nameof(Login));
            }

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction(nameof(Login));
        }

        [HttpGet]
        public IActionResult AccessDenied()
        {
            return View();
        }
    }
}
