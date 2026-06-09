# Nabati Store E-Commerce (ThangCMS Solution)

Chào mừng đến với hệ thống website Thương mại điện tử **Nabati Store**. Dự án này được chia thành 2 phần chính: Frontend (Giao diện mua hàng dành cho khách) và Backend (Hệ thống Quản trị + RESTful API).

## Tính năng nổi bật
- **Giao diện Mua Hàng (React Frontend)**: Năng động, tốc độ tải nhanh, màu sắc chủ đạo Vàng-Cam mang thương hiệu bánh Nabati.
- **Trang chủ Thông minh**: Slider Banner tự động lấy từ DB, danh sách Sản phẩm Mới nhất & Bán chạy nhất tự động tổng hợp từ lịch sử đơn hàng thực tế.
- **Tính năng Đặt Hàng & Kho**: Tự động trừ số lượng sản phẩm tồn kho khi khách hàng đặt hàng thành công. Gửi thông báo mô phỏng qua Email.
- **Hệ thống Quản trị (Admin Panel MVC)**: Dễ dàng quản lý Sản phẩm, Danh mục, Đơn hàng, Tin tức, và cả Banner hiển thị tại trang chủ.
- **Upload File**: Hỗ trợ Upload ảnh Banner, Sản phẩm, Bài viết ngay trong trang Admin.

## Yêu cầu Hệ thống
Để chạy dự án, bạn cần cài đặt:
1. **.NET 8.0 SDK**
2. **Node.js** (Khuyên dùng bản LTS)
3. **SQL Server** (Hoặc SQL Server Express / LocalDB)

---

## Hướng dẫn Cài đặt & Chạy Dự Án

### Bước 1: Cấu hình Cơ sở dữ liệu (Database)
1. Mở file `CMS.Backend/appsettings.json`.
2. Kiểm tra chuỗi kết nối `DefaultConnection`. Mặc định đang thiết lập là:
   `Server=.;Database=ThangCMS_DB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True`
3. Vui lòng thay đổi lại `Server=...` để trỏ tới SQL Server trên máy tính của bạn (vd: `Server=.\\SQLEXPRESS`).

**Cập nhật Database:**
1. Mở Terminal / Command Prompt tại thư mục `CMS.Backend`.
2. Chạy lệnh:
   ```bash
   dotnet ef database update
   ```
*(Lệnh này sẽ tự động tạo bảng dữ liệu dựa trên Entity Framework Core)*

### Bước 2: Chạy Backend (API & Admin Panel)
1. Mở Terminal tại thư mục `CMS.Backend`.
2. Khởi động Backend bằng lệnh:
   ```bash
   dotnet run
   ```
3. Backend sẽ chạy tại: **http://localhost:5035**
   - **Giao diện Admin:** `http://localhost:5035/Account/Login`
   - *Lưu ý: Bạn có thể đăng ký một tài khoản ban đầu và xét role "Quản trị viên" trong Database để đăng nhập.*

### Bước 3: Chạy Frontend (Giao diện React)
1. Mở một Terminal khác tại thư mục `CMS.Frontend`.
2. Cài đặt các gói thư viện (nếu chạy lần đầu):
   ```bash
   npm install
   ```
3. Khởi động Frontend:
   ```bash
   npm run dev
   ```
4. Frontend sẽ chạy tại: **http://localhost:3000**

---

## Cấu trúc Mã Nguồn (Thư mục)
```
ThangCMS_Solution/
├── CMS.Backend/         # Nơi chứa mã nguồn Web API và Giao diện MVC Admin
│   ├── Controllers/     # Logic xử lý API và Admin
│   ├── Views/           # Giao diện Razor của khu vực Quản trị Admin
│   ├── wwwroot/         # Chứa hình ảnh, JS, CSS của Admin và Ảnh Upload
│   └── appsettings.json # File cấu hình kết nối Database
├── CMS.Data/            # Thư viện dùng chung (Entity, DbContext, Migrations)
└── CMS.Frontend/        # Nơi chứa mã nguồn ReactJS của khách hàng
    ├── src/
    │   ├── components/  # Các thẻ thành phần: Navbar, Footer, Banner...
    │   ├── pages/       # Các màn hình chính (HomePage, ShopPage, CartPage...)
    │   └── services/    # Hàm kết nối API gọi về CMS.Backend
    └── package.json
```

## Lưu ý Quản trị Banner
- Trong màn hình Admin, bạn có thể tải lên file hình ảnh khi **Thêm mới Banner**.
- Sau khi thêm thành công, vui lòng Reset lại trang chủ React `http://localhost:3000` để xem kết quả.
- Kích thước Banner đề nghị: Tỷ lệ ngang (vd: 1920x800 hoặc 1200x500).

*Chúc bạn trải nghiệm ThangCMS vui vẻ!*
