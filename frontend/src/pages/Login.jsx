import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import AppIcon from '../components/AppIcon';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user.role === 'restaurant_owner') {
        navigate('/vendor');
      } else {
        const pendingCartItemStr = localStorage.getItem('pendingCartItem');
        if (pendingCartItemStr) {
          const pending = JSON.parse(pendingCartItemStr);
          addToCart(pending.restaurant, pending.item);
          localStorage.removeItem('pendingCartItem');
          navigate(`/restaurant/${pending.restaurant._id}`);
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center pt-32 pb-20 px-4">
      <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-gray-100 max-w-md w-full relative z-20">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 text-brand-500 rounded-full flex items-center justify-center shadow-lg">
            <AppIcon className="w-12 h-12" />
          </div>
        </div>
        <h2 className="text-3xl font-serif font-bold text-center text-gray-900 mb-8">Welcome Back</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full bg-brand-500 text-white font-bold py-4 rounded-xl hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30">
            Log In
          </button>
        </form>
        
        <p className="text-center text-gray-500 mt-8 text-sm">
          Don't have an account? <Link to="/register" className="text-brand-600 font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
