# Vercel 日志服务配置指南

## 概述

本项目支持将日志发送到VPS上的远程日志服务。在Vercel中，你可以通过环境变量来配置日志服务的地址和API密钥。

## 环境变量配置

### 方式一：通过 Vercel Dashboard 设置

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下环境变量：

#### 后端服务日志配置
```
LOG_SERVICE_URL = https://your-vps-domain.com:3001
LOG_SERVICE_API_KEY = your-production-secret-key-change-this-to-strong-password
SERVICE_NAME = ip-get-backend
REMOTE_LOGGING_ENABLED = true
```

#### API路由日志配置
```
LOG_REMOTE_ENDPOINT = https://your-vps-domain.com:3001
LOG_API_KEY = your-production-secret-key-change-this-to-strong-password
```

#### 通用配置
```
NODE_ENV = production
```

### 方式二：通过 Vercel CLI 设置

1. 安装 Vercel CLI：
```bash
npm i -g vercel
```

2. 运行配置脚本：
```bash
chmod +x scripts/setup-vercel-env.sh
./scripts/setup-vercel-env.sh
```

3. 按提示输入各环境变量的值

## 重要注意事项

### 1. API密钥一致性
- `LOG_SERVICE_API_KEY` 和 `LOG_API_KEY` 必须相同
- 这个密钥必须与VPS日志服务中的 `LOG_API_KEY` 一致

### 2. 服务地址配置
- `LOG_SERVICE_URL` 和 `LOG_REMOTE_ENDPOINT` 应该指向同一个日志服务
- 建议使用HTTPS协议和域名，而不是IP地址

### 3. VPS配置
确保VPS上的日志服务配置正确：

```bash
# vps-log-service/.env
PORT=3001
LOG_API_KEY=your-production-secret-key-change-this-to-strong-password
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

### 4. 防火墙设置
确保VPS防火墙开放日志服务端口：
```bash
# 开放3001端口
sudo ufw allow 3001
```

### 5. SSL证书（推荐）
为了安全，建议为日志服务配置SSL证书：
- 使用Nginx反向代理
- 配置Let's Encrypt证书
- 使用HTTPS协议

## 测试配置

部署到Vercel后，可以通过以下方式测试日志功能：

1. 访问API端点触发日志记录
2. 检查VPS日志服务的日志文件
3. 查看Vercel的函数日志

## 环境变量说明

| 变量名 | 用途 | 示例值 |
|--------|------|--------|
| `LOG_SERVICE_URL` | 后端服务日志地址 | `https://logs.example.com:3001` |
| `LOG_SERVICE_API_KEY` | 后端服务API密钥 | `your-secret-key` |
| `LOG_REMOTE_ENDPOINT` | API路由日志地址 | `https://logs.example.com:3001` |
| `LOG_API_KEY` | API路由API密钥 | `your-secret-key` |
| `SERVICE_NAME` | 服务名称 | `ip-get-backend` |
| `REMOTE_LOGGING_ENABLED` | 是否启用远程日志 | `true` |
| `NODE_ENV` | 运行环境 | `production` |

## 故障排除

### 1. 日志未发送到VPS
- 检查环境变量是否正确设置
- 确认VPS日志服务正在运行
- 检查防火墙和网络连接

### 2. API密钥认证失败
- 确保所有API密钥一致
- 检查密钥是否包含特殊字符需要转义

### 3. CORS错误
- 在VPS日志服务的 `ALLOWED_ORIGINS` 中添加Vercel域名
- 确保使用正确的协议（HTTP/HTTPS）

## 安全建议

1. **使用强密码**：API密钥应该是随机生成的强密码
2. **定期轮换**：定期更换API密钥
3. **限制来源**：在VPS上配置 `ALLOWED_ORIGINS` 限制请求来源
4. **使用HTTPS**：生产环境必须使用HTTPS协议
5. **监控日志**：定期检查日志服务的访问日志