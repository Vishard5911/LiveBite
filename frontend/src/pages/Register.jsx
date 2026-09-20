import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import AppIcon from '../components/AppIcon';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const { register } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register(name, email, password, role);
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
      alert("Registration failed");
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
        <h2 className="text-3xl font-serif font-bold text-center text-gray-900 mb-8">Create an Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center gap-2 border rounded-xl py-3 cursor-pointer transition-colors ${role === 'customer' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" name="role" value="customer" className="hidden" checked={role === 'customer'} onChange={() => setRole('customer')} />
                <span className="font-semibold text-sm">Customer</span>
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 border rounded-xl py-3 cursor-pointer transition-colors ${role === 'restaurant_owner' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" name="role" value="restaurant_owner" className="hidden" checked={role === 'restaurant_owner'} onChange={() => setRole('restaurant_owner')} />
                <span className="font-semibold text-sm">Vendor</span>
              </label>
            </div>
          </div>
          <button type="submit" className="w-full bg-brand-500 text-white font-bold py-4 rounded-xl hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30 mt-2">
            Sign Up
          </button>
        </form>
        
        <p className="text-center text-gray-500 mt-8 text-sm">
          Already have an account? <Link to="/login" className="text-brand-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
