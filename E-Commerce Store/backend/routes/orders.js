const express = require('express');
const router = express.Router();
const db = require('../db');

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Login required' });
  next();
}

// Place order
router.post('/', requireAuth, (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'No items in order' });
  if (!shippingAddress) return res.status(400).json({ error: 'Shipping address required' });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const order = {
    userId: req.session.userId,
    userName: req.session.userName,
    userEmail: req.session.userEmail,
    items,
    shippingAddress,
    paymentMethod: paymentMethod || 'card',
    subtotal: parseFloat(subtotal.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    status: 'confirmed',
    orderNumber: 'ORD-' + Date.now(),
    createdAt: new Date()
  };

  // Update stock
  items.forEach(item => {
    db.products.update({ _id: item.productId }, { $inc: { stock: -item.quantity } });
  });

  db.orders.insert(order, (err, saved) => {
    if (err) return res.status(500).json({ error: 'Order failed' });
    res.json({ success: true, order: saved });
  });
});

// Get user orders
router.get('/my', requireAuth, (req, res) => {
  db.orders.find({ userId: req.session.userId }).sort({ createdAt: -1 }).exec((err, orders) => {
    res.json(orders);
  });
});

// Get single order
router.get('/:id', requireAuth, (req, res) => {
  db.orders.findOne({ _id: req.params.id, userId: req.session.userId }, (err, order) => {
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });
});

module.exports = router;
