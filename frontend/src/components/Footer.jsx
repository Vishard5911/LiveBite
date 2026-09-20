import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, MessageSquare, Phone, Mail } from 'lucide-react';
import AppIcon from './AppIcon';

const Footer = () => {
  return (
    <footer className="bg-[#111] text-white pt-12 pb-10 border-t border-gray-900 mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="text-brand-500">
                <AppIcon className="w-8 h-8" />
              </div>
              <span className="text-2xl font-serif font-bold tracking-wide">LiveBite</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Elevating your dining experience through transparent, live-streamed kitchen preparation and premium culinary delivery.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://livebite.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-brand-500 hover:text-white transition-all">
                <Globe className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-brand-500 hover:text-white transition-all">
                <MessageSquare className="w-4 h-4" />
              </a>
              <a href="tel:+1234567890" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-brand-500 hover:text-white transition-all">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Section 1 */}
          <div>
            <h4 className="text-lg font-bold font-serif mb-6 text-gray-100">Company</h4>
            <ul className="space-y-4">
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-gray-400 hover:text-brand-500 transition-colors text-sm">Home</button></li>
              <li><button onClick={() => document.getElementById('restaurants')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-brand-500 transition-colors text-sm">Restaurants</button></li>
              <li><Link to="/register" className="text-gray-400 hover:text-brand-500 transition-colors text-sm">Sign Up</Link></li>
              <li><a href="mailto:support@livebite.com" className="text-gray-400 hover:text-brand-500 transition-colors text-sm">Contact Support</a></li>
            </ul>
          </div>

          {/* Links Section 2 */}
          <div>
            <h4 className="text-lg font-bold font-serif mb-6 text-gray-100">Services</h4>
            <ul className="space-y-4">
              <li><Link to="/register" className="text-gray-400 hover:text-brand-500 transition-colors text-sm">Partner with us</Link></li>
              <li><button onClick={() => document.getElementById('restaurants')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-400 hover:text-brand-500 transition-colors text-sm">Live Kitchens</button></li>
              <li><Link to="/login" className="text-gray-400 hover:text-brand-500 transition-colors text-sm">Vendor Login</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-brand-500 transition-colors text-sm">User Login</Link></li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h4 className="text-lg font-bold font-serif mb-6 text-gray-100">Stay Updated</h4>
            <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter for exclusive offers and updates.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing to LiveBite!"); e.target.reset(); }} className="flex border border-gray-800 rounded-xl overflow-hidden focus-within:border-brand-500 transition-colors bg-white/5">
              <div className="pl-4 flex items-center justify-center text-gray-500">
                <Mail className="w-4 h-4" />
              </div>
              <input 
                type="email" 
                required
                placeholder="Email address" 
                className="w-full bg-transparent text-sm text-white px-3 py-3 outline-none placeholder-gray-600"
              />
              <button type="submit" className="bg-brand-500 text-white px-4 py-3 text-sm font-bold hover:bg-brand-600 transition-colors">
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} LiveBite Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Terms of Service</button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Cookie Settings</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
