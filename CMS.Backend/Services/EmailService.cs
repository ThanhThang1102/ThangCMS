using CMS.Data.Entities;
using System;
using System.Threading.Tasks;

namespace CMS.Backend.Services
{
    public class EmailService : IEmailService
    {
        public Task SendOrderConfirmationAsync(string toEmail, Order order)
        {
            // MOCK: Giả lập việc gửi email bằng cách in ra màn hình Console.
            // Trong thực tế, bạn sẽ dùng SmtpClient hoặc MailKit ở đây.
            Console.WriteLine("==================================================");
            Console.WriteLine($"[EMAIL SENT] Đã gửi thông báo đơn hàng #{order.Id}");
            Console.WriteLine($"Đến địa chỉ: {toEmail}");
            Console.WriteLine($"Thời gian đặt: {order.OrderDate}");
            Console.WriteLine($"Trạng thái: {(order.Status == 0 ? "Chờ duyệt" : "Khác")}");
            Console.WriteLine("Cảm ơn bạn đã mua hàng tại Nabati Store!");
            Console.WriteLine("==================================================");

            return Task.CompletedTask;
        }
    }
}
