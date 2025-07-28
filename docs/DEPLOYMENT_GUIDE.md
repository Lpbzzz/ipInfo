# 🚀 完整部署指南

## 📋 当前状态

✅ **已完成的工作：**
- ✅ 创建了完整的日志系统代码
- ✅ 配置了 Vercel API 端的日志功能
- ✅ 创建了 VPS 端日志服务代码
- ✅ 配置了环境变量和测试脚本
- ✅ 验证了网络连接（VPS IP: YOUR_VPS_IP 可达）

⚠️ **待完成的工作：**
- ⚠️ 在 VPS 上部署日志服务
- ⚠️ 配置 Nginx 和防火墙
- ⚠️ 测试端到端日志功能
- ⚠️ 部署到 Vercel

## 🎯 下一步操作

### 第一步：在 VPS 上部署日志服务

1. **登录你的阿里云 VPS (YOUR_VPS_IP)**
   ```bash
   ssh root@YOUR_VPS_IP
   ```

2. **克隆项目到 VPS**
   ```bash
   # 如果你已经将代码推送到 Git 仓库
   git clone <你的仓库地址>
   cd <项目名>/vps-log-service
   
   # 或者手动创建目录并复制文件
   mkdir -p /opt/log-service
   cd /opt/log-service
   ```

3. **运行自动部署脚本**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. **配置环境变量**
   ```bash
   cp .env.example .env
   nano .env
   
   # 重要：修改以下配置
   LOG_API_KEY=your-super-secret-api-key-change-this  # 改为强密码
   VPS_IP=YOUR_VPS_IP
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```

5. **启动服务**
   ```bash
   npm install
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### 第二步：测试 VPS 服务

在本地运行测试脚本：
```bash
./test-vps-direct.sh
```

### 第三步：部署到 Vercel

1. **配置 Vercel 环境变量**
   在 Vercel 项目设置中添加：
   ```
   LOG_REMOTE_ENDPOINT=http://YOUR_VPS_IP/api/logs
   LOG_API_KEY=your-super-secret-api-key-change-this
   NODE_ENV=production
   ```

2. **部署项目**
   ```bash
   npx vercel --prod
   ```

### 第四步：端到端测试

部署完成后，访问你的 Vercel 应用的 API 端点：
- `https://your-app.vercel.app/api/ip-info/health`
- `https://your-app.vercel.app/api/ip-info/query?ip=8.8.8.8`

检查 VPS 上的日志：
```bash
# 在 VPS 上查看日志
tail -f /opt/log-service/logs/info/$(date +%Y-%m-%d).log
```

## 📁 项目文件结构

```
ipGet/
├── api/                    # Vercel API 端
│   ├── ip-info/
│   │   ├── health.ts      # 健康检查 API
│   │   ├── index.ts       # 获取用户 IP API
│   │   └── query.ts       # IP 查询 API
│   └── lib/
│       └── logger.ts      # 日志工具类
├── vps-log-service/       # VPS 端日志服务
│   ├── src/server.js      # 主服务文件
│   ├── package.json       # 依赖配置
│   ├── deploy.sh          # 自动部署脚本
│   ├── ecosystem.config.js # PM2 配置
│   ├── nginx.conf         # Nginx 配置
│   └── README.md          # 详细文档
├── .env.local             # 本地环境变量
├── .env.example           # 环境变量示例
├── test-vps-direct.sh     # VPS 连接测试
├── test-api.sh            # API 测试脚本
└── verify-deployment.sh   # 部署验证脚本
```

## 🔧 常用命令

### VPS 端管理
```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs log-service

# 重启服务
pm2 restart log-service

# 查看实时日志
tail -f logs/info/$(date +%Y-%m-%d).log
```

### 本地测试
```bash
# 验证部署准备
./verify-deployment.sh

# 测试 VPS 连接
./test-vps-direct.sh

# 检查代码质量
npm run check
```

## 🔐 安全注意事项

1. **修改默认 API Key**：务必在 `.env` 文件中设置强密码
2. **防火墙配置**：只开放必要端口 (22, 80, 443)
3. **HTTPS 配置**：生产环境建议配置 SSL 证书
4. **日志轮转**：配置了自动清理 30 天前的日志

## 📞 故障排除

如果遇到问题，请检查：

1. **网络连接**：`ping YOUR_VPS_IP`
2. **端口开放**：`telnet YOUR_VPS_IP 80`
3. **服务状态**：`pm2 status`
4. **Nginx 状态**：`sudo systemctl status nginx`
5. **防火墙状态**：`sudo ufw status`

## 🎉 完成后的功能

- ✅ 结构化日志记录
- ✅ 多级别日志 (ERROR, WARN, INFO, DEBUG)
- ✅ 请求追踪 (Request ID)
- ✅ 远程日志存储
- ✅ 日志查询和统计
- ✅ 自动日志清理
- ✅ 高可用性部署

准备好开始部署了吗？