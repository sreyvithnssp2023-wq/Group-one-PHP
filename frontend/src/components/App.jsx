import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

// Import Components
import PosSale from './POS';
import Products from './products';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';

function MainLayout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm border-b p-4 flex gap-3 justify-center flex-wrap">
        <Link
          to="/"
          className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
            isActive('/') ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          🛒 អេក្រង់លក់ (POS)
        </Link>

        <Link
          to="/products"
          className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
            isActive('/products') ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          📱 បញ្ជីទំនិញ
        </Link>

        <Link
          to="/products/new"
          className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
            isActive('/products/new') ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          📦 បន្ថែមទំនិញថ្មី
        </Link>
      </div>

      {/* Routes */}
      <div className="p-4 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<PosSale />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<AddProduct />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />
        </Routes>
      </div>
    </div>
  );
}

// Wrap BrowserRouter នៅទីនេះ ដើរបាន ១០០%
export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}