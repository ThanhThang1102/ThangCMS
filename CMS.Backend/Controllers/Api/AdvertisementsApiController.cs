using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CMS.Data;
using CMS.Data.Entities;

namespace CMS.Backend.Controllers.Api
{
    [Route("api/advertisements")]
    [ApiController]
    public class AdvertisementsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdvertisementsApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/advertisements
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var ads = await _context.Advertisements
                .Where(a => a.IsActive)
                .OrderBy(a => a.DisplayOrder)
                .Select(a => new
                {
                    a.Id,
                    a.Title,
                    a.Description,
                    a.ImageUrl,
                    a.TargetLink
                })
                .ToListAsync();

            return Ok(ads);
        }
    }
}
