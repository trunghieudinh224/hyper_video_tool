# Task Hiện Tại

## Tiếp nhận

Thiết lập nền agent cho project "Hyper Video Tool": tool nội bộ tạo video thuyết trình dự án cá nhân trong công ty bằng HTML/CSS/JS, Node backend và HyperFrames.

## Kế hoạch

Phase 0: setup `.agents`, shared skills/rules, memory, CodeGraph note và entrypoint `AGENTS.md`/`GEMINI.md`.

Phase 1: dựng MVP vanilla HTML/CSS/JS + Node server:
- UI nhập thông tin project, sections, assets, chọn template.
- JSON schema cho project presentation.
- Preview HTML template.
- Render pipeline gọi HyperFrames để xuất MP4.
- Lưu output local ở `outputs/`.

Phase 2: polish nội bộ:
- Template video 60-90 giây cho project showcase.
- Trạng thái render queue đơn giản.
- Browser smoke test và responsive check.

## Checklist

- [x] Tạo `.agents` workspace.
- [x] Copy shared skills/rules phù hợp cho static web admin tool.
- [x] Tạo memory, context, workflow index.
- [x] Cập nhật `AGENTS.md` và `GEMINI.md` với shared-skills block.
- [x] Bổ sung `.gitignore` cho `.codegraph/`, build/output/cache cơ bản.
- [ ] Khởi tạo app MVP HTML/CSS/JS + Node.
- [ ] Tích hợp HyperFrames render.
- [ ] Tạo template video đầu tiên.

## Xác minh

Đã chạy setup shared-skills vào đúng project `/Users/dinhtrunghieu/Freelance/hyper_video_tool`. Cần chạy health-check lại sau khi khởi tạo app nếu thêm dependency.
