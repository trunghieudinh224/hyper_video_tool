#!/bin/bash

# Lấy thư mục chứa file script làm thư mục làm việc hiện tại và lùi về root dự án (2 cấp từ .agents/scripts)
cd "$(dirname "$0")/../.."

ENV_FILE=".env"
CURRENT_PORT=""

# Đọc HVT_PORT hiện tại từ file .env nếu có
if [ -f "$ENV_FILE" ]; then
    CURRENT_PORT=$(grep "^HVT_PORT=" "$ENV_FILE" | cut -d '=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
fi

if [ -z "$CURRENT_PORT" ]; then
    CURRENT_PORT="3000"
fi

check_port_free() {
    local p=$1
    if [[ ! "$p" =~ ^[0-9]+$ ]] || [ "$p" -lt 1024 ] || [ "$p" -gt 65535 ]; then
        echo "[!] Port '$p' không hợp lệ (yêu cầu số từ 1024 đến 65535)."
        return 1
    fi
    if [ "$p" -eq 6000 ]; then
        echo "[!] Port 6000 bị trình duyệt Chrome chặn (ERR_UNSAFE_PORT)."
        return 1
    fi
    
    # Kiểm tra cổng đang bị chiếm (chỉ áp dụng trên Mac/Linux)
    if lsof -Pi :$p -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "[!] Port $p hiện đang bận (đang bị một phần mềm khác chiếm dụng)."
        return 1
    fi
    return 0
}

while true; do
    if check_port_free "$CURRENT_PORT"; then
        read -p "Đã có thông tin port [$CURRENT_PORT]. Nhấn Enter để dùng lại, hoặc nhập port khác: " INPUT_PORT
    else
        read -p "Vui lòng nhập một port mới (vd: 3000): " INPUT_PORT
    fi

    # Nếu người dùng nhấn Enter, lấy giá trị CURRENT_PORT
    PORT="${INPUT_PORT:-$CURRENT_PORT}"

    # Kiểm tra lại port vừa chọn xem có hợp lệ và rảnh rỗi không
    if check_port_free "$PORT"; then
        break
    else
        CURRENT_PORT="" # Reset để vòng lặp sau bắt buộc người dùng phải nhập mới
        echo "------------------------------------------------"
    fi
done

# Cập nhật hoặc thêm HVT_PORT vào file .env
if [ -f "$ENV_FILE" ]; then
    if grep -q "^HVT_PORT=" "$ENV_FILE"; then
        sed -i.bak "s/^HVT_PORT=.*/HVT_PORT=$PORT/" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
    else
        echo "HVT_PORT=$PORT" >> "$ENV_FILE"
    fi
else
    echo "HVT_PORT=$PORT" > "$ENV_FILE"
fi

echo "================================================="
echo "Đang khởi động Node Backend trên cổng $PORT..."
echo "Trình duyệt sẽ tự động mở sau vài giây..."
echo "================================================="

# Hẹn giờ mở trình duyệt đến trang chủ của Node backend
(sleep 2 && open "http://127.0.0.1:$PORT/index.html") &

# Khởi chạy Node backend
HVT_PORT="$PORT" npm --prefix backend start
