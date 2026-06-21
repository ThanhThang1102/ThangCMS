using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/products")]
    [ApiController]
    public class ProductsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/products
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _context.Products
                .OrderByDescending(p => p.Id)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Price,
                    p.StockQuantity,
                    p.ImageUrl,
                    CategoryName = p.CategoryProduct != null ? p.CategoryProduct.Name : null
                })
                .ToListAsync();

            return Ok(products);
        }

        // GET: api/products/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _context.Products
                .Include(p => p.CategoryProduct)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm này" });

            return Ok(new
            {
                product.Id,
                product.Name,
                product.Description,
                product.Price,
                product.StockQuantity,
                product.ImageUrl,
                product.CategoryProductId,
                CategoryName = product.CategoryProduct?.Name
            });
        }

        // GET: api/products/newest
        [HttpGet("newest")]
        public async Task<IActionResult> GetNewest()
        {
            var products = await _context.Products
                .OrderByDescending(p => p.Id)
                .Take(3)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.StockQuantity,
                    p.ImageUrl,
                    CategoryName = p.CategoryProduct != null ? p.CategoryProduct.Name : null
                })
                .ToListAsync();

            return Ok(products);
        }

        // GET: api/products/bestsellers
        [HttpGet("bestsellers")]
        public async Task<IActionResult> GetBestSellers()
        {
            var bestSellingProductIds = await _context.OrderDetails
                .GroupBy(od => od.ProductId)
                .OrderByDescending(g => g.Sum(od => od.Quantity))
                .Take(3)
                .Select(g => g.Key)
                .ToListAsync();

            var products = await _context.Products
                .Where(p => bestSellingProductIds.Contains(p.Id))
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.StockQuantity,
                    p.ImageUrl,
                    CategoryName = p.CategoryProduct != null ? p.CategoryProduct.Name : null
                })
                .ToListAsync();

            var orderedProducts = bestSellingProductIds
                .Select(id => products.FirstOrDefault(p => p.Id == id))
                .Where(p => p != null)
                .ToList();

            // Nếu chưa có đơn hàng nào, fallback lấy 3 sản phẩm bất kỳ
            if (!orderedProducts.Any())
            {
                var fallbackProducts = await _context.Products.Take(3)
                    .Select(p => new
                    {
                        p.Id,
                        p.Name,
                        p.Price,
                        p.StockQuantity,
                        p.ImageUrl,
                        CategoryName = p.CategoryProduct != null ? p.CategoryProduct.Name : null
                    })
                    .ToListAsync();
                return Ok(fallbackProducts);
            }

            return Ok(orderedProducts);
        }

        // GET: api/products/category/3
        [HttpGet("category/{categoryProductId}")]
        public async Task<IActionResult> GetByCategory(int categoryProductId)
        {
            var products = await _context.Products
                .Where(p => p.CategoryProductId == categoryProductId)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.StockQuantity,
                    p.ImageUrl
                })
                .ToListAsync();

            return Ok(products);
        }

        // POST: api/products
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Product model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Products.Add(model);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = model.Id }, model);
        }

        // PUT: api/products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Product model)
        {
            if (id != model.Id)
                return BadRequest(new { message = "ID không khớp" });

            var existing = await _context.Products.FindAsync(id);
            if (existing == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm này" });

            existing.Name = model.Name;
            existing.Description = model.Description;
            existing.Price = model.Price;
            existing.StockQuantity = model.StockQuantity;
            existing.ImageUrl = model.ImageUrl;
            existing.CategoryProductId = model.CategoryProductId;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // DELETE: api/products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm này" });

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa sản phẩm thành công" });
        }

        // GET: api/products/search?q=nabati
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            if (string.IsNullOrEmpty(q))
            {
                return Ok(new List<object>());
            }

            var products = await _context.Products
                .Where(p => p.Name.Contains(q) || (p.Description != null && p.Description.Contains(q)))
                .OrderByDescending(p => p.Id)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Price,
                    p.StockQuantity,
                    p.ImageUrl,
                    CategoryName = p.CategoryProduct != null ? p.CategoryProduct.Name : null
                })
                .ToListAsync();

            return Ok(products);
        }
    }
}
