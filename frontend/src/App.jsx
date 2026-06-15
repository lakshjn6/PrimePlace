import React from 'react';
import VerifyEmail from './pages/VerifyEmail';  
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/Scrolltotop';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Footer from './pages/Footer1';

import Navbar         from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home          from './pages/Home';
import Register      from './pages/Register';
import Login         from './pages/Login';
import Products      from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import Orders        from './pages/Orders';
import Profile       from './pages/Profile';

<style>{`
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity:1; } 50% { opacity:0.4; } }
`}</style>

export default function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
            <Navbar />
            <Routes>
              <Route path="/"              element={<Home />} />
              <Route path="/register"      element={<Register />} />
              <Route path="/login"         element={<Login />} />
              <Route path="/products"      element={<Products />} />
              <Route path="/products/:slug" element={<ProductDetail />} />

              <Route path="/cart" element={
                <ProtectedRoute><Cart /></ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute><Checkout /></ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute><Orders /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />

              <Route path="/verify-email" element={<VerifyEmail />} />  {/* ← ADD */}

              <Route path="*" element={
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'70vh',flexDirection:'column',gap:16,background:'#060608',color:'#fff'}}>
                  <h1 style={{fontFamily:'Georgia,serif',fontSize:72,margin:0,color:'#7c5cfc'}}>404</h1>
                  <p style={{color:'#555'}}>Page not found</p>
                  <a href="/" style={{color:'#7c5cfc'}}>Go home</a>
                </div>
              } />
            </Routes>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                style: { background:'#1a1a2e', color:'#fff', border:'1px solid #2a2a3a' },
                success: { iconTheme: { primary:'#7c5cfc', secondary:'#fff' } },
              }}
            />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
