# 🎛️ Expert Admin Dashboard

**The Command Center for Capital Property Administrators.**
This React-based dashboard allows admins and agents to manage listings, track performance, view analytics, and control platform settings.

---

## 🚀 Features

*   **Comprehensive Listing Management:** Create, edit, and approve property listings.
*   **User & Role Management:** Assign permissions and manage user accounts.
*   **Analytics & Reporting:** Visual charts and stats for sales, leads, and agent performance.
*   **CRM Integration:** Sychronize data with Salesforce & Zoho.
*   **Responsive Design:** Optimized for desktop and tablet administration.

---

## 🛠️ Tech Stack

*   **Framework:** `React.js` (Vite / CRA)
*   **State Management:** `Redux Toolkit`
*   **Styling:** `TailwindCSS` / `SCSS`
*   **Charts:** `Recharts` / `Chart.js`
*   **Build Tool:** `Vite`

---

## 📂 Project Structure

```bash
src/
├── components/         # Reusable UI Components
├── pages/              # Route Pages (Dashboard, Listings, Settings)
├── features/           # Redux Slices & Logic
├── services/           # API Service Calls
├── assets/             # Static Images & Fonts
└── App.tsx             # Main App Component
```

---

## ⚡ Quick Start

### 1. Prerequisites
*   Node.js v18+

### 2. Installation
```bash
# Install dependencies
npm install

# Setup Environment
cp .env.example .env
# (Set VITE_API_URL to your backend URL)
```

### 3. Run Locally
```bash
# Start Dev Server
npm run dev
# Access at http://localhost:5173 (or 3000)
```

### 4. Build for Production
```bash
npm run build
# Output will be in /dist directory ready for Nginx
```

---

## 📜 License
Private & Confidential. © 2026 Capital Property.
