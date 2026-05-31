using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers
{
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class CategoriesProductsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public CategoriesProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: CategoriesProducts
        public async Task<IActionResult> Index()
        {
            return View(await _context.CategoriesProducts.ToListAsync());
        }

        // GET: CategoriesProducts/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var categoryProduct = await _context.CategoriesProducts
                .Include(c => c.Products)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (categoryProduct == null)
            {
                return NotFound();
            }

            return View(categoryProduct);
        }

        // GET: CategoriesProducts/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: CategoriesProducts/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,Name,Description")] CategoryProduct categoryProduct)
        {
            if (ModelState.IsValid)
            {
                _context.Add(categoryProduct);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(categoryProduct);
        }

        // GET: CategoriesProducts/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var categoryProduct = await _context.CategoriesProducts.FindAsync(id);
            if (categoryProduct == null)
            {
                return NotFound();
            }
            return View(categoryProduct);
        }

        // POST: CategoriesProducts/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,Name,Description")] CategoryProduct categoryProduct)
        {
            if (id != categoryProduct.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(categoryProduct);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!CategoryProductExists(categoryProduct.Id))
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
            return View(categoryProduct);
        }

        // GET: CategoriesProducts/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var categoryProduct = await _context.CategoriesProducts
                .FirstOrDefaultAsync(m => m.Id == id);
            if (categoryProduct == null)
            {
                return NotFound();
            }

            return View(categoryProduct);
        }

        // POST: CategoriesProducts/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var categoryProduct = await _context.CategoriesProducts.FindAsync(id);
            if (categoryProduct != null)
            {
                _context.CategoriesProducts.Remove(categoryProduct);
                await _context.SaveChangesAsync();
            }
            return RedirectToAction(nameof(Index));
        }

        private bool CategoryProductExists(int id)
        {
            return _context.CategoriesProducts.Any(e => e.Id == id);
        }
    }
}
