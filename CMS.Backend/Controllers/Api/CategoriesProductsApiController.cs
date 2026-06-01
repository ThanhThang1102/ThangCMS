using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using System.Linq;
using System.Threading.Tasks;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/categoriesproducts")]
    [ApiController]
    public class CategoriesProductsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesProductsApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _context.CategoriesProducts
                .OrderByDescending(c => c.Id)
                .Select(c => new {            
                    c.Id, 
                    c.Name, 
                    c.Description
                })
                .ToListAsync();

            return Ok(categories); 
        }
    }
}
