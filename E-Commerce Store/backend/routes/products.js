const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { category, search, sort, minPrice, maxPrice } = req.query;
  let query = {};

  if (category && category !== 'All') query.category = category;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  db.products.find(query, (err, products) => {
    if (err) return res.status(500).json({ error: 'DB error' });

    let filtered = products;
    if (search) {
      const s = search.toLowerCase();
      filtered = products.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s)
      );
    }

    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (sort === 'popular') filtered.sort((a, b) => b.reviews - a.reviews);

    res.json(filtered);
  });
});

router.get('/:id', (req, res) => {
  db.products.findOne({ _id: req.params.id }, (err, product) => {
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  });
});

router.get('/meta/categories', (req, res) => {
  db.products.find({}, { category: 1 }, (err, products) => {
    const cats = ['All', ...new Set(products.map(p => p.category))];
    res.json(cats);
  });
});

module.exports = router;
