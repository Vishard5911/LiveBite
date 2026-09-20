import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import VendorDashboard from './pages/VendorDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id" element={<OrderTracking />} />
            <Route path="/vendor" element={<VendorDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
