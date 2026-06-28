using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Quản trị viên,Admin")]
    public class CustomersController : Controller
    {
        private readonly ApplicationDbContext _context;

        public CustomersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Customers
        public async Task<IActionResult> Index()
        {
            return View(await _context.Customers.ToListAsync());
        }

        // GET: Customers/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var customer = await _context.Customers
                .Include(c => c.Orders)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (customer == null)
            {
                return NotFound();
            }

            customer.Password = Services.EncryptionHelper.Decrypt(customer.Password);
            return View(customer);
        }

        // GET: Customers/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Customers/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,FullName,Email,Phone,Address,Password")] Customer customer)
        {
            if (await _context.Customers.AnyAsync(c => c.Email == customer.Email))
            {
                ModelState.AddModelError("Email", "Địa chỉ Email này đã được sử dụng.");
            }
            if (await _context.Customers.AnyAsync(c => c.Phone == customer.Phone))
            {
                ModelState.AddModelError("Phone", "Số điện thoại này đã được sử dụng.");
            }

            if (string.IsNullOrEmpty(customer.Password) || customer.Password.Length < 6)
            {
                ModelState.AddModelError("Password", "Mật khẩu phải có tối thiểu 6 ký tự.");
            }

            if (ModelState.IsValid)
            {
                customer.Password = Services.EncryptionHelper.Encrypt(customer.Password);
                _context.Add(customer);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(customer);
        }

        // GET: Customers/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound();
            }
            customer.Password = Services.EncryptionHelper.Decrypt(customer.Password);
            return View(customer);
        }

        // POST: Customers/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,FullName,Email,Phone,Address,Password")] Customer customer)
        {
            if (id != customer.Id)
            {
                return NotFound();
            }

            if (await _context.Customers.AnyAsync(c => c.Email == customer.Email && c.Id != customer.Id))
            {
                ModelState.AddModelError("Email", "Địa chỉ Email này đã được sử dụng bởi khách hàng khác.");
            }
            if (await _context.Customers.AnyAsync(c => c.Phone == customer.Phone && c.Id != customer.Id))
            {
                ModelState.AddModelError("Phone", "Số điện thoại này đã được sử dụng bởi khách hàng khác.");
            }

            if (string.IsNullOrEmpty(customer.Password) || customer.Password.Length < 6)
            {
                ModelState.AddModelError("Password", "Mật khẩu phải có tối thiểu 6 ký tự.");
            }

            if (ModelState.IsValid)
            {
                try
                {
                    customer.Password = Services.EncryptionHelper.Encrypt(customer.Password);
                    _context.Update(customer);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!CustomerExists(customer.Id))
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
            return View(customer);
        }

        // GET: Customers/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var customer = await _context.Customers
                .FirstOrDefaultAsync(m => m.Id == id);
            if (customer == null)
            {
                return NotFound();
            }

            return View(customer);
        }

        // POST: Customers/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer != null)
            {
                _context.Customers.Remove(customer);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }

        private bool CustomerExists(int id)
        {
            return _context.Customers.Any(e => e.Id == id);
        }
    }
}
