// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
router.post('/register',
  [
    body('email').isEmail().withMessage('Email không hợp lệ.'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự.'),
    body('firstName').notEmpty().withMessage('Thiếu tên.'),
    body('lastName').notEmpty().withMessage('Thiếu họ.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const { email, password, firstName, lastName, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email đã được đăng ký.' });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      id: uuidv4(), email, password: hash, firstName, lastName,
      phone: phone || '', address: {}, role: 'user'
    });

    const token = signToken(user);
    const safe = user.toObject();
    delete safe.password;
    res.status(201).json({ success: true, token, user: safe });
  }
);

// POST /api/auth/login
router.post('/login',
  [
    body('email').isEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });

    const token = signToken(user);
    const safe = user.toObject();
    delete safe.password;
    res.json({ success: true, token, user: safe });
  }
);

// GET /api/auth/me — requires token
router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findOne({ id: req.user.id });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  const safe = user.toObject();
  delete safe.password;
  res.json({ success: true, user: safe });
});

// PUT /api/auth/me — update profile
router.put('/me', authMiddleware, async (req, res) => {
  const user = await User.findOne({ id: req.user.id });
  if (!user) return res.status(404).json({ success: false });
  const { firstName, lastName, phone, address } = req.body;
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;
  if (address) user.address = { ...user.address, ...address };
  await user.save();
  const safe = user.toObject();
  delete safe.password;
  res.json({ success: true, user: safe });
});

module.exports = router;