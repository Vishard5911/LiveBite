import express from 'express';
import multer from 'multer';
import { getRestaurants, getRestaurantById, updateCameraStatus, createRestaurant, getMyRestaurant, updateMenu, scanMenu, addRestaurantReview } from '../controllers/restaurantController.js';
import { protect, vendor } from '../middlewares/authMiddleware.js';

const router = express.Router();
const scanUpload = multer({ storage: multer.memoryStorage() });

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});
const diskUpload = multer({ storage: diskStorage });

// Vendor Routes
router.route('/my-restaurant').post(protect, vendor, diskUpload.single('coverImage'), createRestaurant);
router.route('/my-restaurant').get(protect, vendor, getMyRestaurant);
router.route('/my-restaurant/menu').put(protect, vendor, updateMenu);
router.route('/my-restaurant/scan-menu').post(protect, vendor, scanUpload.single('menuImage'), scanMenu);
router.route('/my-restaurant/menu/upload-image').post(protect, vendor, diskUpload.single('itemImage'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// Public Routes
router.route('/').get(getRestaurants);
router.route('/:id').get(getRestaurantById);
router.route('/:id/reviews').post(protect, addRestaurantReview);

// Stream specific route
router.route('/:id/camera').put(protect, vendor, updateCameraStatus);

export default router;
