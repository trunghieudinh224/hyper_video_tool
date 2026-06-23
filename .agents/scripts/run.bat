@echo off
setlocal enabledelayedexpansion

:: Chuyển đến thư mục chứa script và lùi về thư mục gốc dự án (2 cấp từ .agents/scripts)
cd /d "%~dp0..\.."

set "ENV_FILE=.env"
set "CURRENT_PORT="

:: Đọc HVT_PORT hiện tại từ file .env nếu có
if exist "%ENV_FILE%" (
    for /f "tokens=1,2 delims==" %%A in ('type "%ENV_FILE%" ^| findstr "^HVT_PORT="') do (
        set "CURRENT_PORT=%%B"
    )
)

:: Xóa khoảng trắng thừa nếu có
if defined CURRENT_PORT (
    set "CURRENT_PORT=!CURRENT_PORT: =!"
)

if not defined CURRENT_PORT (
    set "CURRENT_PORT=3000"
)

:ASK_PORT
set "IS_VALID=1"

:: Kiểm tra nếu CURRENT_PORT bị trống
if "!CURRENT_PORT!"=="" (
    set "IS_VALID=0"
    goto :PROMPT_NEW
)

:: Kiểm tra nếu CURRENT_PORT không phải là số hoặc ngoài phạm vi (1024 - 65535)
for /f "delims=0123456789" %%A in ("!CURRENT_PORT!") do set "IS_VALID=0"
if "!IS_VALID!"=="0" (
    echo [!] Port '!CURRENT_PORT!' không hợp lệ. Vui lòng nhập số.
    goto :PROMPT_NEW
)

if !CURRENT_PORT! lss 1024 set "IS_VALID=0"
if !CURRENT_PORT! gtr 65535 set "IS_VALID=0"
if "!IS_VALID!"=="0" (
    echo [!] Port !CURRENT_PORT! không hợp lệ ^(Yêu cầu từ 1024 đến 65535^).
    goto :PROMPT_NEW
)

:: Kiểm tra port 6000 (bị Chrome chặn)
if "!CURRENT_PORT!"=="6000" (
    echo [!] Port 6000 bị trình duyệt Chrome chặn ^(ERR_UNSAFE_PORT^).
    set "IS_VALID=0"
    goto :PROMPT_NEW
)

:: Kiểm tra xem port có đang bị chiếm trên Windows không
netstat -ano | findstr "LISTENING" | findstr ":!CURRENT_PORT! " >nul
if !errorlevel! equ 0 (
    echo [!] Port !CURRENT_PORT! hiện đang bị chiếm dụng bởi một phần mềm khác.
    set "IS_VALID=0"
    goto :PROMPT_NEW
)

:: Nếu port check OK, hỏi người dùng
set /p "INPUT_PORT=Đã có thông tin port [!CURRENT_PORT!]. Nhấn Enter để dùng lại, hoặc nhập port khác: "
if "!INPUT_PORT!"=="" (
    set "PORT=!CURRENT_PORT!"
    goto :DONE_PORT
) else (
    :: Người dùng nhập port mới, gán vào CURRENT_PORT để chạy lại vòng lập kiểm tra
    set "CURRENT_PORT=!INPUT_PORT!"
    goto :ASK_PORT
)

:PROMPT_NEW
set /p "INPUT_PORT=Vui lòng nhập một port mới (vd: 3000): "
if "!INPUT_PORT!"=="" (
    set "CURRENT_PORT="
) else (
    set "CURRENT_PORT=!INPUT_PORT!"
)
echo ------------------------------------------------
goto :ASK_PORT

:DONE_PORT
:: Cập nhật hoặc thêm HVT_PORT vào file .env
if exist "%ENV_FILE%" (
    findstr /V "^HVT_PORT=" "%ENV_FILE%" > "%ENV_FILE%.tmp"
    echo HVT_PORT=!PORT!>> "%ENV_FILE%.tmp"
    move /Y "%ENV_FILE%.tmp" "%ENV_FILE%" >nul
) else (
    echo HVT_PORT=!PORT!> "%ENV_FILE%"
)

echo =================================================
echo Đang khởi động Node Backend trên cổng !PORT!...
echo Trình duyệt sẽ tự động mở sau vài giây...
echo =================================================

:: Hẹn giờ 2 giây và tự động mở trình duyệt đến file index.html (chạy background bằng powershell)
start /b powershell -command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:!PORT!/index.html'"

:: Khởi chạy Node backend
set HVT_PORT=!PORT!
npm --prefix backend start
pause
