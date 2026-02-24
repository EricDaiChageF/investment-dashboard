"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = require("./utils/database");
const seed_1 = require("./utils/seed");
const stockSync_1 = require("./services/stockSync");
const auth_1 = __importDefault(require("./routes/auth"));
const stocks_1 = __importDefault(require("./routes/stocks"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const reports_1 = __importDefault(require("./routes/reports"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// 中间件
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['http://localhost', 'http://localhost:80']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(express_1.default.json());
// 路由
app.use('/api/auth', auth_1.default);
app.use('/api/stocks', stocks_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/reports', reports_1.default);
// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 错误处理
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// 启动服务器
const startServer = async () => {
    try {
        // 初始化数据库
        await (0, database_1.initDatabase)();
        // 添加默认数据
        await (0, seed_1.seedData)();
        // 启动服务器
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`API available at http://localhost:${PORT}/api`);
        });
        // 定时任务：每天收盘后同步数据 (15:30)
        node_cron_1.default.schedule('30 15 * * 1-5', async () => {
            console.log('Running scheduled stock price sync...');
            await (0, stockSync_1.syncStockPrices)();
            await (0, stockSync_1.cleanupOldPrices)();
        }, {
            timezone: 'Asia/Shanghai'
        });
        // 定时任务：每周清理旧数据 (周日凌晨)
        node_cron_1.default.schedule('0 2 * * 0', async () => {
            console.log('Running weekly cleanup...');
            await (0, stockSync_1.cleanupOldPrices)();
        }, {
            timezone: 'Asia/Shanghai'
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map