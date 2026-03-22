# Cấu Trúc Chức Năng Cốt Lõi - Frontend (React + Tailwind)

## 1. Giới Thiệu
Frontend của dự án TAPO là ứng dụng Single Page Application (SPA), hướng tới trải nghiệm người dùng hiện đại, tốc độ tải trang nhanh và giao diện đẹp mắt (`WOW Experience`). Dự án sử dụng **React 18+**, **Vite**, **Tailwind CSS** và bộ Component UI **shadcn/ui**.

## 2. Danh Sách Các Chức Năng Frontend (Modules)

### 2.1. Module Giao Diện Khách Hàng (Customer Storefront)
Dành cho Guest & Customer trải nghiệm.  
**Các tính năng nổi bật**:
- **Trang chủ tĩnh (Landing Home)**: Hiển thị Hero banner đẹp mắt, slide các Laptop Bán chạy, Flash sale đếm ngược thời gian.
- **Bộ Lọc Động (Dynamic Filters)**: Menu bên trái/popup hiển thị lọc sản phẩm mượt mà không tải lại trang (Client-side Search + Server-side Pagination).
- **Trang Chi Tiết (Product Detail)**: Hình ảnh Gallery zoom out/in, bảng thông số kỹ thuật dạng Tab, bảng so sánh ẩn/hiện popup. Box Comment/Reviews kèm hình ảnh.
- **Mini-cart / Giỏ hàng**: Animation mượt mà khi bấm "Thêm vào giỏ", tự động nhẩm tính tổng giá tiền và giảm giá.
- **Checkout & Chờ thanh toán**: Luồng thanh toán Multi-step (Giỏ -> Địa chỉ -> Mã giảm giá). Hiển thị QR Code thanh toán từ PayOS, tích hợp polling hoặc chờ WebSocket bắn notification báo "Thanh toán thành công".
- **Widget Chat Nổi (Floating Chat)**: Cửa sổ chat nhỏ ở góc dưới màn hình, tích hợp socket logic để tạo hội thoại trực tiếp.

### 2.2. Module Trang Cá Nhân (User Portal)
- Màn hình Auth bọc Form validation (Zod + React Hook Form).
- Dashboard nhỏ cho khách đăng nhập: Xem vị trí đơn hàng qua Timeline step.
- Hỗ trợ điền form trả góp, tạo yêu cầu hỗ trợ bảo hành / Cancel order.

### 2.3. Module Trang Quản Trị (Admin Dashboard / Backoffice)
Dành riêng cho Staffs & Admin truy cập thông qua Private Routes (cần verify JWT Token với role cao hơn Customer).
- **Sidebar & Layout**: Thanh điều hướng bên menu chuyên nghiệp.
- **Overview Dashboard**: Biểu đồ Chart.js / Recharts hiển thị doanh số, chỉ số tăng trưởng bằng màu sắc.
- **Khung Chat Support System**: Khác với user, Support dashboard là giao diện Inbox rẽ 2 cột (Cột list user nhắn tin, cột tin nhắn text/ảnh tương tự Facebook Messenger).
- **CRUD Data Tables (Quản lý dữ liệu)**:
  - Bảng danh sách hàng chục tính năng quản trị: Products, Orders, Vouchers, Users, v.v.
  - Hỗ trợ Filtering, Sorting, Pagination trực tiếp trên Table.
  - Hỗ trợ Form nhập liệu nâng cao (Rich Text Editor cho Blog/Product Description), UI Multi-upload ảnh có preview grid cho sản phẩm.

## 3. Kiến Trúc & Quản Lý State (State Management)
- **Global State**: Thường sử dụng Zustand hoặc Redux Toolkit cho Global Data như Giỏ Hàng cục bộ, User Profile (Role và JWT Access Token).
- **Server State**: Hỗ trợ Fetch API mượt mà bằng React Query (TanStack Query) để hỗ trợ bộ đệm Cache, Invalidate Queries sau mỗi thao tác cập nhật (Mutation).
- **Tối ưu Network**: Gọi API tuân thủ đúng định dạng JSON thống nhất từ Backend, cơ chế tự động nạp Refresh Token mỗi khi Token cũ hết hạn (Axios Interceptors).
