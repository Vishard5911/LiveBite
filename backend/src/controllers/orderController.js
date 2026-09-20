import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import crypto from 'crypto';

export const createOrder = async (req, res) => {
  const { restaurant, items, subtotal, liveCamAddon, liveCamFee } = req.body;

  try {
    const totalAmount = subtotal + (liveCamAddon ? liveCamFee : 0);
    
    // Generate a secure token if addon is purchased
    const streamAccessToken = liveCamAddon ? crypto.randomBytes(32).toString('hex') : null;

    const order = new Order({
      customer: req.user._id, // Assume populated from protect middleware
      restaurant,
      items,
      subtotal,
      liveCamAddon,
      liveCamFee,
      totalAmount,
      streamAccessToken
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('restaurant', 'name address cameraStatus');
    
    if (order) {
      // Ensure only the owner or vendor/admin can view it (omitted for brevity)
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unlockStream = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      if (order.liveCamAddon) {
        return res.status(400).json({ message: 'Stream already unlocked' });
      }
      order.liveCamAddon = true;
      order.totalAmount += order.liveCamFee;
      order.streamAccessToken = crypto.randomBytes(32).toString('hex');
      
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStreamToken = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      if (order.liveCamAddon && order.paymentStatus === 'completed') {
        res.json({ streamAccessToken: order.streamAccessToken });
      } else {
        res.status(403).json({ message: 'Not authorized to view stream. Please unlock first.' });
      }
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVendorOrders = async (req, res) => {
  try {
    // Find restaurants owned by this vendor
    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map(r => r._id);

    // Fetch orders for these restaurants
    const orders = await Order.find({ restaurant: { $in: restaurantIds } })
      .populate('restaurant', 'name')
      .populate('customer', 'name email')
      .sort('-createdAt');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'preparing', 'out_for_delivery', 'delivered'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify vendor owns the restaurant
    const restaurant = await Restaurant.findById(order.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.orderStatus = status;
    const updatedOrder = await order.save();

    // Emit socket event to the order room
    const io = req.app.get('io');
    if (io) {
      io.to(`order-${order._id}`).emit('order-status-updated', { orderId: order._id, status });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
