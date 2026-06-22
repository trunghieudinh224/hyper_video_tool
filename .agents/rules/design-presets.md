# Design Tokens - Hyper Video Tool

File này thay cho preset bán hàng/dịch vụ mặc định. Dự án này là công cụ nội bộ tạo video, nên chỉ dùng hướng thiết kế cho internal tool.

## Nguyên Tắc

- Dùng CSS variables, không hardcode màu rải rác.
- Có light mode và dark mode.
- Không dùng gradient.
- Không dùng nền tím/xanh kiểu AI.
- Không dùng glassmorphism, orb, blob hoặc hiệu ứng trang trí rối.
- Border và spacing quan trọng hơn shadow.
- Giao diện phải rõ, gọn, sang, dễ thao tác.

## Light Mode

```css
:root {
  --color-bg: #f6f7f9;
  --color-surface: #ffffff;
  --color-surface-alt: #f0f2f5;
  --color-surface-muted: #e8ebef;
  --color-overlay: rgba(17, 24, 39, 0.48);

  --color-border: #d9dee7;
  --color-border-strong: #b9c1cf;

  --color-text: #111827;
  --color-text-muted: #5f6b7a;
  --color-text-subtle: #8a96a6;
  --color-text-on-primary: #ffffff;

  --color-primary: #1f4fd8;
  --color-primary-hover: #193fb0;
  --color-primary-soft: #e8eefc;

  --color-success: #16803c;
  --color-warning: #a16207;
  --color-danger: #c2410c;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 10px;

  --shadow-sm: 0 1px 2px rgba(17, 24, 39, 0.06);
  --shadow-md: 0 8px 20px rgba(17, 24, 39, 0.08);
}
```

## Dark Mode

```css
[data-theme="dark"] {
  --color-bg: #101214;
  --color-surface: #181b1f;
  --color-surface-alt: #20242a;
  --color-surface-muted: #2a3038;
  --color-overlay: rgba(0, 0, 0, 0.68);

  --color-border: #303743;
  --color-border-strong: #475160;

  --color-text: #eef2f7;
  --color-text-muted: #a6b0bf;
  --color-text-subtle: #737f8f;
  --color-text-on-primary: #0f172a;

  --color-primary: #7aa2ff;
  --color-primary-hover: #9bbaff;
  --color-primary-soft: #1d2b4a;

  --color-success: #5cc980;
  --color-warning: #d6a63d;
  --color-danger: #e07a5f;
}
```

## Component Style

- Button chính dùng `--color-primary`.
- Button phụ dùng surface + border.
- Card/panel dùng border rõ, shadow nhẹ hoặc không shadow.
- Status dùng màu semantic nhưng tiết chế.
- Preview video luôn giữ tỉ lệ 16:9.
