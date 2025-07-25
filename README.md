# IP信息查询工具

这是一个基于React和Nest.js构建的IP信息查询工具，可以查询当前IP或指定IP的地理位置信息，并在地图上显示位置。项目支持一键部署到Vercel，每次推送到GitHub都会自动重新构建。

## 功能特点

- 查询当前IP地址的详细信息
- 查询指定IP地址的详细信息
- 在地图上显示IP地址的地理位置
- 显示IP的国家、城市、经纬度等详细信息
- 支持一键部署到Vercel
- 支持GitHub自动构建集成

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
```

## 部署到GitHub和Vercel

### GitHub部署

1. 在GitHub上创建一个新的仓库

2. 将本地仓库与GitHub仓库关联

```bash
# 添加远程仓库
git remote add origin https://github.com/你的用户名/ipGet.git

# 切换到main分支
git branch -M main

# 推送到GitHub
git push -u origin main
```

### Vercel部署

1. 在Vercel上注册账号并连接GitHub

2. 导入GitHub仓库
   - 登录Vercel后，点击"New Project"
   - 选择你的GitHub仓库
   - Vercel会自动检测项目类型并提供默认配置

3. 部署设置
   - 项目已包含`vercel.json`配置文件，Vercel会自动识别并使用该配置
   - 无需额外配置，点击"Deploy"即可

4. 自动部署
   - 每次推送到GitHub仓库的main分支，Vercel都会自动重新构建和部署

## 项目结构

```
/
├── frontend/         # 前端React应用
├── backend/          # 后端Nest.js应用
├── package.json      # 根目录依赖和脚本
├── vercel.json       # Vercel部署配置
└── start.sh          # 启动脚本
```

## 环境变量

项目支持通过环境变量配置：

- `http_proxy` - HTTP代理设置
- `https_proxy` - HTTPS代理设置

## 许可证

MIT
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