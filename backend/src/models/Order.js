import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  liveCamAddon: { type: Boolean, default: false },
  liveCamFee: { type: Number, default: 15 },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'completed' }, // Default to completed for demo
  orderStatus: { type: String, enum: ['placed', 'preparing', 'out_for_delivery', 'delivered'], default: 'placed' },
  streamAccessToken: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
