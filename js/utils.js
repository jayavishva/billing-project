// LocalStorage Keys
const STORAGE_KEYS = {
  MENU: "restaurantMenu",
  SALES: "restaurantSales",
};

// Default Menu Items
const DEFAULT_MENU = [
  {
    id: 1,
    name: "Idly",
    price: 30,
    image:
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
  },
  {
    id: 2,
    name: "Puri",
    price: 40,
    image:
      "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
  },
  {
    id: 3,
    name: "Vada",
    price: 25,
    image:
      "https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
  },
  {
    id: 4,
    name: "Coffee",
    price: 20,
    image:
      "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
  },
  {
    id: 5,
    name: "Pazhampori",
    price: 35,
    image:
      "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
  },
];

// Menu Management Functions
function getMenu() {
  const menu = localStorage.getItem(STORAGE_KEYS.MENU);
  if (menu) {
    return JSON.parse(menu);
  }
  // Initialize with default menu if empty
  saveMenu(DEFAULT_MENU);
  return DEFAULT_MENU;
}

function saveMenu(menu) {
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
}

function addMenuItem(item) {
  const menu = getMenu();
  const newId = menu.length > 0 ? Math.max(...menu.map((m) => m.id)) + 1 : 1;
  const newItem = {
    id: newId,
    ...item,
  };
  menu.push(newItem);
  saveMenu(menu);
  return newItem;
}

function updateMenuItem(id, updatedItem) {
  const menu = getMenu();
  const index = menu.findIndex((item) => item.id === id);
  if (index !== -1) {
    menu[index] = { ...menu[index], ...updatedItem, id: id };
    saveMenu(menu);
    return menu[index];
  }
  return null;
}

function deleteMenuItem(id) {
  const menu = getMenu();
  const filteredMenu = menu.filter((item) => item.id !== id);
  saveMenu(filteredMenu);
  return filteredMenu;
}

function getMenuItemById(id) {
  const menu = getMenu();
  return menu.find((item) => item.id === id);
}

// Sales Management Functions
function getSales() {
  const sales = localStorage.getItem(STORAGE_KEYS.SALES);
  return sales ? JSON.parse(sales) : [];
}

function saveSale(sale) {
  const sales = getSales();
  const newSale = {
    id: Date.now().toString(),
    date: formatDate(new Date()),
    timestamp: Date.now(),
    ...sale,
  };
  sales.push(newSale);
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  return newSale;
}

function getSalesByMonth(month, year) {
  const sales = getSales();
  if (month === "all") {
    return sales;
  }
  return sales.filter((sale) => {
    const saleDate = new Date(sale.timestamp);
    return saleDate.getMonth() === month && saleDate.getFullYear() === year;
  });
}

function getMonthlySalesSummary() {
  const sales = getSales();
  const monthlyData = {};

  sales.forEach((sale) => {
    const date = new Date(sale.timestamp);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        total: 0,
        count: 0,
      };
    }

    monthlyData[monthKey].total += sale.total;
    monthlyData[monthKey].count += 1;
  });

  return Object.values(monthlyData).sort((a, b) =>
    b.month.localeCompare(a.month)
  );
}

// Date Formatting Functions
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTime(date) {
  const d = new Date(date);
  const dateStr = formatDate(d);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${dateStr} ${hours}:${minutes}`;
}

function getMonthName(monthIndex) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthIndex];
}

// Image Handling Functions
function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// QR Code Generation Helper
function generateQRCodeData(billData) {
  // Generate UPI payment link
  // TODO: Replace 'restaurant@upi' with your actual merchant UPI ID
  const upiID = "jayavishva3@oksbi";
  return `upi://pay?pa=${upiID}&pn=Restaurant&am=${billData.total}&tn=Bill-${billData.transactionId}&cu=INR`;
}

// Calculate Bill Totals
function calculateBill(cartItems) {
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return {
    total: parseFloat(total.toFixed(2)),
  };
}

// Format Currency
function formatCurrency(amount) {
  return `₹${amount.toFixed(2)}`;
}
