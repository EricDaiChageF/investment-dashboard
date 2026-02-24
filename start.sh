#!/bin/bash

# 投资周报可视化网站启动脚本

set -e

PROJECT_DIR="/root/.openclaw/workspace/investment-dashboard"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "========================================"
echo "投资周报可视化网站启动脚本"
echo "========================================"

# 检查端口占用
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "端口 3001 已被占用，尝试停止现有进程..."
    lsof -Pi :3001 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "端口 8080 已被占用，尝试停止现有进程..."
    lsof -Pi :8080 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 启动后端
echo ""
echo "[1/3] 启动后端服务..."
cd "$BACKEND_DIR"

# 检查node_modules
if [ ! -d "node_modules" ]; then
    echo "安装后端依赖..."
    npm install
fi

# 检查dist目录
if [ ! -d "dist" ]; then
    echo "编译后端代码..."
    npm run build
fi

# 启动后端（后台运行）
nohup npm start > "$PROJECT_DIR/backend.log" 2>&1 &
echo "后端服务已启动，PID: $!"
sleep 3

# 启动前端
echo ""
echo "[2/3] 启动前端服务..."
cd "$FRONTEND_DIR"

# 检查node_modules
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

# 检查dist目录
if [ ! -d "dist" ]; then
    echo "构建前端代码..."
    npm run build
fi

# 启动Nginx
echo ""
echo "[3/3] 启动Nginx..."
if command -v nginx &> /dev/null; then
    # 使用自定义配置启动nginx
    nginx -c "$PROJECT_DIR/nginx.conf" -g "pid /tmp/nginx.pid;" 2>/dev/null || {
        echo "尝试使用现有nginx配置..."
        nginx 2>/dev/null || true
    }
else
    echo "Nginx未安装，使用npx serve提供静态文件服务..."
    nohup npx serve -s dist -l 8080 > "$PROJECT_DIR/frontend.log" 2>&1 &
    echo "前端静态服务已启动，PID: $!"
fi

echo ""
echo "========================================"
echo "服务启动完成！"
echo "========================================"
echo ""
echo "访问地址:"
echo "  - 网站: http://localhost:8080"
echo "  - API: http://localhost:3001/api"
echo ""
echo "登录信息:"
echo "  - 用户名: admin"
echo "  - 密码: admin123"
echo ""
echo "日志文件:"
echo "  - 后端: $PROJECT_DIR/backend.log"
echo "  - 前端: $PROJECT_DIR/frontend.log"
echo ""
echo "停止服务:"
echo "  - 后端: kill \$(lsof -t -i:3001)"
echo "  - Nginx: nginx -s stop"
echo "========================================"