using CMS.Data.Entities;
using System.Threading.Tasks;

namespace CMS.Backend.Services
{
    public interface IEmailService
    {
        Task SendOrderConfirmationAsync(string toEmail, Order order);
        Task SendPasswordResetAsync(string toEmail, string newPassword);
    }
}
