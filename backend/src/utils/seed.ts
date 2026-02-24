import { getDb } from '../utils/database';
import { hashPassword } from '../utils/auth';

// 初始化默认数据
export const seedData = async (): Promise<void> => {
  const db = getDb();
  
  // 检查是否已有用户
  const userCount = await new Promise<number>((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM users', (err, row: any) => {
      if (err) reject(err);
      else resolve(row?.count || 0);
    });
  });
  
  // 如果没有用户，创建默认用户
  if (userCount === 0) {
    const passwordHash = await hashPassword('admin123');
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, password_hash) VALUES (?, ?)',
        ['admin', passwordHash],
        function(err) {
          if (err) reject(err);
          else {
            console.log('Default user created: admin/admin123');
            resolve(null);
          }
        }
      );
    });
  }
  
  // 检查是否已有股票
  const stockCount = await new Promise<number>((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM stocks', (err, row: any) => {
      if (err) reject(err);
      else resolve(row?.count || 0);
    });
  });
  
  // 如果没有股票，添加默认持仓
  if (stockCount === 0) {
    const defaultStocks = [
      { code: '002594', name: '比亚迪', category: '汽车', shares: 100, avg_price: 250, market: 'SZ' },
      { code: '600519', name: '贵州茅台', category: '白酒', shares: 50, avg_price: 1700, market: 'SH' },
      { code: '600036', name: '招商银行', category: '银行', shares: 500, avg_price: 35, market: 'SH' },
      { code: '03690', name: '美团-W', category: '互联网', shares: 200, avg_price: 150, market: 'HK' },
      { code: 'PDD', name: '拼多多', category: '互联网', shares: 100, avg_price: 120, market: 'US' }
    ];
    
    for (const stock of defaultStocks) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO stocks (code, name, category, shares, avg_price, market) VALUES (?, ?, ?, ?, ?, ?)',
          [stock.code, stock.name, stock.category, stock.shares, stock.avg_price, stock.market],
          function(err) {
            if (err) reject(err);
            else resolve(null);
          }
        );
      });
    }
    console.log(`Added ${defaultStocks.length} default stocks`);
  }
};