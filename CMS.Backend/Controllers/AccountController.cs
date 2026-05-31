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
                if (user != null && BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
                {
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
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password),
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
