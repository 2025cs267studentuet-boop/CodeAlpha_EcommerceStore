const API = '/api';
let cart = JSON.parse(localStorage.getItem('swCart') || '[]');
let currentUser = null;
let currentProducts = [];
let activeCategory = 'All';
let detailQty = 1;

document.addEventListener('DOMContentLoaded', async () => {
  renderCart();
  await checkAuth();
  loadFeatured();
  loadCategories();
  loadProducts();
});

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const map = { home: 'homePage', products: 'productsPage', orders: 'ordersPage', checkout: 'checkoutPage' };
  const id = typeof page === 'string' ? map[page] : page;
  if (id) document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page === 'orders') loadOrders();
}

function scrollToFeatured() {
  document.getElementById('featuredSection').scrollIntoView({ behavior: 'smooth' });
}

async function checkAuth() {
  try {
    const res = await fetch(`${API}/auth/me`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    }
  } catch (e) {}
}

function setUser(user) {
  currentUser = user;
  document.getElementById('authArea').classList.add('hidden');
  document.getElementById('userArea').classList.remove('hidden');
  document.getElementById('userName').textContent = `Hi, ${user.name.split(' ')[0]}`;
}

function clearUser() {
  currentUser = null;
  document.getElementById('authArea').classList.remove('hidden');
  document.getElementById('userArea').classList.add('hidden');
}

function showAuthModal(tab = 'login') {
  document.getElementById('authOverlay').classList.remove('hidden');
  document.getElementById('authModal').classList.remove('hidden');
  switchAuthTab(tab);
}

function closeAuthModal() {
  document.getElementById('authOverlay').classList.add('hidden');
  document.getElementById('authModal').classList.add('hidden');
}

function switchAuthTab(tab) {
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
  document.getElementById('loginError').textContent = '';
  document.getElementById('registerError').textContent = '';
}

async function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  document.getElementById('loginError').textContent = '';

  if (!email || !password) {
    document.getElementById('loginError').textContent = 'Please fill all fields.';
    return;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) { document.getElementById('loginError').textContent = data.error; return; }
    setUser(data.user);
    closeAuthModal();
    showToast('Welcome back, ' + data.user.name.split(' ')[0] + '!', 'success');
  } catch (e) {
    document.getElementById('loginError').textContent = 'Connection error.';
  }
}

async function register() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  document.getElementById('registerError').textContent = '';

  if (!name || !email || !password) {
    document.getElementById('registerError').textContent = 'Please fill all fields.';
    return;
  }

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) { document.getElementById('registerError').textContent = data.error; return; }
    setUser(data.user);
    closeAuthModal();
    showToast('Account created! Welcome, ' + data.user.name.split(' ')[0] + '!', 'success');
  } catch (e) {
    document.getElementById('registerError').textContent = 'Connection error.';
  }
}

async function logout() {
  await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
  clearUser();
  showToast('Logged out successfully.', 'info');
}

async function loadFeatured() {
  try {
    const res = await fetch(`${API}/products`);
    const products = await res.json();
    const featured = products.slice(0, 8);
    renderProductGrid('featuredGrid', featured, true);
  } catch (e) {
    document.getElementById('featuredGrid').innerHTML = '<p style="color:var(--text3);padding:20px">Could not load products.</p>';
  }
}

async function loadCategories() {
  try {
    const res = await fetch(`${API}/products/meta/categories`);
    const cats = await res.json();
    const cont = document.getElementById('categoryFilters');
    cont.innerHTML = '';
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-chip' + (cat === 'All' ? ' active' : '');
      btn.textContent = cat;
      btn.onclick = () => setCategoryFilter(cat, btn);
      cont.appendChild(btn);
    });
  } catch (e) {}
}

async function loadProducts(params = {}) {
  const qp = new URLSearchParams();
  if (activeCategory && activeCategory !== 'All') qp.set('category', activeCategory);
  if (params.search) qp.set('search', params.search);
  if (params.sort) qp.set('sort', params.sort);
  if (params.minPrice) qp.set('minPrice', params.minPrice);
  if (params.maxPrice) qp.set('maxPrice', params.maxPrice);

  try {
    const res = await fetch(`${API}/products?${qp.toString()}`);
    const products = await res.json();
    currentProducts = products;
    renderProductGrid('productsGrid', products);
    document.getElementById('productCount').textContent = `(${products.length} items)`;
    const catName = activeCategory === 'All' ? 'All Products' : activeCategory;
    document.getElementById('productsHeading').textContent = catName;
  } catch (e) {}
}

function renderProductGrid(containerId, products, showButton = false) {
  const cont = document.getElementById(containerId);
  if (!products.length) {
    cont.innerHTML = '<p style="color:var(--text3);padding:20px;grid-column:1/-1">No products found.</p>';
    return;
  }
  cont.innerHTML = products.map(p => productCardHTML(p)).join('');
}

function productCardHTML(p) {
  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : null;
  const badgeClass = p.badge ? (p.badge === 'Sale' ? 'sale' : p.badge === 'New' ? 'new' : '') : '';
  const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
  return `
    <div class="product-card" onclick="showDetail('${p._id}')">
      ${p.badge ? `<div class="product-badge ${badgeClass}">${p.badge}${discount ? ' -' + discount + '%' : ''}</div>` : ''}
      <img class="product-img" src="${p.image}" alt="${p.name}" loading="lazy"/>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating">
          <span class="stars">${stars}</span>
          <span class="rating-num">${p.rating} (${p.reviews.toLocaleString()})</span>
        </div>
        <div class="product-price">
          <span class="price-current">$${p.price.toFixed(2)}</span>
          ${p.originalPrice ? `<span class="price-original">$${p.originalPrice.toFixed(2)}</span>` : ''}
        </div>
        <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart('${p._id}', '${escHtml(p.name)}', ${p.price}, '${p.image}', ${p.stock})">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

function escHtml(str) { return str.replace(/'/g, "\\'"); }

async function showDetail(id) {
  showPage('detailPage');
  document.getElementById('detailContainer').innerHTML = '<div class="loading-spinner">Loading…</div>';
  detailQty = 1;

  try {
    const res = await fetch(`${API}/products/${id}`);
    const p = await res.json();
    const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
    const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : null;

    document.getElementById('detailContainer').innerHTML = `
      <button class="detail-back" onclick="history.back()">← Back</button>
      <div class="detail-layout">
        <div class="detail-img-wrap">
          <img src="${p.image}" alt="${p.name}"/>
        </div>
        <div class="detail-info">
          <div class="detail-category">${p.category}</div>
          <h1 class="detail-name">${p.name}</h1>
          <div class="detail-rating">
            <span class="stars">${stars}</span>
            <span>${p.rating} / 5 · ${p.reviews.toLocaleString()} reviews</span>
          </div>
          <div class="detail-price">
            <span class="price-current">$${p.price.toFixed(2)}</span>
            ${p.originalPrice ? `<span class="price-original">$${p.originalPrice.toFixed(2)}</span>` : ''}
            ${discount ? `<span style="color:var(--accent2);font-size:0.85rem;font-weight:700">-${discount}%</span>` : ''}
          </div>
          <p class="detail-desc">${p.description}</p>
          <div class="detail-stock">
            ${p.stock > 0 ? `<span class="in-stock">✓ In Stock</span> — ${p.stock} available` : '<span class="out-stock">✗ Out of Stock</span>'}
          </div>
          ${p.stock > 0 ? `
          <div class="qty-wrap">
            <span class="qty-label">Quantity:</span>
            <div class="qty-controls">
              <button class="qty-btn" onclick="changeDetailQty(-1)">−</button>
              <div class="qty-num" id="detailQtyNum">1</div>
              <button class="qty-btn" onclick="changeDetailQty(1, ${p.stock})">+</button>
            </div>
          </div>
          <button class="btn-detail-cart" onclick="addToCart('${p._id}', '${escHtml(p.name)}', ${p.price}, '${p.image}', ${p.stock}, true)">
            🛒 Add to Cart
          </button>
          ` : ''}
        </div>
      </div>
    `;
  } catch (e) {
    document.getElementById('detailContainer').innerHTML = '<p style="color:var(--text3);padding:40px">Product not found.</p>';
  }
}

function changeDetailQty(delta, max = 99) {
  detailQty = Math.max(1, Math.min(max, detailQty + delta));
  const el = document.getElementById('detailQtyNum');
  if (el) el.textContent = detailQty;
}

// ====== FILTERS ======
function setCategoryFilter(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  loadProducts({ sort: document.getElementById('sortSelect')?.value });
  showPage('products');
}

function filterByCategory(cat) {
  activeCategory = cat;
  showPage('products');
  // update chip
  document.querySelectorAll('.filter-chip').forEach(c => {
    c.classList.toggle('active', c.textContent === cat);
  });
  loadProducts();
}

function applyPriceFilter() {
  const min = document.getElementById('minPrice').value;
  const max = document.getElementById('maxPrice').value;
  loadProducts({ minPrice: min || undefined, maxPrice: max || undefined, sort: document.getElementById('sortSelect').value });
}

function applySortFilter() {
  const sort = document.getElementById('sortSelect').value;
  const min = document.getElementById('minPrice').value;
  const max = document.getElementById('maxPrice').value;
  loadProducts({ sort, minPrice: min || undefined, maxPrice: max || undefined });
}

function resetFilters() {
  activeCategory = 'All';
  document.getElementById('minPrice').value = '';
  document.getElementById('maxPrice').value = '';
  document.getElementById('sortSelect').value = '';
  document.querySelectorAll('.filter-chip').forEach(c => {
    c.classList.toggle('active', c.textContent === 'All');
  });
  loadProducts();
}

function handleNavSearch(val) {
  if (val.length >= 2) {
    showPage('products');
    loadProducts({ search: val });
  } else if (val.length === 0) {
    loadProducts();
  }
}

// ====== CART ======
function saveCart() { localStorage.setItem('swCart', JSON.stringify(cart)); }

function addToCart(productId, name, price, image, stock, fromDetail = false) {
  const qty = fromDetail ? detailQty : 1;
  const existing = cart.find(i => i.productId === productId);
  if (existing) {
    if (existing.quantity + qty > stock) { showToast('Not enough stock', 'error'); return; }
    existing.quantity += qty;
  } else {
    cart.push({ productId, name, price, image, quantity: qty });
  }
  saveCart();
  renderCart();
  showToast(`Added "${name.substring(0, 30)}…" to cart`, 'success');
  if (fromDetail) toggleCart();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.productId !== productId);
  saveCart();
  renderCart();
}

function changeQty(productId, delta) {
  const item = cart.find(i => i.productId === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) { removeFromCart(productId); return; }
  saveCart();
  renderCart();
}

function renderCart() {
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  document.getElementById('cartCount').textContent = count;

  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');

  if (!cart.length) {
    container.innerHTML = '<p class="empty-cart">Your cart is empty 🛍️</p>';
    footer.innerHTML = '';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}"/>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        <div class="cart-item-controls">
          <button class="ci-btn" onclick="changeQty('${item.productId}', -1)">−</button>
          <span class="ci-qty">${item.quantity}</span>
          <button class="ci-btn" onclick="changeQty('${item.productId}', 1)">+</button>
          <button class="ci-remove" onclick="removeFromCart('${item.productId}')">✕ Remove</button>
        </div>
      </div>
    </div>
  `).join('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  footer.innerHTML = `
    <div class="cart-total-line"><span>Subtotal</span><span class="amount">$${subtotal.toFixed(2)}</span></div>
    <div class="cart-total-line"><span>Shipping</span><span class="amount">${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span></div>
    <div class="cart-total-line"><span>Tax (8%)</span><span class="amount">$${tax.toFixed(2)}</span></div>
    <div class="cart-total-line grand"><span>Total</span><span class="amount">$${total.toFixed(2)}</span></div>
    <button class="btn-primary full" onclick="goToCheckout()" style="margin-bottom:10px">Proceed to Checkout</button>
    <button class="btn-ghost" onclick="toggleCart()" style="width:100%;text-align:center">Continue Shopping</button>
  `;
}

function toggleCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  const isOpen = drawer.classList.contains('open');
  drawer.classList.toggle('open', !isOpen);
  overlay.classList.toggle('open', !isOpen);
}

function goToCheckout() {
  if (!currentUser) {
    toggleCart();
    showAuthModal('login');
    showToast('Please log in to checkout', 'info');
    return;
  }
  if (!cart.length) { showToast('Cart is empty', 'error'); return; }
  toggleCart();
  buildCheckoutSummary();
  showPage('checkout');
}

function buildCheckoutSummary() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  document.getElementById('checkoutItems').innerHTML = cart.map(i => `
    <div class="checkout-item-row">
      <span>${i.name.substring(0, 32)}… ×${i.quantity}</span>
      <span>$${(i.price * i.quantity).toFixed(2)}</span>
    </div>
  `).join('');

  document.getElementById('summaryTotals').innerHTML = `
    <div class="total-row"><span>Subtotal</span><span class="amount">$${subtotal.toFixed(2)}</span></div>
    <div class="total-row"><span>Shipping</span><span class="amount">${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span></div>
    <div class="total-row"><span>Tax (8%)</span><span class="amount">$${tax.toFixed(2)}</span></div>
    <div class="total-row grand"><span>Total</span><span class="amount">$${total.toFixed(2)}</span></div>
  `;
}

// ====== ORDERS ======
async function placeOrder() {
  const name = document.getElementById('shpName').value.trim();
  const address = document.getElementById('shpAddress').value.trim();
  const city = document.getElementById('shpCity').value.trim();
  const country = document.getElementById('shpCountry').value.trim();

  if (!name || !address || !city) {
    showToast('Please fill in all required shipping fields', 'error');
    return;
  }

  const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || 'card';

  const shippingAddress = {
    name,
    phone: document.getElementById('shpPhone').value,
    address,
    city,
    state: document.getElementById('shpState').value,
    zip: document.getElementById('shpZip').value,
    country
  };

  const items = cart.map(i => ({
    productId: i.productId,
    name: i.name,
    price: i.price,
    quantity: i.quantity,
    image: i.image
  }));

  try {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ items, shippingAddress, paymentMethod: payMethod })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'Order failed', 'error'); return; }

    // Clear cart
    cart = [];
    saveCart();
    renderCart();

    // Show success
    document.getElementById('successMsg').textContent =
      `Order ${data.order.orderNumber} confirmed! Total: $${data.order.total.toFixed(2)}. We'll ship to ${shippingAddress.city}.`;
    document.getElementById('successOverlay').classList.remove('hidden');
    document.getElementById('successModal').classList.remove('hidden');
  } catch (e) {
    showToast('Connection error. Please try again.', 'error');
  }
}

function closeSuccessModal() {
  document.getElementById('successOverlay').classList.add('hidden');
  document.getElementById('successModal').classList.add('hidden');
  showPage('home');
  loadFeatured();
}

async function loadOrders() {
  if (!currentUser) {
    document.getElementById('ordersList').innerHTML = `
      <div class="no-orders">
        <p>Please log in to view your orders.</p>
        <button class="btn-primary" onclick="showAuthModal('login')">Log In</button>
      </div>`;
    return;
  }

  try {
    const res = await fetch(`${API}/orders/my`, { credentials: 'include' });
    const orders = await res.json();

    if (!orders.length) {
      document.getElementById('ordersList').innerHTML = `
        <div class="no-orders">
          <p>You haven't placed any orders yet.</p>
          <button class="btn-primary" onclick="showPage('products')">Start Shopping</button>
        </div>`;
      return;
    }

    document.getElementById('ordersList').innerHTML = orders.map(o => `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <div class="order-number">${o.orderNumber}</div>
            <div class="order-date">${new Date(o.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</div>
          </div>
          <div class="order-status">✓ ${o.status}</div>
        </div>
        <div class="order-items-list">
          ${o.items.map(i => `
            <div class="order-item-row">
              <span>${i.name} × ${i.quantity}</span>
              <span>$${(i.price * i.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <div class="order-card-footer">
          <div class="order-addr">📍 ${o.shippingAddress.address}, ${o.shippingAddress.city}</div>
          <div class="order-total">Total: $${o.total.toFixed(2)}</div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    document.getElementById('ordersList').innerHTML = '<p style="color:var(--text3);padding:20px">Could not load orders.</p>';
  }
}

// ====== TOAST ======
let toastTimer;
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// Close modals on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeAuthModal();
    if (document.getElementById('cartDrawer').classList.contains('open')) toggleCart();
  }
});
