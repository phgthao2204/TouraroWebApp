# Demo Touraro hợp nhất

Chạy trong thư mục `client`:

```powershell
npm install
npm run dev -- --webpack
```

Mở http://localhost:3000. Demo hoạt động độc lập với backend và ứng dụng `admin` cũ.

| Loại tài khoản | Email | Mật khẩu |
| --- | --- | --- |
| Admin | admin@touraro.demo | Demo@123 |
| Người dùng | user@touraro.demo | Demo@123 |

Người dùng đăng nhập rồi chọn **Khách tham quan** hoặc **Hướng dẫn viên du lịch**. Có thể đổi vai trò mà không đăng xuất. Admin vào thẳng khu quản trị và không chọn vai trò người dùng.

## Kịch bản trình diễn

1. Đăng nhập người dùng, chọn Khách tham quan và đặt một trải nghiệm.
2. Mở menu **Hành trình của tôi** để xem yêu cầu chờ xác nhận.
3. Chọn **Đổi vai trò**, vào Hướng dẫn viên, xác nhận yêu cầu đặt tour.
4. Tạo tour mới, đổi lại Khách tham quan để tìm và đặt tour vừa tạo.
5. Đăng xuất, đăng nhập Admin để xem thống kê, ẩn/hiển thị tour, khóa/mở tài khoản người dùng, sửa tiêu đề trang khám phá.
6. Tải lại trang để kiểm tra dữ liệu được giữ lại.

## Phạm vi

Đây là đăng nhập và phân vai mô phỏng để trình diễn sản phẩm, không thay thế xác thực/phân quyền phía server. Dữ liệu tour, yêu cầu đặt tour, trạng thái tài khoản và tiêu đề lưu ở `localStorage` với key `touraro-demo-data-v1`. Phiên đăng nhập lưu ở `sessionStorage` với key `touraro-demo-session-v1`. Tất cả yêu cầu thuộc cùng một tài khoản người dùng demo; hai vai trò dùng chung dữ liệu trong trình duyệt đó. Không thanh toán, không đồng bộ giữa thiết bị.

Các route và source cũ được giữ để tiếp tục tích hợp backend. `/login` và `/admin` trong ứng dụng client chuyển về cổng demo chung. Chatbot AI, thời tiết trực tiếp và tài khoản MongoDB vẫn cần cấu hình backend riêng; cổng demo không giả lập kết quả từ các dịch vụ này.

Để đưa vào sử dụng thật, cần chuyển phiên và dữ liệu sang backend, kiểm tra quyền admin tại server, gắn tour với chủ sở hữu và yêu cầu đặt tour với tài khoản khách.
