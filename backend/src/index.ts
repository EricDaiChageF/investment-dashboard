import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { initDatabase } from './utils/database';
import { seedData } from './utils/seed';
import { syncStockPrices, cleanupOldPrices } from './services/stockSync';

import authRoutes from './routes/auth';
import stockRoutes from './routes/stocks';
import dashboardRoutes from './routes/dashboard';
import reportRoutes from './routes/reports';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost', 'http://localhost:80'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库
    await initDatabase();
    
    // 添加默认数据
    await seedData();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
    
    // 定时任务：每天收盘后同步数据 (15:30)
    cron.schedule('30 15 * * 1-5', async () => {
      console.log('Running scheduled stock price sync...');
      await syncStockPrices();
      await cleanupOldPrices();
    }, {
      timezone: 'Asia/Shanghai'
    });
    
    // 定时任务：每周清理旧数据 (周日凌晨)
    cron.schedule('0 2 * * 0', async () => {
      console.log('Running weekly cleanup...');
      await cleanupOldPrices();
    }, {
      timezone: 'Asia/Shanghai'
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();