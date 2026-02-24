import { getDb } from '../utils/database';
import { fetchStockPrice } from './eastmoney';

// 同步所有股票价格
export const syncStockPrices = async (): Promise<void> => {
  const db = getDb();
  
  const stocks = await new Promise<Array<{ id: number; code: string; market: string }>>((resolve, reject) => {
    db.all('SELECT id, code, market FROM stocks', (err, rows) => {
      if (err) reject(err);
      else resolve(rows as Array<{ id: number; code: string; market: string }>);
    });
  });
  
  console.log(`Syncing ${stocks.length} stocks...`);
  
  for (const stock of stocks) {
    try {
      const priceData = await fetchStockPrice(stock.code, stock.market || 'SH');
      
      if (priceData) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO stock_prices (stock_id, price, change_percent, volume, date)
             VALUES (?, ?, ?, ?, date('now'))`,
            [stock.id, priceData.price, priceData.changePercent, priceData.volume],
            function(err) {
              if (err) reject(err);
              else resolve(null);
            }
          );
        });
        console.log(`Synced ${stock.code}: ¥${priceData.price} (${priceData.changePercent}%)`);
      }
      
      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Failed to sync ${stock.code}:`, error);
    }
  }
  
  console.log('Stock price sync completed');
};

// 清理旧数据（保留90天）
export const cleanupOldPrices = async (): Promise<void> => {
  const db = getDb();
  
  await new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM stock_prices WHERE date < date('now', '-90 days')",
      function(err) {
        if (err) reject(err);
        else {
          console.log(`Cleaned up ${this.changes} old price records`);
          resolve(null);
        }
      }
    );
  });
};