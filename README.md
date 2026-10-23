# RADIANT WEARS — Luxury Streetwear Web Application

A full-stack modern luxury e-commerce web application and REST API for **Radiant Wears**.

---

## 📁 Project Structure

```
radiantwears/
├── backend/                  # Express REST API Server
│   ├── data/                 # Catalog & Lookbook Database
│   ├── server.js             # API Routes & Controllers
│   └── package.json          # Node.js & Express dependencies ("npm start")
│
└── frontend/                 # Vite + React Modern Web Application
    ├── public/images/        # High-resolution Fashion Assets
    ├── src/
    │   ├── components/       # UI Components (Navbar, Hero, Grid, Cart, Modal, Checkout)
    │   ├── context/          # ShopContext (Cart, Wishlist, Currency, Theme)
    │   ├── data/             # Frontend Product Data
    │   ├── App.jsx           # Main React App Entry
    │   ├── App.css           # Component Styles & Micro-animations
    │   └── index.css         # Design Tokens & Theme Variables
    ├── index.html            # Entry HTML & Google Fonts
    ├── vite.config.js        # Vite Config with Backend Proxy
    └── package.json          # React & Vite dependencies ("npm run dev")
```

---

## 🚀 How to Run

### 1. Starting the Backend API Server
The backend starts with the command **`npm start`**:
```bash
cd backend
npm start
```
> Server will be running at: **http://localhost:5000**  
> Health check endpoint: **http://localhost:5000/api/health**

---

### 2. Starting the Frontend React Application
The frontend starts with the command **`npm run dev`**:
```bash
cd frontend
npm run dev
```
> Web application will be live at: **http://localhost:5173**

---

## ✨ Features

- **Luxury Design System**: Obsidian Dark and Alabaster Light modes with glassmorphism.
- **Product Catalog**: Dynamic category filtering, search, price slider, and sorting.
- **Quick View Modal**: Multi-angle image switcher, size selector with size guide, and stock alert meter.
- **Interactive Cart & Wishlist Drawers**: Free shipping progress bar, promo code applicator (`RADIANT15`, `VIPGOLD`), and item counters.
- **Simulated Checkout**: Multi-step checkout with credit card / digital wallet simulator and celebratory confetti.
- **Editorial Lookbook**: "Shop the Look" with interactive radiant hotspot pins.
- **Custom Generated High-Fashion Imagery**: Studio-grade fashion assets included in `frontend/public/images/`.
