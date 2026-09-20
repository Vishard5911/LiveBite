import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, Video, VideoOff, Users, Activity } from 'lucide-react';
import api from '../services/api';
import { SocketContext } from '../context/SocketContext';

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Streaming states
  const { socket } = useContext(SocketContext);
  const videoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting to kitchen...');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (order && order.includeStream && socket) {
      setupViewerStream();
    }
    
    // Join order status room
    if (order && socket) {
      socket.emit('join-room', `order-${order._id}`);
      
      const handleStatusUpdate = ({ orderId, status }) => {
        if (orderId === order._id) {
          setOrder(prev => ({ ...prev, orderStatus: status }));
        }
      };
      
      socket.on('order-status-updated', handleStatusUpdate);
      
      return () => {
        socket.emit('leave-room', `order-${order._id}`);
        socket.off('order-status-updated', handleStatusUpdate);
        
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
        }
        if (order.includeStream) {
          socket.emit('leave-room', `vendor-cam-${order.restaurant._id}`);
          socket.off('offer');
          socket.off('ice-candidate');
        }
      };
    }
  }, [order?._id, order?.includeStream, socket]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order", error);
    } finally {
      setLoading(false);
    }
  };

  const setupViewerStream = () => {
    const roomId = `vendor-cam-${order.restaurant._id}`;
    socket.emit('join-room', roomId);
    setConnectionStatus('Waiting for kitchen to go live...');

    // If the vendor starts the stream AFTER the customer has joined
    socket.on('stream-started', () => {
      setConnectionStatus('Kitchen went live! Connecting...');
      socket.emit('join-room', roomId); // Re-announce presence to trigger an offer
    });

    socket.on('offer', async ({ offer, sender }) => {
      setConnectionStatus('Receiving video feed...');
      const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      pc.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
          setIsStreamActive(true);
          setConnectionStatus('Live');
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', { to: sender, candidate: event.candidate });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      socket.emit('answer', { to: sender, answer });
    });

    socket.on('ice-candidate', ({ candidate }) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  };

  if (loading) return <div className="animate-pulse min-h-screen bg-gray-50 flex items-center justify-center">Loading order details...</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-24 pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-extrabold text-gray-900">Track Your Order</h1>
          <p className="text-gray-500 mt-1">Order #{order._id.substring(0, 8).toUpperCase()}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Stream Component - Premium Player UI */}
            {order.includeStream && (
              <div className="bg-black rounded-3xl overflow-hidden shadow-2xl relative border border-gray-800">
                <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-white font-bold text-sm">LIVE KITCHEN</span>
                  </div>
                  <span className="text-white/80 text-xs bg-black/40 px-2 py-1 rounded-md backdrop-blur">
                    {order.restaurant.name}
                  </span>
                </div>
                
                <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className={`w-full h-full object-cover ${isStreamActive ? 'opacity-100' : 'opacity-0'}`}
                  ></video>
                  
                  {!isStreamActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                      <Activity className="w-12 h-12 mb-4 animate-pulse opacity-50 text-brand-500" />
                      <p className="font-medium text-gray-400">{connectionStatus}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tracking Status */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-8">Order Status</h2>
              
              <div className="relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-3.5 before:w-0.5 before:bg-gray-100">
                
                <div className="relative z-10">
                  <div className="absolute -left-[35px] bg-brand-500 rounded-full p-1 border-4 border-white">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Order Confirmed</h3>
                    <p className="text-sm text-gray-500">Your order has been received by {order.restaurant.name}.</p>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className={`absolute -left-[35px] rounded-full p-1 border-4 border-white ${order.orderStatus === 'preparing' || order.orderStatus === 'out_for_delivery' || order.orderStatus === 'delivered' ? 'bg-brand-500' : 'bg-gray-200'}`}>
                    <Clock className={`w-5 h-5 ${order.orderStatus === 'preparing' || order.orderStatus === 'out_for_delivery' || order.orderStatus === 'delivered' ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${order.orderStatus === 'preparing' || order.orderStatus === 'out_for_delivery' || order.orderStatus === 'delivered' ? 'text-gray-900' : 'text-gray-400'}`}>Preparing Food</h3>
                    {order.includeStream && order.orderStatus === 'preparing' && (
                      <p className="text-sm text-brand-600 font-medium mt-1">Watch the chef prepare your meal above!</p>
                    )}
                  </div>
                </div>

                <div className="relative z-10">
                  <div className={`absolute -left-[35px] rounded-full p-1 border-4 border-white ${order.orderStatus === 'out_for_delivery' || order.orderStatus === 'delivered' ? 'bg-brand-500' : 'bg-gray-200'}`}>
                    <MapPin className={`w-5 h-5 ${order.orderStatus === 'out_for_delivery' || order.orderStatus === 'delivered' ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${order.orderStatus === 'out_for_delivery' || order.orderStatus === 'delivered' ? 'text-gray-900' : 'text-gray-400'}`}>Out for Delivery</h3>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className={`absolute -left-[35px] rounded-full p-1 border-4 border-white ${order.orderStatus === 'delivered' ? 'bg-green-500' : 'bg-gray-200'}`}>
                    <CheckCircle2 className={`w-5 h-5 ${order.orderStatus === 'delivered' ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${order.orderStatus === 'delivered' ? 'text-gray-900' : 'text-gray-400'}`}>Delivered</h3>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Receipt Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-28">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Receipt</h2>
              
              <div className="space-y-4 mb-6 border-b border-gray-100 pb-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600"><span className="font-medium text-gray-900">{item.quantity}x</span> {item.menuItem?.name || 'Item'}</span>
                    <span className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {order.includeStream && (
                <div className="flex justify-between text-sm mb-4 border-b border-gray-100 pb-4">
                  <span className="text-brand-600 font-medium flex items-center gap-1"><Video className="w-4 h-4" /> Live Stream</span>
                  <span className="font-bold text-brand-600">₹15.00</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Total Paid</span>
                <span className="font-extrabold text-xl text-gray-900">
                  ₹{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
