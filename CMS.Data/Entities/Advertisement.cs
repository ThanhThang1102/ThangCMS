using System;
using System.ComponentModel.DataAnnotations;

namespace CMS.Data.Entities
{
    public class Advertisement
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; }

        public string? Description { get; set; }

        [Required]
        public string ImageUrl { get; set; }

        public string? TargetLink { get; set; }

        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
