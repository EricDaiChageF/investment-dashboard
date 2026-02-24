# 投资周报可视化网站

## 项目简介

投资周报可视化网站是一个用于展示持仓股票信息、资产配置、收益曲线的Web应用。支持自动同步股票数据，提供直观的可视化图表。

## 技术栈

- **后端**: Node.js + Express + TypeScript + SQLite
- **前端**: React + TypeScript + Ant Design + ECharts
- **股票API**: 东方财富API
- **认证**: JWT Token

## 项目结构

```
/root/.openclaw/workspace/investment-dashboard/
├── backend/          # 后端API
│   ├── src/          # 源代码
│   ├── database/     # SQLite数据库
│   └── package.json
├── frontend/         # 前端React
│   ├── src/          # 源代码
│   └── package.json
├── nginx.conf        # Nginx配置
├── start.sh          # 启动脚本
└── stop.sh           # 停止脚本
```

## 快速开始

### 1. 安装依赖并启动

```bash
cd /root/.openclaw/workspace/investment-dashboard
./start.sh
```

### 2. 访问网站

- 网站地址: http://localhost:8080
- API地址: http://localhost:3001/api

### 3. 登录信息

- **用户名**: admin
- **密码**: admin123

## 功能特性

### 登录系统
- JWT Token认证
- bcrypt密码加密
- 登录状态持久化

### 股票数据
- 持仓股票列表展示
- 实时价格显示
- 涨跌幅计算
- 盈亏统计
- 手动/自动数据同步

### 数据可视化
- 持仓股票涨跌幅卡片
- 资产配置饼图
- 收益曲线图
- 响应式布局

### 定时任务
- 每天收盘后自动同步数据 (15:30)
- 每周清理旧数据 (周日凌晨)

## API接口

### 认证
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册

### 股票
- `GET /api/stocks` - 获取股票列表
- `GET /api/stocks/:code` - 获取股票详情
- `GET /api/stocks/:code/history` - 获取历史价格
- `POST /api/stocks` - 添加股票
- `PUT /api/stocks/:id` - 更新股票
- `DELETE /api/stocks/:id` - 删除股票

### 仪表盘
- `GET /api/dashboard/summary` - 获取汇总数据
- `GET /api/dashboard/allocation` - 获取资产配置
- `GET /api/dashboard/returns` - 获取收益曲线
- `POST /api/dashboard/sync` - 手动同步数据

### 报告
- `GET /api/reports` - 获取报告列表
- `POST /api/reports` - 添加报告
- `DELETE /api/reports/:id` - 删除报告

## 默认持仓股票

| 名称 | 代码 | 市场 | 类别 |
|------|------|------|------|
| 比亚迪 | 002594 | 深证 | 汽车 |
| 贵州茅台 | 600519 | 上证 | 白酒 |
| 招商银行 | 600036 | 上证 | 银行 |
| 美团-W | 03690 | 港股 | 互联网 |
| 拼多多 | PDD | 美股 | 互联网 |

## 开发命令

### 后端
```bash
cd backend
npm install
npm run dev      # 开发模式
npm run build    # 编译
npm start        # 生产模式
```

### 前端
```bash
cd frontend
npm install
npm run dev      # 开发模式
npm run build    # 构建
npm run preview  # 预览
```

## 数据库

SQLite数据库文件位于 `backend/database/investment.db`

### 数据表

- **users** - 用户表
- **stocks** - 股票表
- **stock_prices** - 股价历史表
- **reports** - 周报PDF表

## 注意事项

1. 首次启动会自动创建数据库和默认数据
2. 股票数据需要手动同步或等待定时任务
3. 美股数据可能因API限制无法获取
4. 建议使用Chrome/Firefox浏览器访问

## 停止服务

```bash
./stop.sh
```

## 日志文件

- 后端日志: `backend.log`
- 前端日志: `frontend.log`