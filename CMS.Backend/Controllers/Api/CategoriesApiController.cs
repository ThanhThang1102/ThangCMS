using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/categories")]
    [ApiController]
    public class CategoriesApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/categories
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _context.Categories
                .OrderBy(c => c.Name)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description,
                    PostCount = c.Posts != null ? c.Posts.Count : 0
                })
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/categories/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Posts)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return NotFound(new { message = "Không tìm thấy danh mục này" });

            return Ok(new
            {
                category.Id,
                category.Name,
                category.Description,
                Posts = category.Posts?.Select(p => new { p.Id, p.Title, p.CreatedDate })
            });
        }

        // POST: api/categories
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Category model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Categories.Add(model);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = model.Id }, model);
        }

        // PUT: api/categories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Category model)
        {
            if (id != model.Id)
                return BadRequest(new { message = "ID không khớp" });

            var existing = await _context.Categories.FindAsync(id);
            if (existing == null)
                return NotFound(new { message = "Không tìm thấy danh mục này" });

            existing.Name = model.Name;
            existing.Description = model.Description;
            await _context.SaveChangesAsync();

            return Ok(existing);
        }

        // DELETE: api/categories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound(new { message = "Không tìm thấy danh mục này" });

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa danh mục thành công" });
        }
    }
}
