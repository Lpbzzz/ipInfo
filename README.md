# IP地理位置查询工具

一个基于React + TypeScript + Ant Design的IP地理位置查询应用，支持查询当前IP和指定IP的详细地理信息。

## 功能特性

- 🌍 查询当前IP地理位置信息
- 🔍 查询指定IP地址的地理位置
- 🗺️ 交互式地图显示位置
- 📱 响应式设计，支持移动端
- 🎨 美观的UI界面，基于Ant Design
- ⚡ 快速查询，支持多个IP查询API

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

## 项目结构

```
├── api/                    # Vercel API路由
│   ├── ip-info/           # IP信息API
│   └── lib/               # 工具函数
├── frontend/              # 前端代码
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── types/         # TypeScript类型定义
│   │   └── ...
│   └── ...
├── backend/               # 原后端代码（已迁移到API路由）
├── vercel.json           # Vercel配置文件
└── package.json          # 项目配置
```

## 许可证

MIT License