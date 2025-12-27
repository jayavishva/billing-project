// Global state
let cart = [];
let menu = [];

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadMenu();
  loadCart();
  setupEventListeners();
});

// Load menu from localStorage
function loadMenu() {
  menu = getMenu();
  renderMenu();
}

// Render menu items
function renderMenu() {
  const menuGrid = document.getElementById("menuGrid");
  menuGrid.innerHTML = "";

  if (menu.length === 0) {
    menuGrid.innerHTML =
      "<p>No menu items available. Please add items from admin panel.</p>";
    return;
  }

  menu.forEach((item) => {
    const menuItem = document.createElement("div");
    menuItem.className = "menu-item";
    menuItem.innerHTML = `
            <img src="${item.image}" alt="${
      item.name
    }" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22150%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2214%22 dy=%2210.5%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3E${
      item.name
    }%3C/text%3E%3C/svg%3E'">
            <h3>${item.name}</h3>
            <div class="price">${formatCurrency(item.price)}</div>
        `;
    menuItem.addEventListener("click", () => addToCart(item));
    menuGrid.appendChild(menuItem);
  });
}

// Add item to cart
function addToCart(item) {
  const existingItem = cart.find((cartItem) => cartItem.id === item.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
    });
  }

  saveCart();
  renderCart();
  updateCartSummary();
}

// Remove item from cart
function removeFromCart(itemId) {
  cart = cart.filter((item) => item.id !== itemId);
  saveCart();
  renderCart();
  updateCartSummary();
}

// Update item quantity in cart
function updateQuantity(itemId, change) {
  const item = cart.find((cartItem) => cartItem.id === itemId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    saveCart();
    renderCart();
    updateCartSummary();
  }
}

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem("restaurantCart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
  renderCart();
  updateCartSummary();
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem("restaurantCart", JSON.stringify(cart));
}

// Render cart items
function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const cartSummary = document.getElementById("cartSummary");

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    cartSummary.style.display = "none";
    return;
  }

  cartSummary.style.display = "block";
  cartItems.innerHTML = "";

  cart.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${formatCurrency(
                  item.price
                )} each</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateQuantity(${
                  item.id
                }, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${
                  item.id
                }, 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart(${
                  item.id
                })">Remove</button>
            </div>
        `;
    cartItems.appendChild(cartItem);
  });
}

// Update cart summary (totals)
function updateCartSummary() {
  if (cart.length === 0) {
    return;
  }

  if (typeof QRCode === "undefined") {
    alert("QR Code library is missing! Please include qrcode.js in your HTML.");
    return;
  }

  const bill = calculateBill(cart);
  document.getElementById("total").textContent = formatCurrency(bill.total);
}

// Clear cart
function clearCart() {
  if (cart.length === 0) {
    return;
  }

  if (confirm("Are you sure you want to clear the cart?")) {
    cart = [];
    saveCart();
    renderCart();
    updateCartSummary();
  }
}

// Generate QR Code and show payment modal
function showPaymentModal() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const bill = calculateBill(cart);
  const transactionId = "TXN" + Date.now();
  const billData = {
    transactionId: transactionId,
    date: formatDate(new Date()),
    items: cart.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    })),
    total: bill.total,
  };

  // Save sale
  saveSale(billData);

  // Generate QR code data
  const qrData = generateQRCodeData(billData);

  // Clear existing QR code
  const qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = "";

  // Generate QR code
  new QRCode(qrContainer, {
    text: qrData,
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });

  // Display bill details
  const billDetails = document.getElementById("billDetails");
  billDetails.innerHTML = `
        <h3>Bill Details</h3>
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
        <p><strong>Date:</strong> ${formatDateTime(new Date())}</p>
        <p><strong>Items:</strong></p>
        <ul style="margin-left: 20px; margin-top: 10px;">
            ${billData.items
              .map(
                (item) =>
                  `<li>${item.name} x ${item.quantity} = ${formatCurrency(
                    item.subtotal
                  )}</li>`
              )
              .join("")}
        </ul>
        <p style="font-size: 1.2em; font-weight: bold; color: #667eea; margin-top: 10px;">
            <strong>Total:</strong> ${formatCurrency(bill.total)}
        </p>
    `;

  // Show modal
  const modal = document.getElementById("qrModal");
  modal.style.display = "block";
}

// Print bill
function printBill() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const bill = calculateBill(cart);
  const transactionId = "TXN" + Date.now();
  const billData = {
    transactionId: transactionId,
    date: formatDate(new Date()),
    items: cart.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    })),
    total: bill.total,
  };

  // Save sale
  saveSale(billData);

  // Populate print bill section
  document.getElementById("printDate").textContent = `Date: ${formatDateTime(
    new Date()
  )}`;
  document.getElementById(
    "printTransactionId"
  ).textContent = `Transaction ID: ${transactionId}`;

  const printItems = document.getElementById("printItems");
  printItems.innerHTML = billData.items
    .map(
      (item) => `
        <div class="bill-item">
            <span>${item.name} x ${item.quantity}</span>
            <span>${formatCurrency(item.subtotal)}</span>
        </div>
    `
    )
    .join("");

  const printSummary = document.getElementById("printSummary");
  printSummary.innerHTML = `
        <div class="bill-summary-row" style="font-size: 1.3em; font-weight: bold;">
            <span>Total:</span>
            <span>${formatCurrency(bill.total)}</span>
        </div>
    `;

  // Print
  window.print();

  // Clear cart after printing
  cart = [];
  saveCart();
  renderCart();
  updateCartSummary();
}

// Setup event listeners
function setupEventListeners() {
  // Pay Now button
  document
    .getElementById("payNowBtn")
    .addEventListener("click", showPaymentModal);

  // Print Bill button
  document.getElementById("printBillBtn").addEventListener("click", printBill);

  // Clear Cart button
  document.getElementById("clearCartBtn").addEventListener("click", clearCart);

  // Modal close buttons
  const modal = document.getElementById("qrModal");
  const closeBtn = document.querySelector(".close");
  const closeModalBtn = document.getElementById("closeModalBtn");

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

// Make functions available globally for onclick handlers
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
document.getElementById("printBillBtn").addEventListener("click", printBill);

// Clear Cart button
document.getElementById("clearCartBtn").addEventListener("click", clearCart);

// Modal close buttons
const modal = document.getElementById("qrModal");
const closeBtn = document.querySelector(".close");
const closeModalBtn = document.getElementById("closeModalBtn");

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Make functions available globally for onclick handlers
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
