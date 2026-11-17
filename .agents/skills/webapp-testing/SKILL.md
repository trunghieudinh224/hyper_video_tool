---
name: webapp-testing
description: Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.
license: "Apache-2.0 — source: https://github.com/anthropics/skills/tree/main/skills/webapp-testing"
---

# Web Application Testing

For Hyper Video Tool, `.agents/rules/static-multipage-ui.md` sets the viewport scope: PC/laptop by default, tablet/mobile only when the user requests it. Use `wf-run-web` for backend-dependent flows. Never read `.env` to discover the local URL.

To test local web applications, write native Python Playwright scripts.

## Decision Tree: Choosing Your Approach

```
User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         ├─ Success → Write Playwright script using selectors
    │         └─ Fails/Incomplete → Treat as dynamic (below)
    │
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Start server using the project's run instructions
        │        For Hyper Video Tool, follow wf-run-web when browser verification was requested
        │
        └─ Yes → Reconnaissance-then-action:
            1. Navigate and wait for networkidle
            2. Take screenshot or inspect DOM
            3. Identify selectors from rendered state
            4. Execute actions with discovered selectors
```

## Example: Basic Playwright Test

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:8000')          # Replace with URL from the project's run instructions
    page.wait_for_load_state('networkidle')    # CRITICAL: wait for JS
    # Take screenshot to verify UI
    page.screenshot(path='/tmp/inspect.png', full_page=True)
    # Check elements
    assert page.locator('body').is_visible()
    browser.close()
```

## Reconnaissance-Then-Action Pattern

1. **Inspect rendered DOM**:
   ```python
   page.screenshot(path='/tmp/inspect.png', full_page=True)
   content = page.content()
   page.locator('button').all()
   ```

2. **Identify selectors** from inspection results

3. **Execute actions** using discovered selectors

## Common Pitfall

❌ **Don't** inspect the DOM before waiting for `networkidle` on dynamic apps
✅ **Do** wait for `page.wait_for_load_state('networkidle')` before inspection

## Best Practices

- Use `sync_playwright()` for synchronous scripts
- Always close the browser when done
- Use descriptive selectors: `text=`, `role=`, CSS selectors, or IDs
- Add appropriate waits: `page.wait_for_selector()` or `page.wait_for_timeout()`

## Usage for Hyper Video Tool

Chỉ chạy browser test khi user yêu cầu test/verification. Nếu đã yêu cầu:

- Chạy app theo `wf-run-web`; mặc định dùng `http://127.0.0.1:3000` trừ khi user chỉ định port khác.
- Mở đúng page/flow nằm trong scope; kiểm console và network/API errors.
- Dùng `1440x900`; thêm `1366x768` nếu layout/modal bị ảnh hưởng.
- Tablet/mobile chỉ kiểm khi user yêu cầu; không dùng ví dụ framework/Blade/Stitch nếu project không dùng chúng.
- Lưu screenshot/artifact chỉ khi hữu ích cho yêu cầu; không để runtime output trong repo.
