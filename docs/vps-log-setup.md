# IP获取服务日志系统

## VPS端日志服务部署指南

### 系统要求
- Ubuntu 18.04+ 
- Node.js 18+
- PM2 (进程管理)
- Nginx (反向代理)

### 部署步骤

#### 1. 更新系统并安装依赖
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2
```

#### 2. 创建日志服务目录
```bash
mkdir -p /home/ubuntu/log-service
cd /home/ubuntu/log-service
```

#### 3. 部署日志服务代码
将提供的代码文件上传到此目录

#### 4. 安装依赖并启动服务
```bash
npm install
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 5. 配置 Nginx
```bash
sudo nano /etc/nginx/sites-available/log-service
```

#### 6. 配置防火墙
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 环境变量配置
创建 `.env` 文件：
```
PORT=3001
LOG_API_KEY=your-secret-api-key-here
DB_PATH=/home/ubuntu/log-service/logs
MAX_LOG_SIZE=100MB
LOG_RETENTION_DAYS=30
```

### 日志文件结构
```
logs/
├── access/
│   ├── 2024-01-01.log
│   └── 2024-01-02.log
├── error/
│   ├── 2024-01-01.log
│   └── 2024-01-02.log
└── system/
    ├── 2024-01-01.log
    └── 2024-01-02.log
```