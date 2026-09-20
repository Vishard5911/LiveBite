import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Search, Star, Clock, ArrowRight, Video } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'restaurant_owner') {
      navigate('/vendor');
      return;
    }
    fetchRestaurants();
  }, [user, navigate]);

  const fetchRestaurants = async () => {
    try {
      const { data } = await api.get('/restaurants');
      setRestaurants(data);
    } catch (error) {
      console.error("Error fetching restaurants", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get a random high-quality Unsplash food image based on cuisine
  const getCoverImage = (cuisines, id) => {
    const keyword = cuisines && cuisines.length > 0 ? cuisines[0] : 'food';
    return `https://source.unsplash.com/800x600/?${keyword},restaurant,plating&sig=${id}`;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans pb-32">
      
      {/* 1. Hero Section (Cream background, Serif text, floating images) */}
      <section className="relative pt-40 pb-20 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        
        {/* Subtle Background Lines (Mimicking the image) */}
        <div className="absolute inset-0 pointer-events-none opacity-20 flex justify-center gap-32">
          <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-gray-400 to-transparent"></div>
          <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-gray-400 to-transparent"></div>
          <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-gray-400 to-transparent"></div>
          <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-gray-400 to-transparent"></div>
        </div>

        {/* Background Animated Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        {/* Floating Food Images - Fixed Positioning */}
        <div className="absolute -left-16 lg:left-[2%] xl:left-[8%] top-[15%] md:top-[25%] w-32 lg:w-40 h-32 lg:h-40 rounded-full border-8 border-white shadow-xl overflow-hidden animate-float z-0 hidden sm:block opacity-30">
          <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Gourmet Food" />
        </div>
        <div className="absolute -right-12 lg:right-[2%] xl:right-[8%] top-[10%] md:top-[15%] w-24 lg:w-32 h-24 lg:h-32 rounded-full border-8 border-white shadow-xl overflow-hidden animate-float-delayed z-0 hidden sm:block opacity-30">
          <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Gourmet Food" />
        </div>
        <div className="absolute -left-8 lg:left-[5%] xl:left-[12%] bottom-[10%] md:bottom-[20%] w-24 lg:w-32 h-24 lg:h-32 rounded-full border-8 border-white shadow-xl overflow-hidden animate-float-delayed z-0 hidden sm:block opacity-30">
          <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Gourmet Food" />
        </div>
        <div className="absolute -right-10 lg:right-[5%] xl:right-[15%] bottom-[15%] md:bottom-[25%] w-32 lg:w-40 h-32 lg:h-40 rounded-full border-8 border-white shadow-xl overflow-hidden animate-float z-0 hidden sm:block opacity-30">
          <img src="https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Gourmet Food" />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-500"></span>
            <span className="text-xs font-bold tracking-widest text-gray-800 uppercase">Premium Delivery Services</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-gray-900 leading-[1.1] mb-6">
            Bringing Flavor to Every <br />
            <span className="text-brand-500 italic">Occasion You Love</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 font-light">
            We craft exceptional culinary experiences that transform every gathering into a truly unforgettable celebration.
          </p>
          
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={() => document.getElementById('restaurants')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-brand-500 text-white px-8 py-4 rounded-full font-bold hover:bg-brand-600 transition-colors shadow-xl shadow-brand-500/20"
            >
              Order Catering
            </button>
            <button 
              onClick={() => document.getElementById('restaurants')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold border border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
            >
              View Menu
            </button>
          </div>
          
          <div className="mt-12 flex justify-center gap-12 text-sm font-semibold text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Fresh Ingredients
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Expert Chefs
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Kitchen Integration Promo */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-20">
        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl bg-[#111]">
          {/* Background Video Mock Image */}
          <img 
            src="https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
            alt="Kitchen Background" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 p-10 md:p-16">
            <div className="text-white flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest mb-6 w-max">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Live Broadcast
              </div>
              <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                Watch the <br/> Magic Happen
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-md font-light leading-relaxed">
                Step inside the kitchen before you order. Our exclusive live-streaming lets you witness the craft and care that goes into every dish.
              </p>
              <button 
                onClick={() => document.getElementById('restaurants')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-brand-500 text-white px-8 py-4 rounded-full font-bold w-max shadow-[0_0_40px_rgba(255,107,0,0.4)] hover:bg-brand-600 transition-all hover:scale-105"
              >
                Explore Live Kitchens
              </button>
            </div>

            {/* Floating UI Elements Mockup */}
            <div className="relative h-64 lg:h-auto flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-sm rounded-[2.5rem] bg-white/10 backdrop-blur-md border border-white/20 p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500 hover-lift">
                <div className="flex items-center justify-between mb-5">
                   <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 shadow-inner"></div>
                     <div>
                       <div className="text-white font-bold text-sm">Chef Antonio</div>
                       <div className="text-white/60 text-xs font-medium">Making Truffle Pasta</div>
                     </div>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center border border-white/10">
                     <Video className="w-5 h-5 text-brand-400 animate-pulse" />
                   </div>
                </div>
                <div className="w-full h-48 rounded-[1.5rem] bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden relative shadow-inner">
                   <img src="https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=400&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Cooking Stream" />
                   <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 z-10 cursor-pointer hover:bg-white/30 hover:scale-110 transition-all shadow-lg">
                     <div className="w-4 h-4 ml-1 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent"></div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Choose Us (Bento Box) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16 relative">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            The <span className="text-brand-500">LiveBite</span> Difference
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">We don't just deliver food. We deliver transparency, quality, and a visual feast.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Big Card */}
          <div className="col-span-1 md:col-span-7 bg-[#fff6ef] p-10 md:p-12 rounded-[3rem] relative overflow-hidden group hover-lift">
            <div className="absolute right-0 bottom-0 w-80 h-80 bg-orange-200 rounded-full filter blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center text-3xl mb-8 border border-orange-100 transform -rotate-6 group-hover:rotate-0 transition-transform">🔥</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4 font-serif leading-tight">Immersive Culinary Theatre</h3>
              <p className="text-gray-600 text-lg leading-relaxed max-w-md">Our live cameras put you right on the chef's counter. Experience the sights and sounds of your meal being crafted.</p>
            </div>
          </div>
          
          {/* Small Top Card */}
          <div className="col-span-1 md:col-span-5 bg-[#f8f5ff] p-10 md:p-12 rounded-[3rem] relative overflow-hidden group hover-lift flex flex-col justify-center">
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center text-2xl mb-6 border border-purple-100 group-hover:scale-110 transition-transform">🥬</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">Farm-Fresh Guarantee</h3>
              <p className="text-gray-500 leading-relaxed">We partner exclusively with vendors who source premium, seasonal ingredients.</p>
            </div>
          </div>
          
          {/* Small Bottom Card */}
          <div className="col-span-1 md:col-span-5 bg-[#f0fbff] p-10 md:p-12 rounded-[3rem] relative overflow-hidden group hover-lift flex flex-col justify-center">
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center text-2xl mb-6 border border-blue-100 group-hover:scale-110 transition-transform">✨</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">Pristine Hygiene</h3>
              <p className="text-gray-500 leading-relaxed">Total transparency means you see the spotless kitchens where your food is made.</p>
            </div>
          </div>

          {/* Long Card */}
          <div className="col-span-1 md:col-span-7 bg-gray-900 text-white p-10 md:p-12 rounded-[3rem] relative overflow-hidden group hover-lift">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-500 via-transparent to-transparent"></div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-10 h-full">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-3xl font-bold mb-4 font-serif leading-tight">Hand-Curated Menus</h3>
                <p className="text-gray-400 text-lg leading-relaxed max-w-sm">Every restaurant on LiveBite is hand-picked for exceptional quality and unique flavors.</p>
              </div>
              <div className="w-28 h-28 rounded-full border-4 border-brand-500 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                 <div className="absolute inset-1 border border-dashed border-gray-400 rounded-full animate-[spin_10s_linear_infinite]"></div>
                 <Star className="w-10 h-10 text-brand-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Restaurants Grid */}
      <section id="restaurants" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">Explore Restaurants</h2>
            <p className="text-gray-500 mt-3 text-lg">Top-rated kitchens streaming live right now.</p>
          </div>
          <button 
            onClick={() => document.getElementById('restaurants')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors group"
          >
            View All <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-[2.5rem] h-[450px] shadow-sm border border-gray-100"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((rest) => (
              <Link 
                to={`/restaurant/${rest._id}`} 
                key={rest._id}
                className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl hover-lift flex flex-col h-[450px]"
              >
                {/* Background Full Image */}
                <img 
                  src={rest.coverImage ? `${import.meta.env.VITE_API_URL}${rest.coverImage}` : getCoverImage(rest.cuisine, rest._id)} 
                  alt={rest.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 group-hover:to-black/80 transition-colors"></div>
                
                {/* Floating Tags (Top) */}
                <div className="relative z-10 p-6 flex justify-between items-start">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm flex items-center gap-1.5 hover:bg-white/30 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span> Live Feed
                  </div>
                  <div className="bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-3 py-2 rounded-full shadow-sm flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-orange-500 fill-current" /> {rest.rating ? rest.rating.toFixed(1) : 'New'} ({rest.numReviews || 0})
                  </div>
                </div>

                {/* Content (Bottom) */}
                <div className="relative z-10 p-6 mt-auto flex flex-col">
                  <h3 className="text-3xl font-bold text-white font-serif leading-tight mb-2 drop-shadow-md group-hover:-translate-y-1 transition-transform">
                    {rest.name}
                  </h3>
                  
                  {/* Cuisines */}
                  <div className="flex flex-wrap gap-2 mb-4 group-hover:-translate-y-1 transition-transform delay-75">
                    {rest.cuisine?.map((c, i) => (
                      <span key={i} className="text-xs font-semibold bg-white/20 backdrop-blur border border-white/20 text-white px-3 py-1 rounded-full">
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/20 mt-2 group-hover:-translate-y-1 transition-transform delay-100">
                    <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                      <Clock className="w-4 h-4 text-brand-400" /> 20-30 min
                    </div>
                    <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,107,0,0.3)]">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Home;
