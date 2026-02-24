"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldPrices = exports.syncStockPrices = void 0;
const database_1 = require("../utils/database");
const eastmoney_1 = require("./eastmoney");
// 同步所有股票价格
const syncStockPrices = async () => {
    const db = (0, database_1.getDb)();
    const stocks = await new Promise((resolve, reject) => {
        db.all('SELECT id, code, market FROM stocks', (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
    console.log(`Syncing ${stocks.length} stocks...`);
    for (const stock of stocks) {
        try {
            const priceData = await (0, eastmoney_1.fetchStockPrice)(stock.code, stock.market || 'SH');
            if (priceData) {
                await new Promise((resolve, reject) => {
                    db.run(`INSERT INTO stock_prices (stock_id, price, change_percent, volume, date)
             VALUES (?, ?, ?, ?, date('now'))`, [stock.id, priceData.price, priceData.changePercent, priceData.volume], function (err) {
                        if (err)
                            reject(err);
                        else
                            resolve(null);
                    });
                });
                console.log(`Synced ${stock.code}: ¥${priceData.price} (${priceData.changePercent}%)`);
            }
            // 添加延迟避免请求过快
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        catch (error) {
            console.error(`Failed to sync ${stock.code}:`, error);
        }
    }
    console.log('Stock price sync completed');
};
exports.syncStockPrices = syncStockPrices;
// 清理旧数据（保留90天）
const cleanupOldPrices = async () => {
    const db = (0, database_1.getDb)();
    await new Promise((resolve, reject) => {
        db.run("DELETE FROM stock_prices WHERE date < date('now', '-90 days')", function (err) {
            if (err)
                reject(err);
            else {
                console.log(`Cleaned up ${this.changes} old price records`);
                resolve(null);
            }
        });
    });
};
exports.cleanupOldPrices = cleanupOldPrices;
//# sourceMappingURL=stockSync.js.map