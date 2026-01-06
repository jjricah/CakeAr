const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

//Increase the payload limit for image Data URLs ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Middleware
app.use(cors({
  origin: true, 
  credentials: true
}));


// --- ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/shop', require('./routes/shopRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/designs', require('./routes/designRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));
app.use('/api/payouts', require('./routes/payoutRoutes'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to CREAKE API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});