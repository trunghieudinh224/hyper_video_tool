# Danh Sách Item Cần Có Trên UI - Hyper Video Tool

## Mục Tiêu UI

UI của Hyper Video Tool là giao diện nội bộ để người dùng nhập thông tin dự án, chọn template, xem trước video và render ra MP4 bằng HyperFrames.

Giao diện phải:

- Dùng được tốt ở máy cá nhân sau khi clone project về.
- Có đủ 2 chế độ sáng và tối.
- Không dùng gradient.
- Không làm kiểu landing page quảng cáo.
- Không màu mè quá tay.
- Dễ nhìn, gọn, sang, rõ chức năng.
- Ưu tiên thao tác nhanh hơn trang trí.

## 1. Thanh Trên Cùng

Thanh trên cùng luôn hiển thị ở đầu app.

Item cần có:

- Tên app: `Hyper Video Tool`
- Tên project đang mở
- Trạng thái lưu:
  - `Chưa lưu`
  - `Đã lưu`
  - `Đang lưu`
  - `Lỗi lưu`
- Nút đổi giao diện:
  - `Sáng`
  - `Tối`
- Nút `Mở project`
- Nút `Lưu project`
- Nút chính `Render video`

Quy tắc:

- Nút `Render video` nổi bật nhất nhưng không quá to.
- Khi dữ liệu chưa hợp lệ, nút `Render video` phải bị khóa.
- Không dùng icon trang trí thừa.

## 2. Thanh Điều Hướng Bên Trái

Thanh bên trái dùng để chuyển giữa các phần chính của tool.

Item cần có:

- Tổng quan
- Nội dung dự án
- Tính năng
- Timeline
- Tài nguyên
- Template
- Xem trước
- Render
- Video đã xuất
- Cài đặt

Mỗi item nên có:

- Icon đơn giản nếu có thư viện icon.
- Label tiếng Việt rõ ràng.
- Trạng thái đang chọn.
- Badge cảnh báo nhỏ nếu phần đó còn thiếu dữ liệu.

Ví dụ:

- `Nội dung dự án` có badge nếu thiếu mô tả.
- `Tài nguyên` có badge nếu chưa upload ảnh bắt buộc.
- `Render` có badge nếu có job đang chạy.

## 3. Màn Hình Tổng Quan

Màn hình này cho người dùng nhìn nhanh tình trạng project.

Item cần có:

- Tên project
- Mô tả ngắn
- Người phụ trách hoặc team
- Trạng thái project:
  - `Ý tưởng`
  - `Đang phát triển`
  - `Đã hoàn thành`
  - `Đang bảo trì`
- Template đang chọn
- Thời lượng video ước tính
- Số scene ước tính
- Số lỗi cần sửa trước khi render
- Nút `Tiếp tục chỉnh sửa`
- Nút `Xem trước video`
- Nút `Render video`

Khối kiểm tra nhanh:

- Nội dung cơ bản: đủ / thiếu
- Tính năng chính: đủ / thiếu
- Tài nguyên: đủ / thiếu
- Template: đã chọn / chưa chọn
- Render: sẵn sàng / chưa sẵn sàng

## 4. Màn Hình Nội Dung Dự Án

Đây là màn hình nhập thông tin cốt lõi cho video.

Trường cần có:

- Tên dự án
- Tên ngắn hoặc slug
- Tagline
- Chủ dự án / team
- Vai trò của người trình bày
- Mô tả ngắn
- Vấn đề cần giải quyết
- Giải pháp đã xây dựng
- Người dùng mục tiêu
- Bối cảnh sử dụng
- Điểm nổi bật nhất của dự án
- Kết quả hoặc tác động đạt được
- Ghi chú kết thúc video

Control cần có:

- Nút `Tải dữ liệu mẫu`
- Nút `Xóa form`
- Nút `Lưu nháp`
- Bộ đếm ký tự cho các ô dài.
- Cảnh báo nếu text quá dài cho video.

Validation cần có:

- Tên dự án bắt buộc.
- Mô tả ngắn bắt buộc.
- Vấn đề và giải pháp bắt buộc.
- Tagline không nên quá dài.
- Cảnh báo nếu đoạn mô tả quá dài để lên video.

## 5. Màn Hình Tính Năng

Màn hình này quản lý danh sách tính năng chính sẽ đưa vào video.

Item cần có:

- Danh sách tính năng
- Nút `Thêm tính năng`
- Nút xóa từng tính năng
- Nút kéo/sắp xếp thứ tự, nếu làm được đơn giản
- Trạng thái tính năng:
  - `Hoàn thành`
  - `Đang làm`
  - `Thử nghiệm`
  - `Ý tưởng`

Mỗi tính năng có:

- Tên tính năng
- Mô tả ngắn
- Giá trị mang lại
- Ảnh minh họa tùy chọn
- Có đưa vào video hay không

Quy tắc:

- MVP chỉ cần reorder đơn giản bằng nút lên/xuống, chưa cần kéo thả phức tạp.
- Nên giới hạn 3-6 tính năng cho video 60-90 giây.

## 6. Màn Hình Timeline

Màn hình này mô tả các mốc phát triển của dự án.

Item cần có:

- Danh sách mốc thời gian
- Nút `Thêm mốc`
- Nút xóa mốc
- Nút lên/xuống để đổi thứ tự

Mỗi mốc có:

- Tên mốc
- Ngày hoặc tháng
- Mô tả ngắn
- Trạng thái:
  - `Đã xong`
  - `Đang làm`
  - `Sắp tới`

Ví dụ mốc:

- Khởi tạo ý tưởng
- Xây dựng MVP
- Test nội bộ
- Demo cho team
- Ra mắt bản đầu tiên

## 7. Màn Hình Tài Nguyên

Màn hình này quản lý ảnh, logo, video demo và các file dùng trong video.

Item cần có:

- Khu vực kéo thả file
- Nút `Chọn file`
- Danh sách tài nguyên dạng grid
- Bộ lọc loại file:
  - Tất cả
  - Logo
  - Ảnh chụp màn hình
  - Video demo
  - Khác
- Trạng thái upload:
  - Đang tải lên
  - Đã tải lên
  - Lỗi

Mỗi tài nguyên hiển thị:

- Thumbnail
- Tên file
- Loại file
- Dung lượng
- Ngày thêm
- Nút xem
- Nút đổi tên
- Nút xóa
- Checkbox `Dùng trong video`

Thông tin phụ:

- Số lượng ảnh đã chọn
- Số lượng video demo đã chọn
- Cảnh báo nếu thiếu screenshot cho template hiện tại.

## 8. Màn Hình Template

Màn hình này cho người dùng chọn kiểu video.

Item cần có:

- Danh sách template
- Preview nhỏ của từng template
- Tên template
- Mô tả template
- Thời lượng ước tính
- Số scene
- Phù hợp với loại video nào
- Nút `Chọn template`

Template MVP đầu tiên:

- Tên: `Giới thiệu dự án 90 giây`
- Tỉ lệ: `16:9`
- Thời lượng: `60-90 giây`
- Mục tiêu: giới thiệu nhanh project nội bộ
- Scene gồm:
  - Mở đầu
  - Vấn đề
  - Giải pháp
  - Tính năng chính
  - Công nghệ sử dụng
  - Kết quả
  - Kết thúc

Tùy chỉnh template:

- Theme video:
  - Sáng
  - Tối
- Màu nhấn:
  - Xanh chuyên nghiệp
  - Xám trung tính
  - Xanh lá nhẹ
  - Cam cảnh báo nhẹ
- Cỡ chữ:
  - Gọn
  - Mặc định
  - Lớn
- Vị trí logo:
  - Không hiển thị
  - Góc trên trái
  - Slide cuối

Không làm:

- Không cho chọn gradient.
- Không làm theme builder phức tạp.
- Không làm timeline editor kiểu kéo thả trong MVP.

## 9. Màn Hình Xem Trước

Màn hình này giúp kiểm tra video trước khi render.

Item cần có:

- Khung preview 16:9
- Danh sách scene
- Tên scene đang xem
- Thời lượng scene
- Nút chuyển scene trước
- Nút chuyển scene sau
- Nút play/pause nếu preview hỗ trợ
- Nút zoom:
  - Vừa khung
  - 100%
- Cảnh báo dữ liệu thiếu
- Cảnh báo text quá dài

Danh sách scene cần hiển thị:

- Số thứ tự scene
- Tên scene
- Trạng thái:
  - Đủ dữ liệu
  - Thiếu dữ liệu
  - Text quá dài

Quy tắc:

- Preview phải giữ đúng tỉ lệ 16:9.
- Không để preview làm vỡ layout.
- Nếu template lỗi, hiển thị lỗi dễ hiểu thay vì trắng màn hình.

## 10. Màn Hình Render

Màn hình này dùng để xuất video MP4.

Item cần có:

- Cấu hình render:
  - Độ phân giải
  - FPS
  - Template
  - Tên file output
- Nút `Kiểm tra dữ liệu`
- Nút `Render video`
- Nút `Hủy render` nếu đang render
- Thanh tiến trình
- Trạng thái render:
  - Chưa bắt đầu
  - Đang chờ
  - Đang render
  - Hoàn tất
  - Thất bại
- Log render rút gọn
- Nút mở log chi tiết

Cấu hình mặc định:

- Độ phân giải: `1920x1080`
- FPS: `30`
- Format: `MP4`

Quy tắc:

- Nếu dữ liệu chưa hợp lệ, không cho render.
- Nếu render lỗi, hiển thị lý do ngắn gọn.
- Không dump log dài ra UI chính.

## 11. Màn Hình Video Đã Xuất

Màn hình này quản lý file video đã render.

Item cần có:

- Danh sách video đã xuất
- Tên file
- Template đã dùng
- Độ phân giải
- Dung lượng file
- Thời gian tạo
- Trạng thái file:
  - Tồn tại
  - Không tìm thấy
- Nút mở video
- Nút mở thư mục
- Nút render lại
- Nút xóa

Khi chưa có video:

- Hiển thị empty state: `Chưa có video nào được xuất`
- Nút `Render video đầu tiên`

Khi xóa:

- Dùng modal xác nhận riêng.
- Không dùng `confirm()` của trình duyệt.

## 12. Màn Hình Cài Đặt

Màn hình này chứa các thiết lập local.

Item cần có:

- Theme mặc định:
  - Theo hệ thống
  - Sáng
  - Tối
- Thư mục lưu output
- Thư mục upload
- Cấu hình render mặc định:
  - Resolution
  - FPS
- Nút `Xuất project JSON`
- Nút `Nhập project JSON`
- Nút `Khôi phục dữ liệu mẫu`
- Nút `Xóa dữ liệu local`

Thông tin hệ thống:

- Phiên bản app
- Node version nếu phase sau có backend
- HyperFrames status:
  - Đã sẵn sàng
  - Chưa cài
  - Lỗi cấu hình
- FFmpeg status:
  - Đã sẵn sàng
  - Chưa tìm thấy

Ghi chú cho giai đoạn UI:

- Các trạng thái Node/HyperFrames/FFmpeg chỉ là UI mock.
- Chưa cần kiểm tra thật trên máy.
- Chưa cần backend/API.

## 13. Panel Kiểm Tra Dữ Liệu

Panel này có thể nằm bên phải ở desktop và nằm dưới nội dung ở mobile.

Item cần có:

- Tổng số lỗi
- Tổng số cảnh báo
- Danh sách lỗi theo nhóm:
  - Nội dung dự án
  - Tính năng
  - Timeline
  - Tài nguyên
  - Template
- Nút `Đi tới phần lỗi`

Loại lỗi:

- Thiếu trường bắt buộc.
- Text quá dài.
- Chưa chọn template.
- Chưa có tài nguyên cần thiết.
- Tên file output không hợp lệ.

Loại cảnh báo:

- Ít hơn 3 tính năng.
- Chưa có ảnh minh họa.
- Video có thể hơi dài.
- Chưa có kết quả/tác động cụ thể.

## 14. Toast Và Modal

Toast cần có:

- Lưu thành công
- Lưu thất bại
- Đã tải dữ liệu mẫu
- Đã thêm tài nguyên
- Render bắt đầu
- Render hoàn tất
- Render thất bại

Modal cần có:

- Xác nhận xóa tài nguyên
- Xác nhận xóa video output
- Nhập project JSON
- Xem log render chi tiết
- Cảnh báo trước khi xóa dữ liệu local

Quy tắc:

- Không dùng `alert()`.
- Không dùng `confirm()`.
- Không dùng `prompt()`.

## 15. Trạng Thái Bắt Buộc Của UI

Mỗi màn hình quan trọng cần có đủ:

- Loading
- Empty
- Error
- Success
- Disabled
- Unsaved changes

Ví dụ:

- Asset Manager có empty khi chưa upload file.
- Render có loading khi đang render.
- Preview có error khi template lỗi.
- Project Editor có unsaved changes khi sửa form chưa lưu.

## 16. Responsive

Desktop:

- Sidebar trái cố định.
- Main content ở giữa.
- Validation panel bên phải.

Tablet:

- Sidebar có thể thu gọn.
- Validation panel xuống dưới hoặc thành drawer.

Mobile:

- Navigation chuyển thành tab/drawer.
- Form full width.
- Button row wrap xuống dòng.
- Preview 16:9 full width.
- Không có horizontal scroll ngoài khu vực preview zoom có chủ đích.

## 17. Checklist Cho Antigravity

Khi triển khai UI, làm theo thứ tự:

1. Tạo design tokens cho light/dark mode.
2. Tạo app shell.
3. Tạo sidebar và top bar.
4. Tạo các component nền: button, input, textarea, select, modal, toast.
5. Tạo màn hình Tổng quan.
6. Tạo màn hình Nội dung dự án.
7. Tạo màn hình Tính năng.
8. Tạo màn hình Timeline.
9. Tạo màn hình Tài nguyên.
10. Tạo màn hình Template.
11. Tạo màn hình Xem trước.
12. Tạo màn hình Render.
13. Tạo màn hình Video đã xuất.
14. Tạo màn hình Cài đặt.
15. Tạo validation panel.
16. Thêm dữ liệu mẫu.
17. Kiểm tra responsive.
18. Kiểm tra dark mode và light mode.
19. Chạy polish UI.

## 18. Những Thứ Không Được Làm

- Không dùng gradient.
- Không làm hero section.
- Không làm landing page.
- Không dùng quá nhiều card nổi.
- Không dùng quá nhiều badge.
- Không dùng emoji trang trí.
- Không dùng text tiếng Anh chung chung trong UI chính.
- Không dùng placeholder thay cho label.
- Không dùng inline style.
- Không hardcode màu rải rác.
- Không làm timeline editor phức tạp trong MVP.
