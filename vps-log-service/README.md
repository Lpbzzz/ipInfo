# VPS 日志服务

一个用于接收和管理来自 Vercel 应用日志的服务。

## 功能特性

- 🔐 API Key 认证
- 📊 日志分类存储 (access/error/system/api)
- 🔍 日志查询和统计
- 🧹 自动清理过期日志
- 📈 请求限制和安全防护
- 🚀 PM2 进程管理
- 🌐 Nginx 反向代理

## 快速部署

### 1. 在 VPS 上克隆项目

```bash
# 克隆项目
git clone <your-repo-url>
cd vps-log-service

# 给部署脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

### 2. 配置环境变量

```bash
# 编辑环境变量
nano .env

# 必须修改的配置:
# - LOG_API_KEY: 设置强密码
# - VPS_IP: 设置你的实际 IP
# - ALLOWED_ORIGINS: 设置允许的来源域名
```

### 3. 更新 Nginx 配置

```bash
# 编辑 Nginx 配置，将 YOUR_VPS_IP 替换为你的实际 IP
sudo nano /etc/nginx/sites-available/log-service

# 重启 Nginx
sudo systemctl restart nginx
```

### 4. 测试服务

```bash
# 测试健康检查
curl http://你的IP/health

# 测试日志接收 (需要正确的 API Key)
curl -X POST http://你的IP/api/logs \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2024-01-01T12:00:00.000Z",
    "level": "info",
    "message": "测试日志",
    "requestId": "test-123"
  }'
```

## API 接口

### 1. 健康检查
```
GET /health
```

### 2. 接收日志
```
POST /api/logs
Headers: Authorization: Bearer <API_KEY>
Body: {
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info|warn|error|debug",
  "message": "日志消息",
  "requestId": "可选的请求ID",
  "metadata": { "可选的元数据": "值" }
}
```

### 3. 查询日志
```
GET /api/logs?date=2024-01-01&level=error&limit=100&offset=0
Headers: Authorization: Bearer <API_KEY>
```

### 4. 日志统计
```
GET /api/logs/stats?date=2024-01-01
Headers: Authorization: Bearer <API_KEY>
```

### 5. 清理日志
```
DELETE /api/logs/cleanup
Headers: Authorization: Bearer <API_KEY>
```

## 目录结构

```
vps-log-service/
├── src/
│   └── server.js          # 主服务文件
├── logs/                  # 日志存储目录
│   ├── access/           # 访问日志
│   ├── error/            # 错误日志
│   ├── system/           # 系统日志
│   ├── api/              # API 日志
│   └── pm2/              # PM2 日志
├── .env.example          # 环境变量示例
├── package.json          # 项目配置
├── ecosystem.config.js   # PM2 配置
├── nginx.conf           # Nginx 配置
├── deploy.sh            # 部署脚本
└── README.md            # 说明文档
```

## 常用命令

```bash
# PM2 管理
pm2 status                # 查看服务状态
pm2 logs log-service     # 查看服务日志
pm2 restart log-service  # 重启服务
pm2 stop log-service     # 停止服务
pm2 delete log-service   # 删除服务

# Nginx 管理
sudo systemctl status nginx    # 查看 Nginx 状态
sudo systemctl restart nginx   # 重启 Nginx
sudo nginx -t                  # 测试配置文件

# 日志查看
tail -f logs/system/$(date +%Y-%m-%d).log  # 查看今天的系统日志
tail -f logs/api/$(date +%Y-%m-%d).log     # 查看今天的 API 日志
```

## 安全注意事项

1. **修改默认 API Key**: 必须在 `.env` 中设置强密码
2. **防火墙配置**: 只开放必要端口 (22, 80, 443)
3. **定期更新**: 保持系统和依赖包更新
4. **日志轮转**: 配置了自动清理过期日志
5. **请求限制**: 内置了请求频率限制

## 故障排除

### 服务无法启动
```bash
# 检查端口占用
sudo netstat -tlnp | grep :3001

# 检查 PM2 日志
pm2 logs log-service

# 检查系统日志
sudo journalctl -u nginx -f
```

### 无法接收日志
```bash
# 检查防火墙
sudo ufw status

# 检查 Nginx 配置
sudo nginx -t

# 检查服务状态
curl http://localhost:3001/health
```

## 监控建议

1. 设置 PM2 监控: `pm2 monitor`
2. 配置日志告警
3. 定期检查磁盘空间
4. 监控服务响应时间