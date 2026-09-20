import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String }
});

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

const restaurantSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  cuisine: [{ type: String }],
  address: { type: String },
  coverImage: { type: String },
  isActive: { type: Boolean, default: true },
  cameraStatus: { type: String, enum: ['offline', 'live'], default: 'offline' },
  cameraHardwareType: { type: String, enum: ['head_cam', 'fixed_cam', 'webcam_test'], default: 'webcam_test' },
  menu: [menuItemSchema],
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Restaurant', restaurantSchema);
