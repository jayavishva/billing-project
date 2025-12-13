# Restaurant Billing Website

A simple restaurant billing system with menu management, cart functionality, QR code payment, bill printing, and sales tracking.

## Features

- **Menu Display**: View menu items with images, names, and prices
- **Shopping Cart**: Add items to cart, adjust quantities, remove items
- **Billing**: Automatic calculation with tax (5%)
- **Payment QR Code**: Generate QR code with payment link and bill details
- **Print Bill**: Print formatted bills
- **Menu Management**: Full CRUD operations for menu items (Admin Panel)
- **Monthly Sales**: View sales statistics and transaction history
- **Data Persistence**: All data stored in browser localStorage

## File Structure

```
restaurant-billing/
├── index.html          # Main customer-facing page
├── admin.html          # Admin page for menu management
├── css/
│   ├── style.css       # Main page styles
│   └── admin.css       # Admin page styles
├── js/
│   ├── main.js         # Main page logic (cart, billing)
│   ├── admin.js        # Admin page logic (CRUD operations)
│   └── utils.js        # Shared utilities (localStorage, QR code)
├── images/             # Menu item images
└── README.md
```

## Setup

1. Open `index.html` in a web browser
2. The default menu includes: Idly, Puri, Vada, Coffee, and Pazhampori
3. Add your own images to the `images/` folder (see `images/README.md`)

## Usage

### Customer View (index.html)

1. Click on menu items to add them to the cart
2. Adjust quantities using +/- buttons
3. Click "Pay Now" to generate QR code and save transaction
4. Click "Print Bill" to print the bill
5. Click "Clear Cart" to empty the cart

### Admin Panel (admin.html)

1. Navigate to Admin Panel from the main page
2. **Add Items**: Fill in the form and submit
3. **Edit Items**: Click "Edit" on any item card
4. **Delete Items**: Click "Delete" on any item card
5. **View Sales**: Select a month to view sales statistics

## Technologies Used

- HTML5
- CSS3 (with responsive design)
- JavaScript (ES6+)
- localStorage for data persistence
- QRCode.js library for QR code generation

## Browser Compatibility

Works on all modern browsers that support:
- ES6 JavaScript
- localStorage
- CSS Grid and Flexbox

## Notes

- All data is stored locally in the browser
- Images can be uploaded as files or provided as paths
- QR codes contain both payment link (UPI format) and bill details
- Sales data is automatically saved when bills are generated

