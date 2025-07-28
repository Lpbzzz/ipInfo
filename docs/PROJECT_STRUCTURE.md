# 项目结构说明

## 📁 目录结构

```
ipGet/
├── api/                          # Vercel Serverless API (生产环境)
│   ├── ip-info/
│   │   ├── health.ts            # 健康检查 API
│   │   ├── index.ts             # 获取用户 IP API
│   │   └── query.ts             # IP 查询 API
│   └── lib/
│       ├── ip-info-converter.ts # IP 信息转换工具
│       ├── ip-utils.ts          # IP 工具函数
│       └── logger.ts            # 日志工具类
├── backend/                      # NestJS 后端服务 (本地开发)
│   ├── src/
│   │   ├── ip-info/             # IP 信息模块
│   │   ├── app.module.ts        # 应用模块
│   │   └── main.ts              # 应用入口
│   ├── package.json             # 后端依赖配置
│   └── tsconfig.json            # 后端 TypeScript 配置
├── frontend/                     # React 前端应用
│   ├── src/
│   │   ├── components/          # React 组件
│   │   ├── types/               # TypeScript 类型定义
│   │   └── ...
│   ├── package.json             # 前端依赖配置
│   └── vite.config.ts           # Vite 配置
├── vps-log-service/             # VPS 日志服务
│   ├── src/server.js            # Express 日志服务器
│   ├── deploy.sh                # 部署脚本
│   ├── ecosystem.config.js      # PM2 配置
│   └── nginx.conf               # Nginx 配置
├── docs/                        # 项目文档
│   ├── DEPLOYMENT_GUIDE.md      # 部署指南
│   ├── PROJECT_SUMMARY.md       # 项目总结
│   ├── CLEANUP_SUMMARY.md       # 清理总结
│   ├── PROJECT_STRUCTURE.md     # 项目结构说明
│   └── vps-log-setup.md         # VPS 日志设置
├── .biomeignore                 # Biome 忽略文件
├── .gitignore                   # Git 忽略文件
├── biome.json                   # Biome 配置
├── package.json                 # 项目根配置
├── start.sh                     # 启动脚本
└── vercel.json                  # Vercel 配置
```

## 🔄 双后端架构说明

### 本地开发环境
- **前端**: React + Vite (http://localhost:5173)
- **后端**: NestJS (http://localhost:8080)
- **日志**: VPS 日志服务 (可选)

### 生产环境
- **前端**: Vercel 静态部署
- **后端**: Vercel Serverless Functions (api/ 目录)
- **日志**: VPS 日志服务

## 📋 配置文件说明

### 项目级别配置
- `package.json` - 项目根配置，包含启动脚本和开发工具
- `biome.json` - 代码格式化和检查配置
- `.biomeignore` - Biome 忽略文件配置
- `.gitignore` - Git 忽略文件配置
- `vercel.json` - Vercel 部署配置
- `start.sh` - 本地开发启动脚本

### 服务特定配置
- `frontend/package.json` - 前端依赖和脚本
- `frontend/vite.config.ts` - Vite 构建配置
- `backend/package.json` - 后端依赖和脚本
- `backend/tsconfig.json` - 后端 TypeScript 配置
- `vps-log-service/package.json` - 日志服务依赖

## 🚀 启动方式

### 本地开发
```bash
# 启动前后端服务
./start.sh
# 或者
pnpm run dev
```

### 生产部署
```bash
# 部署到 Vercel
npx vercel --prod

# 部署日志服务到 VPS
cd vps-log-service && ./deploy.sh
```

## 🔧 开发工具

### 代码质量
```bash
pnpm run format    # 格式化代码
pnpm run lint      # 检查代码质量
pnpm run check     # 完整检查
```

### 依赖管理
```bash
pnpm run install:all  # 安装所有依赖
```