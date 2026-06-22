---
name: webapp-testing
description: Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.
license: Apache-2.0 — source: https://github.com/anthropics/skills/tree/main/skills/webapp-testing
---

# Web Application Testing

To test local web applications, write native Python Playwright scripts.

## Decision Tree: Choosing Your Approach

```
User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         ├─ Success → Write Playwright script using selectors
    │         └─ Fails/Incomplete → Treat as dynamic (below)
    │
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Start server first (e.g. php artisan serve)
        │        Then write Playwright script
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
    page.goto('http://localhost:8000')          # Replace with APP_PORT from .env
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

## Usage for Laravel/Web Projects

Đọc port local từ `.env`, project config, hoặc dev-server output để xác định URL local, ví dụ `http://localhost:{APP_PORT}`. Dùng skill này để:
- Verify UI sau khi convert Stitch → Blade
- Check responsive layout ở các kích thước màn hình khác nhau
- Capture screenshot để so sánh với mockup gốc từ Stitch
- Debug JS errors trong console
- Test flow chính của feature, dashboard/list/detail, modal, form, gallery, và các state lỗi/thành công

```python
# Check responsive - mobile view
page.set_viewport_size({"width": 375, "height": 812})
page.goto('http://localhost:{APP_PORT}/{feature-path}')
page.screenshot(path='/tmp/mobile-view.png', full_page=True)
```
