#!/bin/bash

# 显示欢迎信息
echo "=================================================="
echo "       欢迎使用IP信息查询工具启动脚本"
echo "=================================================="

# 检查pnpm是否安装
if ! command -v pnpm &> /dev/null; then
    echo "错误: 未找到pnpm命令，请先安装pnpm"
    echo "可以通过运行 'npm install -g pnpm' 来安装"
    exit 1
fi

# 设置工作目录为脚本所在目录
cd "$(dirname "$0")"

# 检查是否需要安装依赖
if [ ! -d "node_modules" ] || [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
    echo "正在安装依赖..."
    pnpm install:all
fi

# 启动应用
echo "正在启动应用..."
echo "前端将在 http://localhost:5173 运行"
echo "后端将在 http://localhost:3001 运行"
echo "按 Ctrl+C 停止应用"
echo ""

# 使用pnpm dev命令启动应用（开发模式）
pnpm dev