using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Quản trị viên,Admin")]
    public class OrdersController : Controller
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Orders
        public async Task<IActionResult> Index()
        {
            var orders = _context.Orders.Include(o => o.Customer);
            return View(await orders.ToListAsync());
        }

        // GET: Orders/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails!)
                    .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(m => m.Id == id);
            
            if (order == null)
            {
                return NotFound();
            }

            // Tính tổng giá trị đơn hàng
            decimal totalOrderValue = 0;
            if (order.OrderDetails != null)
            {
                totalOrderValue = order.OrderDetails.Sum(od => od.Quantity * od.UnitPrice);
            }
            ViewBag.TotalOrderValue = totalOrderValue;

            return View(order);
        }

        // GET: Orders/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails!)
                    .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }
            
            // Chuẩn bị SelectList cho Trạng thái
            var statusList = new[]
            {
                new { Value = 0, Text = "Chờ duyệt" },
                new { Value = 1, Text = "Đang giao" },
                new { Value = 2, Text = "Đã xong" }
            };
            ViewBag.StatusList = new SelectList(statusList, "Value", "Text", order.Status);

            return View(order);
        }

        // POST: Orders/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,OrderDate,CustomerId,Status,Notes")] Order order)
        {
            if (id != order.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    // Lấy đơn hàng hiện tại để cập nhật tránh ghi đè các trường khác không có trong form
                    var existingOrder = await _context.Orders.FindAsync(id);
                    if (existingOrder == null)
                    {
                        return NotFound();
                    }

                    existingOrder.Status = order.Status;
                    existingOrder.Notes = order.Notes;

                    _context.Update(existingOrder);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!OrderExists(order.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            
            var statusList = new[]
            {
                new { Value = 0, Text = "Chờ duyệt" },
                new { Value = 1, Text = "Đang giao" },
                new { Value = 2, Text = "Đã xong" }
            };
            ViewBag.StatusList = new SelectList(statusList, "Value", "Text", order.Status);
            return View(order);
        }

        // GET: Orders/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var order = await _context.Orders
                .Include(o => o.Customer)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (order == null)
            {
                return NotFound();
            }

            return View(order);
        }

        // POST: Orders/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order != null)
            {
                // Xóa các chi tiết đơn hàng trước để tránh lỗi khóa ngoại
                if (order.OrderDetails != null && order.OrderDetails.Any())
                {
                    _context.OrderDetails.RemoveRange(order.OrderDetails);
                }
                
                _context.Orders.Remove(order);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.Id == id);
        }
    }
}
