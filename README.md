# FurniHub Frontend 

The frontend application for **FurniHub**, a modern, premium multi-vendor furniture marketplace. Built with React and Vite, it emphasizes cutting-edge design, smooth micro-interactions, and robust, asynchronous global state.

## 🌟 Key Features
*   **Premium Design System:** Hand-tailored CSS using CSS variables (`index.css`), smooth hover states, and dynamic elements without generic framework utilities.
*   **Dynamic Micro-Animations:** Built with `framer-motion` to delight users seamlessly transitioning between app states and tabs.
*   **Global State Management:** 
    * Zustand (`useAuthStore`, `useCartStore`, `useWishlistStore`, `useFollowStore`) manages instant UI syncing instantly across complex layouts and interactions without context drilling.
*   **Optimal Data Fetching:** 
    * React Query caches requests locally, enables background polling, auto-retry on 500/404s, and handles complex multi-tier object mutations with ease.
*   **Responsive Layouting:** 
    * Fully adaptive Grid & Flexbox system. The entire 'Explore' and 'Product Detail' pipelines effortlessly convert a vertical mobile ribbon into a split-pane desktop workstation experience.
*   **Role-Based Dashboards:** 
    * Customer Profile (`Profile.jsx`) controls wishlist, orders, following stats.
    * Vendor Space (`VendorDashboard.jsx`) and storefronts (`VendorProfile.jsx` or `VendorSettings.jsx`) offer management controls and analytics.

## 🛠️ Tech Stack
- **Framework:** React 18, Vite
- **Routing:** React Router DOM (v6)
- **State Management:** Zustand
- **Data Fetching:** TanStack React Query, Axios
- **UI & Animations:** Framer Motion, Lucide React (Icons), React Hot Toast
- **Testing:** Vitest & Mock Service Worker (MSW)

## 📦 Local Installation

Prerequisites: A running instance of the FurniHub [Backend API](../backend/README.md).

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables Config:**
   Create a `.env` file referencing your backend instances.
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The site will compile and listen on `http://localhost:5173`.

## 📁 System Architecture
- `src/components/layout`: Houses the persistent App scaffolding (Navbars, Dashboards, Mobile Tab Bar).
- `src/pages`: Distinct isolated feature branches (Authentication logic, Custom Exploration, Checkout workflows).
- `src/services/api.js`: Singleton Axios configuration containing interceptors ensuring JWT refresh mechanics execute effortlessly upon token obsolescence.
- `src/store`: The Zustand stores controlling cross-domain data synchronization.

## 🧪 Testing
The frontend comes fully configured with Vitest for robust component testing and `MSW` for reliable mock HTTP traffic interception.
```bash
npm run test
```
