#!/bin/bash

# Vercel环境变量设置脚本
# 使用前请先安装 Vercel CLI: npm i -g vercel

echo "🚀 设置 Vercel 环境变量..."

# 设置后端服务的远程日志配置
echo "📝 设置后端服务日志配置..."
vercel env add LOG_SERVICE_URL production
# 输入: https://your-vps-domain.com:3001

vercel env add LOG_SERVICE_API_KEY production
# 输入: your-production-secret-key-change-this-to-strong-password

vercel env add SERVICE_NAME production
# 输入: ip-get-backend

vercel env add REMOTE_LOGGING_ENABLED production
# 输入: true

# 设置API路由的远程日志配置
echo "📝 设置API路由日志配置..."
vercel env add LOG_REMOTE_ENDPOINT production
# 输入: https://your-vps-domain.com:3001

vercel env add LOG_API_KEY production
# 输入: your-production-secret-key-change-this-to-strong-password

vercel env add NODE_ENV production
# 输入: production

echo "✅ 环境变量设置完成！"
echo ""
echo "📝 请记得在VPS上也要设置对应的LOG_API_KEY"
echo "📝 确保VPS防火墙开放了日志服务端口"
echo "📝 建议使用HTTPS和域名访问日志服务"
echo ""
echo "🔧 环境变量说明："
echo "  后端服务使用: LOG_SERVICE_URL, LOG_SERVICE_API_KEY"
echo "  API路由使用: LOG_REMOTE_ENDPOINT, LOG_API_KEY"
echo "  两者的API密钥应该相同"

# 查看已设置的环境变量
echo "🔍 当前环境变量："
vercel env ls