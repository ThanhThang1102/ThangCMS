using CMS.Data;
using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace CMS.Backend.Services
{
    public class EmailService : IEmailService
    {
        private readonly ApplicationDbContext _context;

        public EmailService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SendOrderConfirmationAsync(string toEmail, Order order)
        {
            try
            {
                // Nạp đầy đủ thông tin đơn hàng cùng thông tin khách hàng và sản phẩm
                var dbOrder = await _context.Orders
                    .Include(o => o.Customer)
                    .Include(o => o.OrderDetails)
                        .ThenInclude(d => d.Product)
                    .FirstOrDefaultAsync(o => o.Id == order.Id);

                if (dbOrder == null)
                {
                    Console.WriteLine($"[EMAIL ERROR] Không tìm thấy đơn hàng ID {order.Id} trong Database để gửi email.");
                    return;
                }

                string subject = $"[Nabati Store] Xác nhận đơn đặt hàng #{dbOrder.Id}";
                string body = GenerateHtmlEmailBody(dbOrder);

                using (var message = new MailMessage())
                {
                    message.To.Add(new MailAddress(toEmail));
                    // Người gửi hiển thị tên đại diện là "Nabati Store"
                    message.From = new MailAddress("thuong06092011@gmail.com", "Nabati Store");
                    message.Subject = subject;
                    message.Body = body;
                    message.IsBodyHtml = true;

                    using (var smtp = new SmtpClient())
                    {
                        smtp.Host = "smtp.gmail.com";
                        smtp.Port = 587;
                        smtp.EnableSsl = true;
                        smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                        smtp.UseDefaultCredentials = false;
                        smtp.Credentials = new NetworkCredential("thuong06092011@gmail.com", "nidc pzvv xuqx udih");

                        await smtp.SendMailAsync(message);
                    }
                }

                Console.WriteLine($"[EMAIL SENT SUCCESS] Đơn hàng #{dbOrder.Id} đã gửi thư xác nhận thành công tới {toEmail}.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL ERROR Exception] Thất bại khi gửi email đơn hàng #{order.Id}: {ex.Message}");
            }
        }

        private string GenerateHtmlEmailBody(Order order)
        {
            var customer = order.Customer;
            var details = order.OrderDetails ?? new List<OrderDetail>();
            decimal totalAmount = details.Sum(d => d.Quantity * d.UnitPrice);

            var sb = new StringBuilder();
            sb.Append(@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f7f9fc;
            margin: 0;
            padding: 0;
            color: #333333;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            border: 1px solid #eef2f6;
        }
        .header {
            background: linear-gradient(135deg, #ff9800, #f57c00);
            color: #ffffff;
            padding: 35px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #2c3e50;
        }
        .greeting-desc {
            font-size: 14px;
            color: #7f8c8d;
            margin-bottom: 25px;
            line-height: 1.5;
        }
        .info-card {
            background-color: #fcf8f2;
            border-left: 4px solid #ff9800;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 30px;
        }
        .info-card h3 {
            margin: 0 0 12px 0;
            color: #d35400;
            font-size: 16px;
            font-weight: 600;
        }
        .table-title {
            font-size: 16px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 15px;
            border-bottom: 2px solid #f1f2f6;
            padding-bottom: 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        th {
            background-color: #f8f9fa;
            color: #2c3e50;
            font-weight: 600;
            text-align: left;
            padding: 12px;
            font-size: 13px;
            border-bottom: 2px solid #eef2f6;
        }
        td {
            padding: 14px 12px;
            font-size: 14px;
            border-bottom: 1px solid #f1f2f6;
            color: #4a4a4a;
        }
        .total-row td {
            font-weight: bold;
            font-size: 16px;
            color: #2c3e50;
            border-top: 2px solid #ff9800;
            border-bottom: none;
            padding-top: 15px;
        }
        .price-highlight {
            color: #e67e22;
            font-weight: 700;
        }
        .notes-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            font-size: 13px;
            color: #666;
            margin-bottom: 30px;
            border: 1px dashed #e4e7eb;
        }
        .notes-title {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .footer {
            background-color: #f1f2f6;
            padding: 25px;
            text-align: center;
            font-size: 12px;
            color: #95a5a6;
            line-height: 1.5;
        }
        .footer a {
            color: #ff9800;
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>CẢM ƠN BẠN ĐÃ MUA HÀNG!</h1>
            <p>Mã đơn hàng: #");
            sb.Append(order.Id);
            sb.Append(@" | Đặt ngày: ");
            sb.Append(order.OrderDate.ToString("dd/MM/yyyy HH:mm"));
            sb.Append(@"</p>
        </div>
        <div class='content'>
            <div class='greeting'>Xin chào ");
            sb.Append(customer?.FullName ?? "Quý khách");
            sb.Append(@",</div>
            <div class='greeting-desc'>
                Đơn đặt hàng của bạn đã được tiếp nhận và đang trong trạng thái chờ xét duyệt. Chúng tôi sẽ sớm liên hệ với bạn để xác nhận thông tin giao hàng.
            </div>

            <div class='info-card'>
                <h3>Thông Tin Giao Hàng</h3>
                <div style='font-size: 14px; line-height: 1.6;'>
                    <div><strong>Họ và tên:</strong> ");
            sb.Append(customer?.FullName ?? "N/A");
            sb.Append(@"</div>
                    <div><strong>Số điện thoại:</strong> ");
            sb.Append(customer?.Phone ?? "N/A");
            sb.Append(@"</div>
                    <div><strong>Địa chỉ:</strong> ");
            sb.Append(customer?.Address ?? "N/A");
            sb.Append(@"</div>
                </div>
            </div>

            <div class='table-title'>Chi Tiết Đơn Hàng</div>
            <table>
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th style='width: 70px; text-align: center;'>SL</th>
                        <th style='width: 100px; text-align: right;'>Đơn giá</th>
                        <th style='width: 110px; text-align: right;'>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>");

            foreach (var detail in details)
            {
                var productName = detail.Product?.Name ?? $"Sản phẩm #{detail.ProductId}";
                var subtotal = detail.Quantity * detail.UnitPrice;
                sb.Append(@"
                    <tr>
                        <td><strong>");
                sb.Append(productName);
                sb.Append(@"</strong></td>
                        <td style='text-align: center;'>");
                sb.Append(detail.Quantity);
                sb.Append(@"</td>
                        <td style='text-align: right;'>");
                sb.Append(detail.UnitPrice.ToString("N0"));
                sb.Append(@" đ</td>
                        <td style='text-align: right; font-weight: 600;'>");
                sb.Append(subtotal.ToString("N0"));
                sb.Append(@" đ</td>
                    </tr>");
            }

            sb.Append(@"
                    <tr class='total-row'>
                        <td colspan='2'></td>
                        <td style='text-align: right;'>Tổng cộng:</td>
                        <td style='text-align: right;' class='price-highlight'>");
            sb.Append(totalAmount.ToString("N0"));
            sb.Append(@" đ</td>
                    </tr>
                </tbody>
            </table>");

            if (!string.IsNullOrEmpty(order.Notes))
            {
                sb.Append(@"
            <div class='notes-section'>
                <div class='notes-title'>Ghi chú giao hàng:</div>
                <div>");
                sb.Append(order.Notes);
                sb.Append(@"</div>
            </div>");
            }

            sb.Append(@"
        </div>
        <div class='footer'>
            <p>Đây là email tự động từ <strong>Nabati Store</strong>. Vui lòng không phản hồi email này.</p>
            <p>Mọi thắc mắc xin liên hệ Hotline: <strong>1900xxxx</strong> hoặc truy cập <a href='http://localhost:3000'>Cửa hàng của chúng tôi</a>.</p>
        </div>
    </div>
</body>
</html>");

            return sb.ToString();
        }

        public async Task SendPasswordResetAsync(string toEmail, string newPassword)
        {
            try
            {
                string subject = "[Nabati Store] Yêu cầu khôi phục mật khẩu tài khoản";
                string body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f7f9fc;
            margin: 0;
            padding: 0;
            color: #333333;
        }}
        .container {{
            max-width: 550px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            border: 1px solid #eef2f6;
        }}
        .header {{
            background: linear-gradient(135deg, #ff9800, #f57c00);
            color: #ffffff;
            padding: 35px 20px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }}
        .content {{
            padding: 30px;
        }}
        .greeting {{
            font-size: 17px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #2c3e50;
        }}
        .desc {{
            font-size: 14px;
            color: #555555;
            line-height: 1.6;
            margin-bottom: 25px;
        }}
        .password-box {{
            background-color: #fcf8f2;
            border: 1.5px dashed #ff9800;
            padding: 18px;
            border-radius: 8px;
            text-align: center;
            font-size: 22px;
            font-weight: 700;
            color: #d35400;
            letter-spacing: 1px;
            margin-bottom: 25px;
        }}
        .warning-text {{
            font-size: 12px;
            color: #95a5a6;
            line-height: 1.5;
            margin-bottom: 30px;
            border-top: 1px solid #f1f2f6;
            padding-top: 15px;
        }}
        .footer {{
            background-color: #f1f2f6;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #95a5a6;
            line-height: 1.5;
        }}
        .footer a {{
            color: #ff9800;
            text-decoration: none;
            font-weight: 600;
        }}
        .btn-login {{
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #ff9800, #f57c00);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 25px;
            box-shadow: 0 4px 10px rgba(245, 124, 0, 0.25);
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>KHÔI PHỤC MẬT KHẨU</h1>
        </div>
        <div class='content' style='text-align: center;'>
            <div class='greeting' style='text-align: left;'>Xin chào,</div>
            <div class='desc' style='text-align: left;'>
                Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn tại <strong>Nabati Store</strong>. Dưới đây là mật khẩu đăng nhập tạm thời mới được cấp riêng cho bạn:
            </div>
            
            <div class='password-box'>
                {newPassword}
            </div>

            <a href='http://localhost:3000/dang-nhap' class='btn-login'>Đăng Nhập Ngay</a>
            
            <div class='warning-text' style='text-align: left;'>
                * Để đảm bảo an toàn, vui lòng đăng nhập ngay lập tức bằng mật khẩu tạm thời này, sau đó truy cập vào trang <strong>Hồ sơ cá nhân (Thông tin tài khoản)</strong> để tiến hành thay đổi lại mật khẩu của bạn.
            </div>
        </div>
        <div class='footer'>
            <p>Đây là email tự động từ <strong>Nabati Store</strong>. Vui lòng không phản hồi email này.</p>
            <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua thư này hoặc liên hệ bộ phận hỗ trợ khách hàng của chúng tôi.</p>
        </div>
    </div>
</body>
</html>";

                using (var message = new MailMessage())
                {
                    message.To.Add(new MailAddress(toEmail));
                    message.From = new MailAddress("thuong06092011@gmail.com", "Nabati Store");
                    message.Subject = subject;
                    message.Body = body;
                    message.IsBodyHtml = true;

                    using (var smtp = new SmtpClient())
                    {
                        smtp.Host = "smtp.gmail.com";
                        smtp.Port = 587;
                        smtp.EnableSsl = true;
                        smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                        smtp.UseDefaultCredentials = false;
                        smtp.Credentials = new NetworkCredential("thuong06092011@gmail.com", "nidc pzvv xuqx udih");

                        await smtp.SendMailAsync(message);
                    }
                }

                Console.WriteLine($"[EMAIL SENT SUCCESS] Khôi phục mật khẩu gửi thành công tới {toEmail}.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL ERROR Exception] Thất bại khi gửi email khôi phục mật khẩu tới {toEmail}: {ex.Message}");
            }
        }
    }
}
