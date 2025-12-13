// Global state
let menu = [];
let editingItemId = null;
let months = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
    renderMenuItems();
    loadSales();
    setupEventListeners();
    populateMonthSelect();
});

// Load menu from localStorage
function loadMenu() {
    menu = getMenu();
}

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById('menuForm');
    const cancelBtn = document.getElementById('cancelBtn');
    
    form.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', cancelEdit);
    
    // Month select change
    document.getElementById('monthSelect').addEventListener('change', handleMonthChange);
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const itemId = document.getElementById('itemId').value;
    const name = document.getElementById('itemName').value.trim();
    const price = parseFloat(document.getElementById('itemPrice').value);
    const imageFile = document.getElementById('itemImage').files[0];
    const imagePath = document.getElementById('itemImagePath').value.trim();
    
    if (!name || !price || price <= 0) {
        alert('Please fill in all required fields with valid values.');
        return;
    }
    
    let image = imagePath;
    
    // If image file is uploaded, convert to base64
    if (imageFile) {
        try {
            image = await convertImageToBase64(imageFile);
        } catch (error) {
            alert('Error processing image. Please try again.');
            return;
        }
    }
    
    // If no image provided, use placeholder
    if (!image) {
        image = `images/${name.toLowerCase().replace(/\s+/g, '')}.jpg`;
    }
    
    const itemData = {
        name: name,
        price: price,
        image: image
    };
    
    if (editingItemId) {
        // Update existing item
        updateMenuItem(editingItemId, itemData);
        alert('Item updated successfully!');
    } else {
        // Add new item
        addMenuItem(itemData);
        alert('Item added successfully!');
    }
    
    // Reset form
    resetForm();
    loadMenu();
    renderMenuItems();
}

// Cancel edit mode
function cancelEdit() {
    editingItemId = null;
    resetForm();
}

// Reset form
function resetForm() {
    document.getElementById('menuForm').reset();
    document.getElementById('itemId').value = '';
    document.getElementById('formTitle').textContent = 'Add New Item';
    document.getElementById('submitBtn').textContent = 'Add Item';
    document.getElementById('cancelBtn').style.display = 'none';
    editingItemId = null;
}

// Edit menu item
function editItem(id) {
    const item = getMenuItemById(id);
    if (!item) {
        alert('Item not found!');
        return;
    }
    
    editingItemId = id;
    document.getElementById('itemId').value = id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemImagePath').value = item.image.startsWith('data:') ? '' : item.image;
    document.getElementById('formTitle').textContent = 'Edit Item';
    document.getElementById('submitBtn').textContent = 'Update Item';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    
    // Scroll to form
    document.querySelector('.menu-form').scrollIntoView({ behavior: 'smooth' });
}

// Delete menu item
function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    deleteMenuItem(id);
    loadMenu();
    renderMenuItems();
    alert('Item deleted successfully!');
}

// Render menu items in admin panel
function renderMenuItems() {
    const itemsGrid = document.getElementById('itemsGrid');
    itemsGrid.innerHTML = '';
    
    if (menu.length === 0) {
        itemsGrid.innerHTML = '<p>No menu items. Add your first item using the form above.</p>';
        return;
    }
    
    menu.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22150%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2214%22 dy=%2210.5%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3E${item.name}%3C/text%3E%3C/svg%3E'">
            <h4>${item.name}</h4>
            <div class="price">${formatCurrency(item.price)}</div>
            <div class="item-card-actions">
                <button class="btn-edit" onclick="editItem(${item.id})">Edit</button>
                <button class="btn-delete" onclick="deleteItem(${item.id})">Delete</button>
            </div>
        `;
        itemsGrid.appendChild(itemCard);
    });
}

// Load and display sales
function loadSales() {
    const selectedMonth = document.getElementById('monthSelect').value;
    displaySales(selectedMonth);
}

// Populate month select dropdown
function populateMonthSelect() {
    const sales = getSales();
    const monthSet = new Set();
    
    sales.forEach(sale => {
        const date = new Date(sale.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
        monthSet.add(JSON.stringify({ key: monthKey, label: monthLabel }));
    });
    
    const monthSelect = document.getElementById('monthSelect');
    const allOption = monthSelect.querySelector('option[value="all"]');
    monthSelect.innerHTML = '';
    monthSelect.appendChild(allOption);
    
    Array.from(monthSet)
        .map(m => JSON.parse(m))
        .sort((a, b) => b.key.localeCompare(a.key))
        .forEach(month => {
            const option = document.createElement('option');
            option.value = month.key;
            option.textContent = month.label;
            monthSelect.appendChild(option);
        });
}

// Handle month selection change
function handleMonthChange() {
    const selectedMonth = document.getElementById('monthSelect').value;
    displaySales(selectedMonth);
}

// Display sales data
function displaySales(selectedMonth) {
    let sales = getSales();
    
    if (selectedMonth !== 'all') {
        const [year, month] = selectedMonth.split('-').map(Number);
        sales = sales.filter(sale => {
            const saleDate = new Date(sale.timestamp);
            return saleDate.getMonth() === month - 1 && saleDate.getFullYear() === year;
        });
    }
    
    // Calculate summary
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const transactionCount = sales.length;
    const averageOrder = transactionCount > 0 ? totalRevenue / transactionCount : 0;
    
    // Display summary
    const salesSummary = document.getElementById('salesSummary');
    salesSummary.innerHTML = `
        <div class="sales-stat">
            <h4>Total Revenue</h4>
            <div class="value">${formatCurrency(totalRevenue)}</div>
        </div>
        <div class="sales-stat">
            <h4>Transactions</h4>
            <div class="value">${transactionCount}</div>
        </div>
        <div class="sales-stat">
            <h4>Average Order</h4>
            <div class="value">${formatCurrency(averageOrder)}</div>
        </div>
    `;
    
    // Display sales table
    const tableBody = document.getElementById('salesTableBody');
    if (sales.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px;">No sales data available</td></tr>';
        return;
    }
    
    // Sort by date (newest first)
    sales.sort((a, b) => b.timestamp - a.timestamp);
    
    tableBody.innerHTML = sales.map(sale => {
        const date = new Date(sale.timestamp);
        const itemsList = sale.items.map(item => 
            `${item.name} (${item.quantity}x)`
        ).join(', ');
        
        return `
            <tr>
                <td>${formatDateTime(date)}</td>
                <td>${itemsList}</td>
                <td>${formatCurrency(sale.total)}</td>
            </tr>
        `;
    }).join('');
}

// Make functions available globally for onclick handlers
window.editItem = editItem;
window.deleteItem = deleteItem;

