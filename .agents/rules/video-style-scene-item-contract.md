# Video Style - Scene Item Contract

Rule này quy định cách liên kết giữa Video Style, Scene Item và Slot trong Hyper Video Tool.

## Nguyên Tắc Chính

- Video Style chỉ cung cấp design token chung: màu nền, surface, text, muted text, accent, accent soft, border, glow và nhịp motion.
- Scene Item/Slot quyết định cách dùng token đó thông qua semantic role và display style.
- Không hardcode kiểu "mọi text đều dùng màu Text" hoặc "mọi item đều có Border".
- Item do user tự thêm bắt buộc phải có type, color role và display style để preview/render biết áp style thế nào.

## Token Video Style

| Token        | Ý nghĩa                        | Ví dụ áp dụng                             |
| ------------ | ------------------------------ | ----------------------------------------- |
| `background` | Nền toàn frame/video           | canvas scene                              |
| `surface`    | Nền block/card/container chính | media frame, logo box, list cell          |
| `surfaceAlt` | Nền phụ/layer phụ              | placeholder, panel phụ, contrast layer    |
| `text`       | Chữ chính                      | title, label chính, CTA chính             |
| `mutedText`  | Chữ phụ                        | description, note, caption, metadata      |
| `accent`     | Điểm nhấn                      | kicker, active tag, guide line, highlight |
| `accentSoft` | Nền nhấn nhẹ                   | badge/tag soft, active background         |
| `border`     | Màu viền cho item có border    | outlined/surface/media frame/pill         |
| `glow`       | Halo/shadow nhấn               | frame hoặc item được bật glow             |

## Scene Item Fields

Scene Item chuẩn hoặc custom phải có:

- `type`: loại nội dung, ví dụ `text`, `media`, `asset`, `list`, `tag`.
- `colorRole`: token chữ/chủ đạo nên dùng, ví dụ `text`, `mutedText`, `accent`.
- `displayStyle`: cách vẽ block, ví dụ `plain`, `surface`, `outlined`, `filled`, `pill`, `media-frame`.

## Mapping Mặc Định

- Title: `type=text`, `colorRole=text`, `displayStyle=plain`.
- Description/Note: `type=text`, `colorRole=mutedText`, `displayStyle=plain`.
- Header/Kicker/CTA: `type=text`, `colorRole=accent`, `displayStyle=plain`.
- Logo: `type=asset`, `colorRole=accent`, `displayStyle=surface`.
- Image/Video: `type=media`, `colorRole=accent`, `displayStyle=media-frame`.
- Tag/Label: `type=tag`, `colorRole=accent`, `displayStyle=pill`.
- Grid/List: `type=list`, `colorRole=text`, `displayStyle=surface`.

## Border Rule

- `border` chỉ là màu token.
- Border chỉ xuất hiện khi `displayStyle` là `surface`, `outlined`, `pill`, hoặc `media-frame`.
- `plain` text không dùng border.

## Custom Item Rule

Không cho user thêm item chỉ với mỗi tên và type. Item mới phải chọn role/style để tránh preview/render đoán sai.
