using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using System.Linq;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/posts")]
    [ApiController]
    public class PostsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PostsApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var posts = await _context.Posts
                .OrderByDescending(p => p.Id)
                .Select(p => new {            
                    p.Id, 
                    p.Title, 
                    p.ImageUrl, 
                    p.CreatedDate,
                    CategoryName = p.Category != null ? p.Category.Name : null
                })
                .ToListAsync();

            return Ok(posts); 
        }

        [HttpGet("category/{categoryId}")] 
        public async Task<IActionResult> GetByCategory(int categoryId)
        {
            var posts = await _context.Posts
                .Where(p => p.CategoryId == categoryId) 
                .Select(p => new { 
                    p.Id, 
                    p.Title, 
                    p.ImageUrl, 
                    p.CreatedDate
                })
                .ToListAsync();

            return Ok(posts); 
        }

        [HttpGet("{id}")] 
        public async Task<IActionResult> GetDetail(int id)
        {
            var post = await _context.Posts
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null) 
            {
                return NotFound(new { message = "Không tìm thấy bài viết này trong hệ thống" });
            }

            return Ok(post); 
        }
    }
}
