# Design Presets

File này là template chọn hướng design cho project mới.

Khi setup project:

1. Chọn một preset gần nhất.
2. Copy phần preset đó vào `DESIGN.md` hoặc `.agents/rules/design-presets.md` của project.
3. Xóa các preset không dùng.
4. Điều chỉnh token theo brand thật.

Tất cả màu trong code nên dùng CSS variables; không hardcode hex rải rác.

## Preset A: Clean Light

Phù hợp: B2B, admin tool, SaaS nội bộ, dashboard quản lý.

Tone: sáng, tối giản, chuyên nghiệp, tập trung vào nội dung.

```css
:root {
    --color-primary: #2563eb;
    --color-primary-dark: #1d4ed8;
    --color-primary-light: #dbeafe;
    --color-secondary: #64748b;
    --color-danger: #ef4444;
    --color-success: #22c55e;
    --color-warning: #f59e0b;

    --color-bg: #f8fafc;
    --color-surface: #ffffff;
    --color-surface-alt: #f1f5f9;
    --color-overlay: rgba(0, 0, 0, 0.45);

    --color-border: #e2e8f0;
    --color-border-strong: #cbd5e1;

    --color-text: #0f172a;
    --color-text-muted: #64748b;
    --color-text-disabled: #94a3b8;
    --color-text-on-primary: #ffffff;

    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
}
```

## Preset B: Night Sanctuary

Phù hợp: ecommerce cao cấp, portfolio, spa/wellness, lifestyle dark-first.

Tone: tối, tĩnh, premium, Zen, không dùng đen tuyền.

Khi dùng preset này, đọc thêm `web/darkmode-night-sanctuary.md`.

```css
:root {
    --color-primary: #f4bb8f;
    --color-primary-dark: #d39d73;
    --color-primary-light: rgba(244, 187, 143, 0.15);
    --color-secondary: #8b9099;
    --color-danger: #f87171;
    --color-success: #6ee7b7;
    --color-warning: #fbbf24;

    --color-bg: #131313;
    --color-surface: #20201f;
    --color-surface-low: #0e0e0e;
    --color-surface-high: #353535;
    --color-overlay: rgba(0, 0, 0, 0.7);

    --color-border: rgba(255, 255, 255, 0.08);
    --color-border-strong: rgba(255, 255, 255, 0.15);

    --color-text: #e5e2e1;
    --color-text-muted: #8b9099;
    --color-text-disabled: #555555;
    --color-text-on-primary: #4a2807;
}
```

## Preset C: Warm Commerce

Phù hợp: ecommerce phổ thông, F&B, dịch vụ, SME.

Tone: ấm, thân thiện, conversion-focused.

```css
:root {
    --color-primary: #e85d04;
    --color-primary-dark: #c44d04;
    --color-primary-light: #fff0e6;
    --color-secondary: #6d7882;
    --color-danger: #dc2626;
    --color-success: #16a34a;
    --color-warning: #d97706;
    --color-sale: #dc2626;
    --color-star: #f59e0b;

    --color-bg: #fafaf9;
    --color-surface: #ffffff;
    --color-surface-alt: #f5f3f0;
    --color-overlay: rgba(0, 0, 0, 0.5);

    --color-border: #e5e0d8;
    --color-border-strong: #ccc5bb;

    --color-text: #1c1917;
    --color-text-muted: #6b7280;
    --color-text-disabled: #9ca3af;
    --color-text-on-primary: #ffffff;

    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --radius-pill: 999px;
    --shadow-sm: 0 1px 4px rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.09);
    --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
}
```
