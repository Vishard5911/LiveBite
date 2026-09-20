import React, { useContext, useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Settings, Users, Activity, Plus, Upload, Save, Edit3, Trash, ShoppingBag, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const VendorDashboard = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  
  // Restaurant state
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Orders state
  const [orders, setOrders] = useState([]);
  
  // Create Restaurant Form
  const [formData, setFormData] = useState({ name: '', cuisine: '', address: '' });
  
  // Menu OCR state
  const [menuItems, setMenuItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Streaming state
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewers, setViewers] = useState(0);
  const streamRef = useRef(null);
  const peerConnections = useRef({});

  useEffect(() => {
    fetchMyRestaurant();
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMyRestaurant = async () => {
    try {
      const { data } = await api.get('/restaurants/my-restaurant');
      setRestaurant(data);
      setMenuItems(data.menu || []);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error fetching restaurant:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/vendor');
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      alert("Error updating order status");
    }
  };

  const [coverPhoto, setCoverPhoto] = useState(null);

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('cuisine', formData.cuisine);
      fd.append('address', formData.address);
      if (coverPhoto) fd.append('coverImage', coverPhoto);

      const { data } = await api.post('/restaurants/my-restaurant', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setRestaurant(data);
    } catch (error) {
      alert("Error creating restaurant");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('menuImage', file);

    setUploading(true);
    try {
      const { data } = await api.post('/restaurants/my-restaurant/scan-menu', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Append scanned items to current menu
      setMenuItems([...menuItems, ...data.scannedItems]);
    } catch (error) {
      alert("Error scanning menu");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [editingIndex, setEditingIndex] = useState(null);

  const handleItemChange = (index, field, value) => {
    const newItems = [...menuItems];
    newItems[index][field] = field === 'price' ? parseFloat(value) || 0 : value;
    setMenuItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...menuItems];
    newItems.splice(index, 1);
    setMenuItems(newItems);
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleSaveMenu = async () => {
    // Validate items before saving
    for (let i = 0; i < menuItems.length; i++) {
      const item = menuItems[i];
      if (!item.name || item.name.trim() === '') {
        alert(`Item at position ${i + 1} is missing a name. Please provide a name or delete the item.`);
        return;
      }
      if (item.price === undefined || item.price === null || isNaN(item.price)) {
        alert(`Item '${item.name}' is missing a valid price.`);
        return;
      }
    }

    try {
      await api.put('/restaurants/my-restaurant/menu', { menu: menuItems });
      alert("Menu saved successfully!");
      setEditingIndex(null);
    } catch (error) {
      alert("Error saving menu: " + (error.response?.data?.message || error.message));
    }
  };

  const handleItemImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('itemImage', file);

    try {
      const { data } = await api.post('/restaurants/my-restaurant/menu/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Ensure backend URL is prefixed if absolute path is needed, or relative is fine
      const fullUrl = `http://localhost:5000${data.imageUrl}`;
      handleItemChange(index, 'image', fullUrl);
    } catch (error) {
      alert("Error uploading image");
    }
  };

  // --- STREAMING LOGIC ---
  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsStreaming(true);

      if (socket) {
        const roomId = `vendor-cam-${restaurant?._id || 'mock-id'}`;
        socket.emit('join-room', roomId);
        
        // Notify any waiting customers that the stream has started
        socket.emit('stream-started', roomId);
        
        socket.on('user-connected', (userId) => {
          setViewers(prev => prev + 1);
          initiatePeerConnection(userId, stream, roomId);
        });

        socket.on('answer', ({ answer, sender }) => {
          const pc = peerConnections.current[sender];
          if (pc) pc.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on('ice-candidate', ({ candidate, sender }) => {
          const pc = peerConnections.current[sender];
          if (pc) pc.addIceCandidate(new RTCIceCandidate(candidate));
        });
        
        socket.on('user-disconnected', (userId) => {
          if (peerConnections.current[userId]) {
            peerConnections.current[userId].close();
            delete peerConnections.current[userId];
            setViewers(prev => Math.max(0, prev - 1));
          }
        });
      }
    } catch (err) {
      alert("Could not access webcam.");
    }
  };

  const stopStream = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsStreaming(false);
    
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    setViewers(0);

    if (socket) {
      socket.emit('leave-room', `vendor-cam-${restaurant?._id || 'mock-id'}`);
      socket.off('user-connected');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-disconnected');
    }
  };

  const initiatePeerConnection = async (userId, stream, roomId) => {
    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    const pc = new RTCPeerConnection(configuration);
    
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { to: userId, candidate: event.candidate });
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    socket.emit('offer', { roomId, to: userId, offer });
    peerConnections.current[userId] = pc;
  };

  useEffect(() => {
    return () => {
      if (isStreaming) stopStream();
    };
  }, [isStreaming]);

  if (loading) return <div className="animate-pulse bg-gray-200 h-96 rounded-2xl"></div>;

  if (!restaurant) {
    return (
      <div className="pt-32 pb-20">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
            <Settings className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Your Restaurant</h1>
          <p className="text-gray-500">Set up your profile to start accepting orders.</p>
        </div>
        
        <form onSubmit={handleCreateRestaurant} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-orange-500" placeholder="E.g. Burger Bistro" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuisines (comma separated)</label>
            <input required type="text" value={formData.cuisine} onChange={e => setFormData({...formData, cuisine: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-orange-500" placeholder="E.g. American, Fast Food" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-orange-500" placeholder="123 Main St" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Photo</label>
            <div className="relative mt-1">
              <input type="file" id="coverPhotoUpload" accept="image/*" onChange={e => setCoverPhoto(e.target.files[0])} className="hidden" />
              <label htmlFor="coverPhotoUpload" className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors text-gray-500 hover:border-orange-300">
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="font-medium text-gray-700">{coverPhoto ? coverPhoto.name : 'Click to upload cover photo'}</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">This photo will be displayed at the top of your restaurant page.</p>
          </div>
          <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors">
            Create Restaurant
          </button>
        </form>
      </div>
      </div>
    );
  }

  // Dashboard for existing restaurant
  return (
    <div className="space-y-8 pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard: {restaurant.name}</h1>
          <p className="text-gray-500">Manage your operations, menu, and live kitchen stream.</p>
        </div>
        <button 
          onClick={isStreaming ? stopStream : startStream}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${
            isStreaming ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {isStreaming ? <><VideoOff className="w-5 h-5" /> Stop Live Stream</> : <><Video className="w-5 h-5" /> Start Live Stream</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Stream Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-500" /> Camera Feed Preview
            </h2>
            {isStreaming && (
              <div className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> LIVE NOW
              </div>
            )}
          </div>
          <div className="flex-1 bg-black relative flex items-center justify-center">
            <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${isStreaming ? 'block' : 'hidden'}`}></video>
            {!isStreaming && (
              <div className="text-center text-gray-500 flex flex-col items-center">
                <VideoOff className="w-16 h-16 mb-4 opacity-50" />
                <p>Camera is offline.</p>
              </div>
            )}
            {isStreaming && (
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-orange-400" />
                <span className="font-semibold">{viewers}</span> <span className="opacity-80">watching</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu Management Panel with Auto-Scan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[600px] lg:h-auto overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-gray-500" /> Menu Management
            </h2>
            <div className="flex items-center gap-2">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors"
              >
                {uploading ? <Activity className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Auto-Scan Photo
              </button>
              <button 
                onClick={() => {
                  setMenuItems([{ name: '', price: 0, description: '', image: '' }, ...menuItems]);
                  setEditingIndex(0);
                }} 
                className="text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            {menuItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p>No menu items found.</p>
                <p className="text-sm">Add items manually or use Auto-Scan.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {menuItems.map((item, idx) => {
                  const isEditing = editingIndex === idx;
                  return (
                    <div key={idx} className={`bg-white p-4 rounded-xl border ${isEditing ? 'border-orange-400 shadow-md' : 'border-gray-200 shadow-sm'} transition-all`}>
                      <div className="flex gap-4 items-start">
                        {/* Image Thumbnail / Upload */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200 relative group">
                          {item.image ? (
                            <img src={item.image} alt="Item" className="w-full h-full object-cover" />
                          ) : (
                            <Upload className="w-6 h-6 text-gray-400" />
                          )}
                          {isEditing && (
                            <label className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-xs font-semibold">
                              Upload
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleItemImageUpload(idx, e)} />
                            </label>
                          )}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="space-y-2">
                              <div className="flex gap-3">
                                <input 
                                  type="text" 
                                  value={item.name} 
                                  onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                  className="flex-1 font-semibold text-gray-900 outline-none placeholder-gray-400 border-b border-orange-300 focus:border-orange-500 pb-1 bg-transparent"
                                  placeholder="Item name"
                                  autoFocus
                                />
                                <div className="w-24 relative flex-shrink-0">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                  <input 
                                    type="number" 
                                    value={item.price} 
                                    onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1 pl-5 pr-2 outline-none focus:border-orange-500 font-medium"
                                  />
                                </div>
                              </div>
                              <textarea
                                value={item.description || ''}
                                onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none focus:border-orange-500 text-sm text-gray-700 resize-none h-16"
                                placeholder="Add a delicious description..."
                              />
                            </div>
                          ) : (
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-semibold text-gray-900 truncate" title={item.name}>{item.name}</h3>
                                <span className="font-bold text-gray-700">₹{parseFloat(item.price).toFixed(2)}</span>
                              </div>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {item.description || <span className="italic text-gray-400">No description provided</span>}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-col gap-2 flex-shrink-0 border-l border-gray-100 pl-3">
                          {isEditing ? (
                            <button onClick={() => setEditingIndex(null)} className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors shadow-sm" title="Save changes">
                              <Save className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => setEditingIndex(idx)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Edit item">
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleRemoveItem(idx)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Delete item">
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-white">
            <button onClick={handleSaveMenu} className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 flex items-center justify-center gap-2 transition-colors">
              <Save className="w-5 h-5" /> Save Menu
            </button>
          </div>
        </div>

      </div>

      {/* Active Orders Section */}
      <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-orange-500" /> Active Orders
          </h2>
          <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
            {orders.length} Total
          </div>
        </div>
        
        <div className="p-6">
          {orders.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No orders yet. Keep your kitchen stream live to attract customers!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order._id} className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow bg-gray-50/50 relative overflow-hidden">
                  {order.includeStream && (
                    <div className="absolute top-0 right-0 bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-bl-xl border-b border-l border-red-100 flex items-center gap-1">
                      <Video className="w-3 h-3" /> Live Stream Add-on
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">Order #{order._id.substring(0,8).toUpperCase()}</h3>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-md">{new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm text-gray-700 max-w-sm">
                            <span><span className="font-bold">{item.quantity}x</span> {item.name}</span>
                            <span className="font-medium text-gray-500">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200 max-w-sm">
                        <div className="flex justify-between items-center font-bold text-gray-900">
                          <span>Total</span>
                          <span>₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-64 flex flex-col gap-3 justify-center">
                      <label className="text-xs font-bold text-gray-500 uppercase">Update Status</label>
                      <div className="grid grid-cols-1 gap-2">
                        <button 
                          onClick={() => updateOrderStatus(order._id, 'preparing')}
                          className={`py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors ${order.orderStatus === 'preparing' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-500 hover:text-orange-600'}`}
                        >
                          <Clock className="w-4 h-4" /> Preparing
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(order._id, 'out_for_delivery')}
                          className={`py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors ${order.orderStatus === 'out_for_delivery' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600'}`}
                        >
                          <MapPin className="w-4 h-4" /> Out for Delivery
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(order._id, 'delivered')}
                          className={`py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors ${order.orderStatus === 'delivered' ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600'}`}
                        >
                          <CheckCircle2 className="w-4 h-4" /> Delivered
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
