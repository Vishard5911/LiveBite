import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Star, Plus, Check, Search, Info, Clock, MessageSquare } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const { cartItems, addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      const { data } = await api.get(`/restaurants/${id}`);
      setRestaurant(data);
    } catch (error) {
      console.error("Error fetching restaurant details", error);
    } finally {
      setLoading(false);
    }
  };

  const getCoverImage = (cuisines, rid) => {
    const keyword = cuisines && cuisines.length > 0 ? cuisines[0] : 'food';
    return `https://source.unsplash.com/1600x900/?${keyword},restaurant&sig=${rid}`;
  };

  const isItemInCart = (itemId) => {
    return cartItems.some(item => item._id === itemId);
  };

  const handleAddToCart = (item) => {
    if (!user) {
      // User is not logged in, save intent and redirect
      localStorage.setItem('pendingCartItem', JSON.stringify({ restaurant, item }));
      navigate('/login');
      return;
    }
    
    // Call addToCart correctly with both arguments
    addToCart(restaurant, item);
    setToast({ message: `${item.name} added to cart!` });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setSubmittingReview(true);
    try {
      await api.post(`/restaurants/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewComment('');
      setReviewRating(5);
      fetchRestaurant();
      setToast({ message: "Review added successfully!" });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      alert(error.response?.data?.message || "Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse min-h-screen bg-gray-50">
        <div className="h-96 bg-gray-200 w-full"></div>
        <div className="max-w-5xl mx-auto px-4 mt-8">
          <div className="h-12 bg-gray-200 w-1/3 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 w-1/4 rounded mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-gray-200 rounded-2xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) return <div className="text-center py-20 text-gray-500">Restaurant not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      
      {/* Immersive Cover Photo */}
      <div className="relative h-[400px] w-full">
        <img 
          src={restaurant.coverImage ? `${import.meta.env.VITE_API_URL}${restaurant.coverImage}` : getCoverImage(restaurant.cuisine, restaurant._id)} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-8 rounded-3xl inline-block shadow-2xl">
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-white mb-2">{restaurant.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-1 bg-brand-500 px-3 py-1 rounded-full text-sm font-bold text-white shadow-sm">
                <Star className="w-4 h-4 fill-current" /> {restaurant.rating ? restaurant.rating.toFixed(1) : 'New'} ({restaurant.numReviews || 0} reviews)
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <MapPin className="w-4 h-4 text-brand-400" /> {restaurant.address}
              </div>
              <div className="hidden sm:block w-1 h-1 bg-white/30 rounded-full"></div>
              <div className="flex gap-2">
                {restaurant.cuisine?.map((c, i) => (
                  <span key={i} className="text-sm font-medium">{c}{i < restaurant.cuisine.length - 1 ? ',' : ''}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Menu Section */}
        <div className="lg:col-span-2">
          
          <div className="flex justify-between items-center mb-8 sticky top-24 bg-gray-50/90 backdrop-blur-md py-4 z-10 border-b border-gray-200">
            <h2 className="text-2xl font-bold font-heading text-gray-900">Featured Menu</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search menu..." className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm outline-none focus:border-brand-500 w-48 shadow-sm" />
            </div>
          </div>

          {restaurant.menu?.length === 0 ? (
            <div className="text-center bg-white p-12 rounded-3xl border border-gray-100">
              <p className="text-gray-500 text-lg">Menu is currently unavailable.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {restaurant.menu?.map(item => (
                <div key={item._id} className="bg-white border border-gray-100 hover:border-brand-300 rounded-2xl overflow-hidden hover-lift flex flex-col group relative">
                  
                  {item.image ? (
                    <div className="h-40 w-full overflow-hidden">
                      <img src={item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL}${item.image}`} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="h-2 bg-gradient-to-r from-brand-400 to-brand-600"></div>
                  )}
                  
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h3 className="font-bold text-lg text-gray-900 font-heading leading-tight">{item.name}</h3>
                        <span className="font-bold text-brand-600 whitespace-nowrap bg-brand-50 px-2 py-1 rounded-md">₹{parseFloat(item.price).toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                        {item.description || "A delicious classic crafted with the finest ingredients."}
                      </p>
                    </div>

                    <button 
                      onClick={() => handleAddToCart(item)}
                      disabled={isItemInCart(item._id)}
                      className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                        isItemInCart(item._id) 
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-white text-gray-900 border border-gray-200 hover:border-gray-900 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {isItemInCart(item._id) ? <><Check className="w-4 h-4" /> Added</> : <><Plus className="w-4 h-4" /> Add to Cart</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-32">
            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-gray-400" /> About this place
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">{restaurant.address}</p>
              </div>
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">Open until 11:00 PM</p>
              </div>
              
              <hr className="border-gray-100 my-4" />
              
              <div className="bg-brand-50 p-4 rounded-2xl border border-brand-100">
                <h4 className="font-bold text-brand-700 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                  Live Kitchen Available
                </h4>
                <p className="text-xs text-brand-600/80">Add the stream option at checkout to watch your food being prepared in real-time.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
            <MessageSquare className="w-6 h-6 text-brand-500" />
            <h2 className="text-2xl font-bold font-heading text-gray-900">Customer Reviews</h2>
            <div className="ml-auto flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <Star className="w-5 h-5 text-brand-500 fill-current" />
              <span className="font-bold text-lg text-gray-900">{restaurant.rating ? restaurant.rating.toFixed(1) : '0.0'}</span>
              <span className="text-gray-500 text-sm">({restaurant.numReviews || 0})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-6">
              {(!restaurant.reviews || restaurant.reviews.length === 0) ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No reviews yet. Be the first to share your experience!</p>
                </div>
              ) : (
                restaurant.reviews.map(review => (
                  <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold shadow-inner">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{review.userName}</p>
                          <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-brand-500 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mt-3 ml-13 pl-13">"{review.comment}"</p>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setReviewRating(num)}
                          className="focus:outline-none transform hover:scale-110 transition-transform"
                        >
                          <Star className={`w-8 h-8 ${reviewRating >= num ? 'text-brand-500 fill-current drop-shadow-sm' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Share your experience</label>
                    <textarea
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-500 text-sm text-gray-700 resize-none h-24 shadow-sm"
                      placeholder="What did you like about the food?"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 transform ${toast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-green-600 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold border border-green-500/50">
          <div className="bg-white/20 rounded-full p-1">
            <Check className="w-5 h-5 text-white" />
          </div>
          {toast?.message}
        </div>
      </div>

    </div>
  );
};

export default RestaurantDetail;
