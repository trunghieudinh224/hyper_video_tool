# Hyper Video Tool

Công cụ nội bộ để tạo video thuyết trình dự án cá nhân/dự án nội bộ.

## Trạng thái hiện tại

Phase hiện tại chỉ là UI tĩnh bằng HTML, CSS và JavaScript thuần. Chưa có backend, chưa gọi HyperFrames thật và chưa xuất MP4 thật.

## Cấu trúc chính

```text
frontend/   UI tĩnh chạy local
backend/    Backend local ở phase sau
data/       Dữ liệu mẫu dùng để minh họa
templates/  Template video/render demo
.agents/    Rule, context, workflow cho agent
```

## Mở UI

Mở trực tiếp:

```text
frontend/index.html
```

Hoặc chạy static server trong thư mục `frontend/` nếu cần test bằng browser automation.
