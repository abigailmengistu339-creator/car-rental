# Fleet Directory PRO 🚗💨

> An enterprise-grade Fleet & Vehicle Operations Management Platform built with React, Vite, TypeScript, and Supabase.

---

## ✨ Features

- 🏎️ **Live Fleet Management**: Categorized tracking for commercial, utility, and executive vehicles (76 Market, 78 Market, 79 Pickup).
- 📋 **Document & Regulatory Compliance Vault**: Secure upload and expiration tracking for Vehicle Logbooks (Libre) and Third-Party Insurance certificates.
- 👥 **Driver & Contact Directory**: Comprehensive contact management for drivers, corporate clients, and maintenance vendors with direct call actions.
- 🛡️ **Role-Based Access Control (RBAC)**:
  - **Admin**: Full authority to register vehicles, assign operators, update base locations, upload compliance docs, and export audits.
  - **Standard User**: Streamlined operational view with instant search, filtering, and theme preferences.
- 📊 **Real-time Health Gauge & Metrics**: Interactive compliance percentage ring and fleet distribution stats.
- 🌓 **Dynamic Dark / Light Themes**: Apple-inspired design system with frosted glassmorphism, micro-animations, and responsive layouts.
- ⚡ **Command Palette**: Instant keyboard-driven navigation via `Ctrl + K` / `Cmd + K`.
- 📁 **CSV Audit Reporting**: One-click data export for administrative audits and logistics compliance.

---

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Modern Vanilla CSS with CSS Custom Properties, Glassmorphism, and responsive grid/dock navigation
- **Backend / Database**: Supabase (PostgreSQL with Row-Level Security policies)
- **Authentication**: Supabase Auth with automated role assignment triggers
- **Icons**: Lucide React

---

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/abigailmengistu339-creator/car-rental.git
cd car-rental
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your Supabase credentials:
```bash
cp .env.example .env.local
```

Fill in:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_USE_MOCK_DATA=false
```

### 4. Database Setup
Execute the SQL schema in `supabase/full_setup.sql` in your Supabase SQL editor to create:
- `profiles` and `vehicles` tables
- `user_roles` RBAC table
- Storage bucket `documents`
- Row-Level Security (RLS) policies

### 5. Start Development Server
```bash
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 📦 Production Build

```bash
npm run build
```

---

## 📄 License

MIT License &copy; 2026 Fleet Directory PRO
