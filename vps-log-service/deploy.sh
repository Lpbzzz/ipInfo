#!/bin/bash

# VPS 日志服务部署脚本
# 使用方法: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 开始部署日志服务..."

# 检查是否为 root 用户
if [ "$EUID" -eq 0 ]; then
    echo "❌ 请不要使用 root 用户运行此脚本"
    exit 1
fi

# 更新系统
echo "📦 更新系统包..."
sudo apt update && sudo apt upgrade -y

# 安装必要软件
echo "🔧 安装必要软件..."
sudo apt install -y curl git nginx ufw

# 安装 Node.js 18
echo "📦 安装 Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 安装 PM2
echo "🔧 安装 PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# 创建日志目录
echo "📁 创建日志目录..."
mkdir -p logs/{access,error,system,api,pm2}

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 复制环境变量文件
if [ ! -f .env ]; then
    echo "⚙️ 创建环境变量文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件并设置正确的配置"
    echo "   nano .env"
fi

# 配置防火墙
echo "🔒 配置防火墙..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# 配置 Nginx
echo "🌐 配置 Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/log-service
sudo ln -sf /etc/nginx/sites-available/log-service /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 启动服务
echo "🚀 启动日志服务..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ 部署完成！"
echo ""
echo "📋 服务信息:"
echo "   - 服务端口: 3001"
echo "   - Nginx 端口: 80"
echo "   - 日志目录: $(pwd)/logs"
echo ""
echo "🔧 常用命令:"
echo "   - 查看服务状态: pm2 status"
echo "   - 查看日志: pm2 logs log-service"
echo "   - 重启服务: pm2 restart log-service"
echo "   - 停止服务: pm2 stop log-service"
echo ""
echo "⚠️  重要提醒:"
echo "   1. 请编辑 .env 文件设置正确的 API 密钥"
echo "   2. 请将 nginx.conf 中的 IP 地址改为你的实际 IP"
echo "   3. 测试服务: curl http://$(hostname -I | awk '{print $1}')/health"
echo ""