import jwt from 'jsonwebtoken';
import {dbAdapter} from '../db/adapter.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未授权访问' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // If token is expired, return a specific message
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: '登录已过期，请重新登录' });
      }
      return res.status(403).json({ error: '无效的令牌' });
    }
    req.user = user;
    next();
  });
};

export const isAdmin = async (req, res, next) => {
  try {
    const user = await dbAdapter.queryOne('SELECT id FROM users WHERE id = ? AND username = ?', [req.user.userId, 'admin']);

    if (!user) {
      return res.status(403).json({ error: '需要管理员权限' });
    }

    next();
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    res.status(500).json({ error: '验证管理员权限失败' });
  }
};
