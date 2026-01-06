# 🎂 Cake AR - E-commerce Platform with AR Cake Builder

A full-stack MERN e-commerce platform for custom cake ordering with AR 3D visualization, built with React, Node.js, Express, MongoDB, and Three.js.

## ✨ Features

### Customer Features
- 🛍️ **Product Catalog** - Browse cakes by category with search and filters
- 🎂 **AR Cake Builder** - Design custom cakes in 3D using Three.js
- 🛒 **Shopping Cart** - Add items, manage quantities with localStorage persistence
- 💳 **Checkout System** - Complete order placement with shipping details
- 📦 **Order Tracking** - Track orders with detailed status timeline
- 🔐 **Authentication** - Secure JWT-based login/registration

### Admin Features
- 📊 **Dashboard** - Real-time statistics, revenue charts, recent orders
- 📦 **Order Management** - View all orders, update status, manage deliveries
- 🎂 **Product Management** - Full CRUD operations for products
- 📁 **Category Management** - Create and manage product categories
- 👥 **Customer Management** - View customer list with order history
- 🔒 **Role-based Access** - Admin-only routes with authentication

### Technical Features
- 💰 **Philippine Peso (₱)** currency with 12% VAT
- 📱 Responsive design with Tailwind CSS
- 🎨 3D cake visualization with Three.js/React Three Fiber
- 🔄 Real-time stock management
- 📈 Sales analytics and reporting
- 🚀 RESTful API architecture

## Project Structure

```
CAREAR/
├── backend/                 # Node.js + Express API
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware (auth)
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── scripts/            # Database seeding scripts
│   ├── .env                # Environment variables
│   ├── package.json
│   └── server.js           # Entry point
│
├── frontend/               # React + Vite Web App
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (Auth, Cart)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── CakeAR/                 # React Native Mobile App
    ├── android/            # Android native code
    ├── ios/                # iOS native code
    ├── src/
    │   ├── assets/         # Fonts, icons, images
    │   ├── components/     # Reusable components
    │   ├── navigation/     # Navigation configuration
    │   ├── screens/        # Screen components
    │   ├── services/       # API services
    │   ├── styles/         # Styles and theme
    │   ├── types/          # TypeScript types
    │   └── utils/          # Utility functions
    ├── App.tsx             # App entry point
    ├── package.json
    └── tsconfig.json
```

## Features
Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local or MongoDB Atlas cloud instance)
- **npm** or **yarn** package manager
- **Android Studio** (for Android development)
- **JDK 17** (for React Native Android builds)

### 1. Backend Setup

1. **Navigate to the backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**

The `.env` file is already configured with MongoDB connection:
```env
PORT=5001
MONGO_URI=mongodb+srv://larksolutionstech:21void@larkchive.aaxfp3a.mongodb.net/Cakear
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
NODE_ENV=development
```

4. **Create admin user (optional):**
```bash
node scripts/createAdmin.js
```

5. **Seed database with sample data (optional):**
```bash
node scripts/seedData.js
```

6. **Start the backend server:**
```bash
npm run dev
```

✅ Backend will run on `http://localhost:5001`

---

### 2. Frontend Web App Setup

1. **Navigate to the frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

✅ Frontend will run on `http://localhost:3000`

---

### 3. CakeAR Mobile App Setup

#### Prerequisites for React Native
- Install **Watchman** (macOS): `brew install watchman`
- Install **Android Studio** with Android SDK
- Configure environment variables:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/tools
  export PATH=$PATH:$ANDROID_HOME/tools/bin
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```

#### Installation Steps

1. **Navigate to the CakeAR directory:**
```bash
cd CakeAR
```

2. **Install dependencies:**
```bash
yarn install
```

3. **Link custom fonts and assets:**
```bash
npx react-native-asset
```

#### Running on Android

1. **Start an Android emulator** or connect a physical device

2. **Run the app:**
```bash
yarn android
```

Or manually:
```bash
# Clean build (if needed)
cd android && ./gradlew clean && cd ..

# Build and run
npx react-native run-android
```

✅ Android app will launch on emulator/device

#### Troubleshooting Android

**Metro bundler issues:**
```bash
yarn start --reset-cache
```

**Android build errors:**
```bash
cd android
./gradlew clean
cd ..
yarn android
```

**Clear all caches:**
```bash
watchman watch-del-all
rm -rf node_modules
rm -rf $TMPDIR/react-*
yarn install
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Orders
- `POST /api/orders` - Create new order (protected)
- `GET /api/orders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get single order (protected)
- `GET /api/orders/admin/all` - Get all orders (admin)
- `PUT /api/orders/:id/status` - Update order status (admin)

### Cakes (Custom Designs)
- `POST /api/cakes` - Create a new cake design (protected)
- `GET /api/cakes` - Get all user's cakes (protected)
- `GET /api/cakes/:id` - Get single cake (protected)
- `PUT /api/cakes/:id` - Update cake design (protected)
- `DELETE /api/cakes/:id` - Delete cake (protected)

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Get dashboard stats (admin)
- `GET /api/admin/orders` - Get all orders (admin)
- `GET /api/admin/customers` - Get all customers (admin)

## Available Scripts

### Backend
- `npm start` - Run the server in production mode
- `npm run dev` - Run the server in development mode with nodemon
- `node scripts/createAdmin.js` - Create admin user
- `node scripts/seedData.js` - Seed sample data

### Frontend (Web)
- `npm run dev` - Start the Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Mobile App (CakeAR)
- `yarn start` - Start Metro bundler
- `yarn android` - Run on Android emulator/device
- `yarn start --reset-cache` - Reset Metro cache
- `npx react-native-asset` - Link custom fonts/assets

## Technology Stack

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database (MongoDB Atlas)
- **Mongoose** - ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend (Web)
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Three.js** - 3D graphics
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for React Three Fiber

### Mobile App (CakeAR)
- **React Native 0.83** - Mobile framework
- **TypeScript** - Type safety
- **React Navigation** - Navigation library
  - Native Stack Navigator
  - Bottom Tabs Navigator
- **react-native-vector-icons** - Material Icons
- **react-native-safe-area-context** - Safe area handling
- **Axios** - HTTP client
- **AsyncStorage** - Local storage
- **@viro-community/react-viro** - AR functionality (configured)

### Development Tools
- **Nodemon** - Auto-restart server
- **ESLint** - Code linting
- **Watchman** - File watching (React Native)
- **Metro** - React Native bundler

## License

ISC
