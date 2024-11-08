import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { dbAdapter } from '../db/adapter.js';
import { sendVerificationEmail } from '../utils/email.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRATION = '1y'; // Set JWT expiration to 1 year

const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers
  );
};

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({
        error: '密码必须至少包含8个字符，包括大写字母、小写字母和数字'
      });
    }

    if(!email.endsWith("@company.com")){
      return res.status(400).json({error: '邮箱必须以@company.com结尾'})
    }

    // Check if username exists
    const existingUsername = await dbAdapter.queryOne(
        'SELECT id FROM users WHERE username = ?',
        [username]
    );
    if (existingUsername) {
      return res.status(400).json({ error: '用户名已被注册' });
    }

    // Check if email exists
    const existingEmail = await dbAdapter.queryOne(
        'SELECT id FROM users WHERE email = ?',
        [email]
    );
    if (existingEmail) {
      return res.status(400).json({ error: '邮箱已被注册' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

    await dbAdapter.execute(
        'INSERT INTO users (username, email, password, verification_token) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, verificationToken]
    );

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: '注册成功，请检查邮箱进行验证' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    const user = await dbAdapter.queryOne(
        'SELECT id FROM users WHERE verification_token = ?',
        [token]
    );

    if (!user) {
      return res.status(400).json({ error: '无效的验证链接' });
    }

    await dbAdapter.execute(
        'UPDATE users SET is_active = TRUE, verification_token = NULL WHERE id = ?',
        [user.id]
    );

    res.json({ message: '邮箱验证成功，请登录' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: '验证失败，请稍后重试' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await dbAdapter.queryOne(
        'SELECT * FROM users WHERE (username = ? OR email = ?)',
        [username, username]
    );

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: '请先验证邮箱' });
    }

    const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
    );

    res.json({ token, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

export const authRouter = router;
