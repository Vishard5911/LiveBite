import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ShieldCheck, ChevronRight, Utensils, Trash2 } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Checkout = () => {
  const { cart, cartItems, clearCart, removeFromCart, updateQuantity } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [includeStream, setIncludeStream] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState('cards');
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(300);
  const navigate = useNavigate();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    if (paymentMode === 'upi' && step === 2) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentMode, step]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const streamFee = includeStream ? 15 : 0;
  const total = subtotal + streamFee;

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      const orderData = {
        restaurant: cart.restaurant._id,
        items: cartItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal: subtotal,
        liveCamAddon: includeStream,
        liveCamFee: streamFee
      };

      const { data } = await api.post('/orders', orderData);
      clearCart();
      navigate(`/order/${data._id}`);
    } catch (error) {
      console.error(error);
      alert(`Error placing order: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
          <Utensils className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <button onClick={() => navigate('/')} className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF7] min-h-screen pb-24 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {step === 2 && (
          <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-500 hover:text-brand-600 font-bold mb-4 transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180" /> Back to Order Summary
          </button>
        )}

        <h1 className="text-3xl font-heading font-extrabold text-gray-900 mb-8">
          {step === 1 ? 'Checkout' : 'Payment Method'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Order Details */}
          <div className="md:col-span-2 space-y-6">
            
            {step === 1 ? (
              <>
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
              
              <div className="space-y-6">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    {item.image ? (
                       <img src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                        <Utensils className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100 w-fit">
                          <button onClick={() => updateQuantity(item._id, -1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors hover:text-brand-600 font-bold">-</button>
                          <span className="text-sm font-bold w-6 text-center text-gray-900">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, 1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors hover:text-brand-600 font-bold">+</button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item._id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Stream Upsell - Premium UI */}
            <div className={`relative overflow-hidden rounded-3xl border-2 transition-all cursor-pointer ${
                includeStream ? 'border-brand-500 bg-brand-50/30' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setIncludeStream(!includeStream)}
            >
              {includeStream && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 rounded-full blur-[60px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
              )}
              
              <div className="p-6 md:p-8 flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  includeStream ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Video className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold text-lg ${includeStream ? 'text-brand-700' : 'text-gray-900'}`}>
                      Live Kitchen Stream
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-400 line-through">₹50</span>
                      <span className={`font-bold ${includeStream ? 'text-brand-600' : 'text-gray-900'}`}>+₹15</span>
                    </div>
                  </div>
                  <p className={`text-sm ${includeStream ? 'text-brand-700/80' : 'text-gray-500'} mb-4`}>
                    Watch your food being prepared in real-time by the chef! Exclusive access link provided after checkout.
                  </p>
                  
                  <div className={`w-14 h-8 rounded-full flex items-center transition-colors px-1 ${
                    includeStream ? 'bg-brand-500' : 'bg-gray-200'
                  }`}>
                    <div className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform ${
                      includeStream ? 'translate-x-6' : 'translate-x-0'
                    }`}></div>
                  </div>
                </div>
              </div>
            </div>
            </>
            ) : (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Select Payment Mode</h2>
                
                <div className="mb-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {['upi', 'cards', 'netbanking', 'cod'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setPaymentMode(mode)}
                        className={`py-4 px-4 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                          paymentMode === mode 
                            ? 'border-brand-500 bg-brand-50 text-brand-700' 
                            : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {mode === 'upi' && 'UPI'}
                        {mode === 'cards' && 'Cards'}
                        {mode === 'netbanking' && 'Netbanking'}
                        {mode === 'cod' && 'Cash on Delivery'}
                      </button>
                    ))}
                  </div>

                  <div className="pt-4">
                    {paymentMode === 'cards' && (
                      <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                        <input 
                          type="text" 
                          placeholder="Card number" 
                          className="w-full bg-gray-50 border border-gray-200 rounded-t-xl p-4 text-sm outline-none focus:border-brand-500 focus:z-10 relative transition-colors"
                        />
                        <div className="flex">
                          <input 
                            type="text" 
                            placeholder="MM / YY" 
                            className="w-1/2 bg-gray-50 border border-gray-200 border-t-0 border-r-0 rounded-bl-xl p-4 text-sm outline-none focus:border-brand-500 focus:z-10 relative transition-colors"
                          />
                          <input 
                            type="text" 
                            placeholder="CVC" 
                            className="w-1/2 bg-gray-50 border border-gray-200 border-t-0 rounded-br-xl p-4 text-sm outline-none focus:border-brand-500 focus:z-10 relative transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMode === 'upi' && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                        <div className="bg-white border-2 border-dashed border-brand-200 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                          <div className="absolute top-0 w-full h-1 bg-gray-100">
                            <div className="h-full bg-brand-500 transition-all duration-1000" style={{ width: `${(timeLeft / 300) * 100}%` }}></div>
                          </div>
                          
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=livebite@upi&pn=LiveBite&am=${total.toFixed(2)}`} 
                            alt="UPI QR Code" 
                            className="w-40 h-40 mb-4 rounded-xl shadow-sm border border-gray-100 p-2" 
                          />
                          <p className="font-bold text-gray-900 mb-1 text-lg">Scan to Pay ₹{total.toFixed(2)}</p>
                          <p className="text-xs text-gray-500 mb-4 font-medium">Use any UPI app (GPay, PhonePe, Paytm)</p>
                          
                          <div className="bg-orange-50 text-brand-700 px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 border border-brand-100">
                            <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
                            Awaiting Payment... <span className="tabular-nums opacity-80">{formatTime(timeLeft)}</span>
                          </div>
                        </div>

                        <div className="relative flex items-center py-1">
                          <div className="flex-grow border-t border-gray-200"></div>
                          <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-wider">Or enter UPI ID</span>
                          <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <input 
                          type="text" 
                          placeholder="Enter UPI ID (e.g. name@okhdfc)" 
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-brand-500 transition-colors font-medium"
                        />
                      </div>
                    )}

                    {paymentMode === 'netbanking' && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-brand-500 transition-colors text-gray-700">
                          <option value="">Select your Bank</option>
                          <option value="sbi">State Bank of India</option>
                          <option value="hdfc">HDFC Bank</option>
                          <option value="icici">ICICI Bank</option>
                          <option value="axis">Axis Bank</option>
                        </select>
                      </div>
                    )}

                    {paymentMode === 'cod' && (
                      <div className="bg-orange-50 text-orange-700 p-4 rounded-xl text-sm font-medium border border-orange-100 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                        <p>Pay with cash or UPI when your food arrives at your doorstep.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-28">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Payment Summary</h2>
              
              <div className="space-y-4 text-sm text-gray-600 border-b border-gray-100 pb-6 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-green-600 font-bold">Free</span>
                </div>
                {includeStream && (
                  <div className="flex justify-between text-brand-600 font-medium">
                    <span>Live Stream Add-on</span>
                    <span>+₹15</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-gray-900 text-lg">Total</span>
                <span className="font-extrabold text-2xl text-gray-900">
                  ₹{total.toFixed(2)}
                </span>
              </div>
              
              {step === 1 ? (
                <button 
                  onClick={() => setStep(2)}
                  className="w-full bg-brand-500 text-white font-bold py-4 rounded-2xl hover:bg-brand-600 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-brand-500/20 mt-6"
                >
                  Proceed to Payment <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button 
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-black/20 mt-6"
                >
                  {loading ? 'Processing...' : (
                    <>
                      Pay ₹{total.toFixed(2)} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              )}
              
              <p className="text-xs text-gray-400 mt-4 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Secure checkout powered by Stripe
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
