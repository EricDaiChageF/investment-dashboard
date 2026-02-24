import { Router } from 'express';
import { getDb } from '../utils/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 获取报告列表
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = getDb();
    const { limit = '10' } = req.query;
    
    const reports = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM reports ORDER BY report_date DESC LIMIT ?',
        [parseInt(limit as string)],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 添加报告
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, file_path, report_date } = req.body;
    const db = getDb();
    
    const result = await new Promise<{ id: number }>((resolve, reject) => {
      db.run(
        'INSERT INTO reports (title, file_path, report_date) VALUES (?, ?, ?)',
        [title, file_path, report_date],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
    
    res.status(201).json({ message: 'Report added', id: result.id });
  } catch (error) {
    console.error('Add report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除报告
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM reports WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(null);
      });
    });
    
    res.json({ message: 'Report deleted' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;