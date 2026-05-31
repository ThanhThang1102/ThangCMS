using System.Diagnostics;
using CMS.Backend.Models;
using CMS.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _context;

        public HomeController(ILogger<HomeController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            ViewBag.TotalCategories = await _context.Categories.CountAsync();
            ViewBag.TotalPosts = await _context.Posts.CountAsync();
            ViewBag.TotalProducts = await _context.Products.CountAsync();
            ViewBag.TotalCustomers = await _context.Customers.CountAsync();
            ViewBag.TotalOrders = await _context.Orders.CountAsync();
            
            // Tính tổng doanh thu từ các đơn hàng đã hoàn thành (Status = 2)
            ViewBag.TotalRevenue = await _context.OrderDetails
                .Where(od => od.Order != null && od.Order.Status == 2)
                .SumAsync(od => (decimal?)(od.Quantity * od.UnitPrice)) ?? 0;

            // Lấy danh sách 5 đơn hàng mới nhất
            var recentOrders = await _context.Orders
                .Include(o => o.Customer)
                .OrderByDescending(o => o.OrderDate)
                .Take(5)
                .ToListAsync();

            return View(recentOrders);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
