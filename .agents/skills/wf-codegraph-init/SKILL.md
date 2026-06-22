---
name: wf-codegraph-init
description: >
  Workflow khởi tạo CodeGraph cho project hiện tại. Dùng khi mở một dự án mới
  và muốn đảm bảo project có `.codegraph/` index. Nếu project đã init rồi thì
  chỉ báo lại cho user, không chạy init lại.
---

# Workflow: CodeGraph Init

Sử dụng workflow này khi user mở một project mới và muốn chuẩn bị CodeGraph cho project đó.

## Mục Tiêu

- Xác nhận agent đang đứng ở đúng thư mục gốc project.
- Nếu project chưa có CodeGraph index, chạy `codegraph init`.
- Nếu project đã init rồi, chỉ báo user biết và không chạy init lại.
- Không sửa mã nguồn project.

## Khi Nào Dùng

Kích hoạt khi user nói một trong các ý sau:

- `wf-codegraph-init`
- `codegraph init project này`
- `setup codegraph cho project mới`
- `chuẩn bị codegraph cho repo này`

## Quy Trình Bắt Buộc

### Bước 1: Kiểm tra thư mục hiện tại

Chạy:

```bash
pwd
```

Báo lại đường dẫn hiện tại cho user. Nếu đường dẫn không phải thư mục gốc project, yêu cầu user mở đúng project hoặc cung cấp path đúng.

Thư mục gốc project thường có một hoặc nhiều file/thư mục sau:

- `.git/`
- `README.md`
- `package.json`
- `pyproject.toml`
- `requirements.txt`
- `src/`, `app/`, `tests/`

### Bước 2: Kiểm tra project đã init chưa

Kiểm tra sự tồn tại của thư mục:

```bash
.codegraph/
```

Nếu `.codegraph/` đã tồn tại:

1. Chạy `codegraph status`.
2. Báo user rằng project đã được init CodeGraph trước đó.
3. Không chạy `codegraph init` lại.
4. Nếu status báo lỗi index cũ hoặc chưa up to date, gợi ý user dùng `wf-codegraph-sync` hoặc `wf-codegraph-index`.

Nếu `.codegraph/` chưa tồn tại:

1. Chạy:

```bash
codegraph init
```

2. Sau khi init xong, chạy:

```bash
codegraph status
```

3. Báo user số file/nodes/edges nếu output có thông tin này.

## Báo Cáo Kết Quả

Kết thúc workflow bằng báo cáo ngắn:

```markdown
CodeGraph init status:
- Project path:
- Action: already initialized | initialized now | failed
- Current index status:
- Next suggested step:
```

## Lưu Ý An Toàn

- Không chỉnh sửa code.
- Không xóa `.codegraph/`.
- Không chạy `codegraph index` nếu user chỉ yêu cầu init và project đã init rồi.
- `.codegraph/` là dữ liệu local, nên được thêm vào `.gitignore`.
