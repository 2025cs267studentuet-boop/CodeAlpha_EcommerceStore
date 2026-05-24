const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// Register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const hashedPassword = bcrypt.hashSync(password, 10);
  db.users.insert({ name, email, password: hashedPassword, role: 'user', createdAt: new Date() }, (err, user) => {
    if (err) return res.status(400).json({ error: 'Email already in use' });
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  db.users.findOne({ email }, (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: 'Invalid email or password' });

    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Get current user
router.get('/me', (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: 'Not authenticated' });
  res.json({ user: { id: req.session.userId, name: req.session.userName, email: req.session.userEmail } });
});

module.exports = router;
