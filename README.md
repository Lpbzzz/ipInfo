# IP信息查询工具

一个基于React的IP地址信息查询工具，采用双后端架构设计，支持本地开发和生产部署。

## 🌟 功能特性

- 🌍 **自动获取用户IP**：自动检测并显示用户当前的IP地址和地理位置
- 🔍 **IP地址查询**：支持查询任意IP地址的详细信息
- 🗺️ **地图可视化**：在地图上显示IP地址对应的地理位置
- 📱 **响应式设计**：支持桌面端和移动端访问
- ⚡ **实时查询**：快速响应，实时获取IP信息
- 🎨 **现代化UI**：简洁美观的用户界面
- 📊 **日志记录**：完整的请求日志和错误追踪

## 🏗️ 双后端架构

### 本地开发环境
- **前端**: React + Vite (http://localhost:5173)
- **后端**: NestJS (http://localhost:8080)
- **日志**: VPS 日志服务 (可选)

### 生产环境
- **前端**: Vercel 静态部署
- **后端**: Vercel Serverless Functions
- **日志**: VPS 日志服务

## 技术栈

### 前端
- React 18
- TypeScript
- Ant Design
- Leaflet (地图组件)
- Axios (HTTP客户端)
- Vite (构建工具)

### 后端 (Vercel API路由)
- Node.js
- TypeScript
- Vercel Functions

## 本地开发

### 安装依赖
```bash
npm run install:all
```

### 启动开发服务器
```bash
npm run dev
```

前端将在 http://localhost:5173 启动
后端将在 http://localhost:3001 启动

## 部署到Vercel

### 方法一：通过Vercel CLI部署

1. 安装Vercel CLI
```bash
npm i -g vercel
```

2. 登录Vercel
```bash
vercel login
```

3. 部署项目
```bash
vercel
```

### 方法二：通过GitHub自动部署

1. 将代码推送到GitHub仓库

2. 在Vercel控制台导入GitHub仓库

3. 配置构建设置：
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm run install:all`

4. 部署完成后，Vercel会自动为你分配一个域名

### 环境变量配置

如果需要配置API密钥等环境变量，可以在Vercel控制台的Settings > Environment Variables中添加：

- `IP_GEOLOCATION_API_KEY`: IP地理位置查询API密钥（可选）

## API接口

### 获取当前IP信息
```
GET /api/ip-info
```

### 查询指定IP信息
```
GET /api/ip-info/query?ip=8.8.8.8
```

### 健康检查
```
GET /api/ip-info/health
```

## 📁 项目结构

```
ipGet/
├── api/                    # Vercel Serverless API (生产环境)
│   ├── ip-info/           # IP信息API
│   └── lib/               # 工具函数
├── backend/               # NestJS 后端服务 (本地开发)
│   ├── src/
│   │   ├── ip-info/       # IP信息模块
│   │   └── main.ts        # 应用入口
│   └── ...
├── frontend/              # React 前端应用
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── types/         # TypeScript类型定义
│   │   └── ...
│   └── ...
├── vps-log-service/       # VPS 日志服务
│   ├── src/server.js      # 日志服务器
│   └── ...
├── docs/                  # 项目文档
│   ├── DEPLOYMENT_GUIDE.md
│   ├── PROJECT_STRUCTURE.md
│   └── vps-log-setup.md
├── vercel.json           # Vercel配置文件
├── start.sh              # 启动脚本
└── package.json          # 项目配置
```

> 详细的项目结构说明请查看 [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)

## 许可证

MIT License

## 更新日志

### v1.1.0 (2025-07-28)
- ✨ 添加IP输入验证功能
- 🔒 禁用空输入时的查询按钮
- 🚀 配置Vercel自动部署
- 🔧 优化用户体验