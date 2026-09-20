import Restaurant from '../models/Restaurant.js';
import Tesseract from 'tesseract.js';

export const createRestaurant = async (req, res) => {
  try {
    const { name, cuisine, address } = req.body;
    const existing = await Restaurant.findOne({ owner: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You already have a restaurant.' });
    }
    
    let coverImage = '';
    if (req.file) {
      coverImage = `/uploads/${req.file.filename}`;
    }

    const restaurant = new Restaurant({
      owner: req.user._id,
      name,
      cuisine: typeof cuisine === 'string' ? cuisine.split(',').map(c => c.trim()) : cuisine,
      address,
      coverImage
    });
    const created = await restaurant.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMenu = async (req, res) => {
  try {
    const { menu } = req.body;
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (restaurant) {
      restaurant.menu = menu;
      await restaurant.save();
      res.json(restaurant.menu);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const scanMenu = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    // Run OCR on the image buffer
    const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng');
    
    // Basic regex to find item names and prices (e.g. "Burger 12.99" or "Burger $12.99")
    // This is a naive implementation for demo purposes
    const lines = text.split('\n');
    const scannedItems = [];
    
    // Advanced regex to capture currency symbols and valid price formats (e.g., $12.99, ₹150)
    // Limits digits to avoid matching massive numbers.
    const priceRegex = /([$€£₹]?)\s*(\d{1,4}(?:\.\d{2})?)(?!\d|-)/;
    
    lines.forEach(line => {
      // 1. Skip lines that look like phone numbers (7+ consecutive digits ignoring spaces/dashes)
      if (/\d{7,15}/.test(line.replace(/[\s-]/g, ''))) {
        return; 
      }

      const match = line.match(priceRegex);
      if (match) {
        const currencySymbol = match[1];
        const price = parseFloat(match[2]);
        
        // 2. Clean the item name aggressively
        let name = line.replace(match[0], ''); // Remove the price text
        name = name.replace(/[^a-zA-Z\s&'-]/g, ' '); // Strip ALL numbers and weird chars from name
        
        // Repeatedly remove ANY trailing 1-2 letter words (uppercase or lowercase)
        while (/\s+[a-zA-Z]{1,2}\s*$/.test(name)) {
          name = name.replace(/\s+[a-zA-Z]{1,2}\s*$/, '');
        }
        
        // Remove standalone 1-2 letter uppercase words in the middle (likely OCR codes like 'SN', 'L')
        name = name.replace(/\b[A-Z]{1,2}\b/g, ' ');
        
        // Collapse multiple spaces and trim
        name = name.replace(/\s{2,}/g, ' ').trim();

        // 3. Validate logical bounds
        if (name.length > 2 && price > 0 && price < 10000) {
          scannedItems.push({
            name: name,
            price: price,
            currency: currencySymbol || '$',
            description: 'Scanned from menu',
            image: ''
          });
        }
      }
    });
    
    res.json({ text, scannedItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isActive: true });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCameraStatus = async (req, res) => {
  try {
    const { status } = req.body;
    // In a real app, verify that req.user is the owner of this restaurant
    const restaurant = await Restaurant.findById(req.params.id);
    if (restaurant) {
      restaurant.cameraStatus = status;
      await restaurant.save();
      res.json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addRestaurantReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);

    if (restaurant) {
      const alreadyReviewed = restaurant.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Restaurant already reviewed by this user' });
      }

      const review = {
        user: req.user._id,
        userName: req.user.name || 'Anonymous',
        rating: Number(rating),
        comment
      };

      restaurant.reviews.push(review);
      restaurant.numReviews = restaurant.reviews.length;
      restaurant.rating = restaurant.reviews.reduce((acc, item) => item.rating + acc, 0) / restaurant.reviews.length;

      await restaurant.save();
      res.status(201).json({ message: 'Review added successfully' });
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
