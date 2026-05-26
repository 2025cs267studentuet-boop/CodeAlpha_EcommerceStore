# ShopWave — E-Commerce Store
### CodeAlpha Full Stack Internship — Task 1

A complete full-stack e-commerce application with a polished dark-themed UI, product listings, shopping cart, user authentication, and order processing.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js + Express.js |
| Database | NeDB (embedded, no setup required) |
| Auth | bcryptjs + express-session |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+ installed

### Installation & Run

```bash
# 1. Navigate to backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Start the server
node server.js
```

The app will be live at: **http://localhost:5000**

---

## ✨ Features

### 🛍 Shopping
- **Product Listings** — 12 seeded products across 4 categories
- **Product Details Page** — Full details, quantity selector, add to cart
- **Search** — Live search from the navbar
- **Category Filtering** — Electronics, Fashion, Sports, Home
- **Price Filtering** — Min/max price range
- **Sorting** — By price, rating, popularity

### 🛒 Cart
- Add/remove items, adjust quantities
- Persistent cart (localStorage)
- Automatic shipping & tax calculation
- Free shipping on orders over $100

### 👤 Authentication
- User registration & login
- Session-based auth (7-day sessions)
- Password hashing with bcryptjs

### 📦 Orders
- Full checkout flow with shipping address form
- Payment method selection (Card, COD, EasyPaisa)
- Order confirmation with order number
- Order history page

---

## 📁 Project Structure

```
ecommerce/
├── backend/
│   ├── routes/
│   │   ├── auth.js        # Register, Login, Logout
│   │   ├── products.js    # Product CRUD & Filtering
│   │   └── orders.js      # Order Placement & History
│   ├── data/              # Auto-created NeDB database files
│   ├── db.js              # Database setup & seeding
│   ├── server.js          # Express app entry point
│   └── package.json
└── frontend/
    └── public/
        ├── index.html     # Single Page Application shell
        ├── css/
        │   └── style.css  # Complete dark-theme stylesheet
        └── js/
            └── app.js     # Full frontend logic
```

---

## 🔑 Demo Account

The database seeds an admin account on first run:
- **Email:** admin@shop.com
- **Password:** admin123

Or create your own account via the Sign Up button.

---

## 📡 API Endpoints

```
POST   /api/auth/register      Register new user
POST   /api/auth/login         Login
POST   /api/auth/logout        Logout
GET    /api/auth/me            Get current user

GET    /api/products           List products (supports ?category, ?search, ?sort, ?minPrice, ?maxPrice)
GET    /api/products/:id       Get single product
GET    /api/products/meta/categories  Get all categories

POST   /api/orders             Place order (auth required)
GET    /api/orders/my          Get user orders (auth required)
GET    /api/orders/:id         Get single order (auth required)
```

---

## 🎨 UI Highlights

- Dark luxury aesthetic with gold accents
- Fraunces serif headings + DM Sans body
- Animated floating hero section
- Slide-in cart drawer
- Toast notifications
- Fully responsive layout

---

*Built for CodeAlpha Full Stack Development Internship*
