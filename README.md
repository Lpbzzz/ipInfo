# IP信息查询工具

这是一个基于React和Nest.js构建的IP信息查询工具，可以查询当前IP或指定IP的地理位置信息，并在地图上显示位置。

## 功能特点

- 查询当前IP地址的详细信息
- 查询指定IP地址的详细信息
- 在地图上显示IP地址的地理位置
- 显示IP的国家、城市、经纬度等详细信息

## 技术栈

### 前端
- React
- TypeScript
- Ant Design
- Leaflet (地图库)
- Axios

### 后端
- Nest.js
- TypeScript
- Axios

## 快速开始

### 安装依赖

```bash
# 安装根目录依赖
pnpm install

# 安装所有依赖（前端和后端）
pnpm install:all
```

### 开发模式

```bash
# 同时启动前端和后端（开发模式）
pnpm dev
```

### 生产模式

```bash
# 构建前端和后端
pnpm build

# 启动应用（生产模式）
pnpm start
```

## 部署

项目配置了Vercel部署文件，可以直接推送到GitHub并连接到Vercel进行自动部署。

## API接口

### 获取当前IP信息

```
GET /ip-info
```

### 获取指定IP信息

```
GET /ip-info/query?ip=x.x.x.x
```

## 许可证

MIT