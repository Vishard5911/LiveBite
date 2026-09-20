import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, Store } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import AppIcon from './AppIcon';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="bg-[#111] text-white rounded-full px-6 py-4 flex justify-between items-center shadow-2xl border border-gray-800">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 text-brand-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <AppIcon className="w-8 h-8" />
          </div>
          <span className="text-xl font-serif font-bold tracking-wide">LiveBite</span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link to="/" className="hover:text-white transition-colors bg-white/10 px-4 py-1.5 rounded-full text-white">Home</Link>
          <a href="/#restaurants" className="hover:text-white transition-colors">Restaurants</a>
          <Link to="/vendor" className="hover:text-white transition-colors">Kitchen</Link>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-4">
          
          {/* Vendor Links */}
          {user?.role === 'restaurant_owner' && (
            <Link 
              to="/vendor" 
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <Store className="w-4 h-4" /> Dashboard
            </Link>
          )}

          {/* User Account / Login */}
          {user ? (
            <div className="flex items-center gap-3">
              {user.role !== 'restaurant_owner' && (
                <Link to="/checkout" className="relative p-2 text-gray-400 hover:text-brand-500 transition-colors group">
                  <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {cartCount > 0 && (
                    <span className="absolute 0 -right-1 bg-brand-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#111]">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              <button 
                onClick={handleLogout} 
                className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-full hover:bg-white/10"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block">
                Log in
              </Link>
              <Link to="/register" className="text-sm font-bold bg-brand-500 text-white px-5 py-2 rounded-full hover:bg-brand-600 transition-all hover:shadow-lg hover:shadow-brand-500/30">
                Book Catering
              </Link>
            </div>
          )}
        </div>
        
      </div>
    </nav>
  );
};

export default Navbar;
