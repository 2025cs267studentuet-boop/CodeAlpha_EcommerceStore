const Datastore = require('nedb');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'data');
require('fs').mkdirSync(dbPath, { recursive: true });

const db = {
  users: new Datastore({ filename: path.join(dbPath, 'users.db'), autoload: true }),
  products: new Datastore({ filename: path.join(dbPath, 'products.db'), autoload: true }),
  orders: new Datastore({ filename: path.join(dbPath, 'orders.db'), autoload: true }),
};

// Create indexes
db.users.ensureIndex({ fieldName: 'email', unique: true });

// Seed products if empty
db.products.count({}, (err, count) => {
  if (count === 0) {
    const products = [
      {
        name: 'Wireless Noise-Cancelling Headphones',
        price: 299.99,
        originalPrice: 399.99,
        category: 'Electronics',
        description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and studio-quality sound. Perfect for music lovers and remote workers.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
        stock: 50,
        rating: 4.8,
        reviews: 1240,
        badge: 'Best Seller'
      },
      {
        name: 'Mechanical Gaming Keyboard',
        price: 149.99,
        originalPrice: 189.99,
        category: 'Electronics',
        description: 'RGB mechanical gaming keyboard with Cherry MX switches, dedicated media controls, and per-key lighting customization.',
        image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80',
        stock: 35,
        rating: 4.6,
        reviews: 856,
        badge: 'Sale'
      },
      {
        name: 'Minimalist Leather Watch',
        price: 199.99,
        originalPrice: null,
        category: 'Fashion',
        description: 'Elegant minimalist timepiece with genuine leather strap, sapphire crystal glass, and Swiss movement. Water resistant to 50m.',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
        stock: 20,
        rating: 4.9,
        reviews: 432,
        badge: 'New'
      },
      {
        name: 'Ultra-Wide Monitor 34"',
        price: 649.99,
        originalPrice: 799.99,
        category: 'Electronics',
        description: '34-inch ultrawide curved monitor with 3440x1440 resolution, 144Hz refresh rate, HDR support, and USB-C connectivity.',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80',
        stock: 15,
        rating: 4.7,
        reviews: 678,
        badge: 'Sale'
      },
      {
        name: 'Running Shoes Pro',
        price: 129.99,
        originalPrice: 159.99,
        category: 'Sports',
        description: 'High-performance running shoes with responsive foam midsole, breathable mesh upper, and advanced grip outsole for all terrains.',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
        stock: 80,
        rating: 4.5,
        reviews: 2341,
        badge: 'Popular'
      },
      {
        name: 'Portable Bluetooth Speaker',
        price: 89.99,
        originalPrice: 119.99,
        category: 'Electronics',
        description: '360° surround sound speaker with 24-hour battery, waterproof IPX7 rating, and built-in microphone for hands-free calls.',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80',
        stock: 60,
        rating: 4.4,
        reviews: 1892,
        badge: null
      },
      {
        name: 'Smart Fitness Tracker',
        price: 79.99,
        originalPrice: null,
        category: 'Sports',
        description: 'Advanced fitness tracker with heart rate monitoring, sleep tracking, GPS, and 7-day battery. Compatible with iOS and Android.',
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&q=80',
        stock: 100,
        rating: 4.3,
        reviews: 3210,
        badge: 'New'
      },
      {
        name: 'Premium Backpack 30L',
        price: 109.99,
        originalPrice: 139.99,
        category: 'Fashion',
        description: 'Durable travel backpack with laptop compartment (fits up to 17"), anti-theft pocket, USB charging port, and water-resistant fabric.',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
        stock: 45,
        rating: 4.6,
        reviews: 987,
        badge: null
      },
      {
        name: 'Coffee Maker Pro',
        price: 159.99,
        originalPrice: 199.99,
        category: 'Home',
        description: 'Programmable drip coffee maker with built-in grinder, thermal carafe, adjustable brew strength, and 12-cup capacity.',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80',
        stock: 30,
        rating: 4.7,
        reviews: 654,
        badge: 'Sale'
      },
      {
        name: 'Yoga Mat Premium',
        price: 59.99,
        originalPrice: null,
        category: 'Sports',
        description: 'Non-slip premium yoga mat with alignment lines, extra thick 6mm cushioning, and eco-friendly natural rubber material.',
        image: 'https://images.unsplash.com/photo-1601925228073-b4e2c5d99a9f?w=500&q=80',
        stock: 120,
        rating: 4.5,
        reviews: 1567,
        badge: null
      },
      {
        name: 'Desk Lamp with Wireless Charging',
        price: 69.99,
        originalPrice: 89.99,
        category: 'Home',
        description: 'LED desk lamp with 5 color modes, 10 brightness levels, built-in wireless charging pad, and USB-A port.',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80',
        stock: 55,
        rating: 4.4,
        reviews: 789,
        badge: null
      },
      {
        name: 'Sunglasses Polarized',
        price: 149.99,
        originalPrice: null,
        category: 'Fashion',
        description: 'Premium polarized sunglasses with UV400 protection, lightweight titanium frame, and anti-reflective coating.',
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80',
        stock: 40,
        rating: 4.8,
        reviews: 423,
        badge: 'New'
      }
    ];
    db.products.insert(products, (err) => {
      if (!err) console.log('✅ Products seeded');
    });
  }
});

// Seed admin user
db.users.count({}, (err, count) => {
  if (count === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.users.insert({
      name: 'Admin User',
      email: 'admin@shop.com',
      password: hash,
      role: 'admin',
      createdAt: new Date()
    });
  }
});

module.exports = db;
