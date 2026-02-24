#!/bin/bash

# 投资周报可视化网站停止脚本

set -e

echo "正在停止服务..."

# 停止后端服务
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "停止后端服务 (端口 3001)..."
    lsof -Pi :3001 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
fi

# 停止Nginx
if [ -f /tmp/nginx.pid ]; then
    echo "停止Nginx..."
    nginx -c /root/.openclaw/workspace/investment-dashboard/nginx.conf -s stop 2>/dev/null || true
fi

# 停止前端静态服务
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "停止前端服务 (端口 8080)..."
    lsof -Pi :8080 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
fi

echo "所有服务已停止"