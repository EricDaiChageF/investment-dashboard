import { Router } from 'express';
import { getDb } from '../utils/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { syncStockPrices } from '../services/stockSync';

const router = Router();

// 获取资产配置数据
router.get('/allocation', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = getDb();
    
    const allocation = await new Promise((resolve, reject) => {
      db.all(
        `SELECT s.category, 
          SUM(s.shares * COALESCE((SELECT price FROM stock_prices WHERE stock_id = s.id ORDER BY date DESC LIMIT 1), s.avg_price)) as value
         FROM stocks s
         WHERE s.shares > 0
         GROUP BY s.category`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    res.json(allocation);
  } catch (error) {
    console.error('Get allocation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取收益曲线数据
router.get('/returns', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = getDb();
    const { days = '30' } = req.query;
    
    const returns = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          sp.date,
          SUM((sp.price - s.avg_price) * s.shares) as total_profit,
          SUM(s.avg_price * s.shares) as total_cost,
          ROUND(SUM((sp.price - s.avg_price) * s.shares) / SUM(s.avg_price * s.shares) * 100, 2) as return_percent
         FROM stock_prices sp
         JOIN stocks s ON sp.stock_id = s.id
         WHERE sp.date >= date('now', '-${days} days')
         AND s.shares > 0
         GROUP BY sp.date
         ORDER BY sp.date ASC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    res.json(returns);
  } catch (error) {
    console.error('Get returns error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取仪表盘汇总数据
router.get('/summary', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = getDb();
    
    const summary = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          COUNT(DISTINCT s.id) as total_stocks,
          SUM(s.shares * COALESCE((SELECT price FROM stock_prices WHERE stock_id = s.id ORDER BY date DESC LIMIT 1), s.avg_price)) as total_value,
          SUM(s.avg_price * s.shares) as total_cost,
          ROUND(
            (SUM(s.shares * COALESCE((SELECT price FROM stock_prices WHERE stock_id = s.id ORDER BY date DESC LIMIT 1), s.avg_price)) - SUM(s.avg_price * s.shares)) 
            / SUM(s.avg_price * s.shares) * 100, 
            2
          ) as total_return_percent
         FROM stocks s
         WHERE s.shares > 0`,
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    res.json(summary);
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 手动同步股票数据
router.post('/sync', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await syncStockPrices();
    res.json({ message: 'Stock prices synced successfully' });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Failed to sync stock prices' });
  }
});

export default router;