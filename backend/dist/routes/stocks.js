"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../utils/database");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// 获取所有股票
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const db = (0, database_1.getDb)();
        const stocks = await new Promise((resolve, reject) => {
            db.all(`SELECT s.*, 
          (SELECT price FROM stock_prices WHERE stock_id = s.id ORDER BY date DESC LIMIT 1) as current_price,
          (SELECT change_percent FROM stock_prices WHERE stock_id = s.id ORDER BY date DESC LIMIT 1) as change_percent
         FROM stocks s ORDER BY s.id`, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
        res.json(stocks);
    }
    catch (error) {
        console.error('Get stocks error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 获取单个股票详情
router.get('/:code', auth_1.authMiddleware, async (req, res) => {
    try {
        const { code } = req.params;
        const db = (0, database_1.getDb)();
        const stock = await new Promise((resolve, reject) => {
            db.get(`SELECT s.*, 
          (SELECT price FROM stock_prices WHERE stock_id = s.id ORDER BY date DESC LIMIT 1) as current_price,
          (SELECT change_percent FROM stock_prices WHERE stock_id = s.id ORDER BY date DESC LIMIT 1) as change_percent
         FROM stocks s WHERE s.code = ?`, [code], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row || null);
            });
        });
        if (!stock) {
            res.status(404).json({ error: 'Stock not found' });
            return;
        }
        res.json(stock);
    }
    catch (error) {
        console.error('Get stock error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 获取股票历史价格
router.get('/:code/history', auth_1.authMiddleware, async (req, res) => {
    try {
        const { code } = req.params;
        const { days = '30' } = req.query;
        const db = (0, database_1.getDb)();
        const history = await new Promise((resolve, reject) => {
            db.all(`SELECT sp.* FROM stock_prices sp
         JOIN stocks s ON sp.stock_id = s.id
         WHERE s.code = ?
         AND sp.date >= date('now', '-${days} days')
         ORDER BY sp.date ASC`, [code], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
        res.json(history);
    }
    catch (error) {
        console.error('Get stock history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 添加股票
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { code, name, category, shares, avg_price, market } = req.body;
        const db = (0, database_1.getDb)();
        const result = await new Promise((resolve, reject) => {
            db.run('INSERT INTO stocks (code, name, category, shares, avg_price, market) VALUES (?, ?, ?, ?, ?, ?)', [code, name, category, shares, avg_price, market], function (err) {
                if (err)
                    reject(err);
                else
                    resolve({ id: this.lastID });
            });
        });
        res.status(201).json({ message: 'Stock added', id: result.id });
    }
    catch (error) {
        console.error('Add stock error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 更新股票
router.put('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { shares, avg_price } = req.body;
        const db = (0, database_1.getDb)();
        await new Promise((resolve, reject) => {
            db.run('UPDATE stocks SET shares = ?, avg_price = ? WHERE id = ?', [shares, avg_price, id], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(null);
            });
        });
        res.json({ message: 'Stock updated' });
    }
    catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// 删除股票
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const db = (0, database_1.getDb)();
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM stocks WHERE id = ?', [id], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(null);
            });
        });
        res.json({ message: 'Stock deleted' });
    }
    catch (error) {
        console.error('Delete stock error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=stocks.js.map