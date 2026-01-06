# CREAKE - Cake AR Customizer and Marketplace

CREAKE is a full-stack web and mobile application that allows users to design and customize their own 3D cakes using Augmented Reality, and purchase them from a marketplace of bakers.

## Features

*   **User Authentication:** Secure user registration and login with JWT.
*   **3D Cake Customizer:** An interactive 3D cake builder using Three.js and React Three Fiber.
*   **Augmented Reality View:** View your custom cake in AR on supported mobile devices.
*   **Marketplace:** Browse cakes and bakers, view shop profiles, and make purchases.
*   **Order Management:** Users can track their orders, and sellers can manage their incoming orders.
*   **Seller Dashboard:** A dedicated dashboard for bakers to manage their products, orders, and shop settings.
*   **Admin Panel:** An admin dashboard to manage users, products, orders, and view reports.
*   **Real-time Chat:** Real-time messaging between buyers and sellers.
*   **Notifications:** In-app notifications for important events.
*   **Email Notifications:** Email notifications for events like registration and order confirmation.
*   **Secure Payments:** Integration with a payment gateway for secure transactions (Stripe/PayPal - specific integration to be confirmed).
*   **Image Uploads:** Cloudinary integration for handling image uploads for product and profile pictures.

## Tech Stack

### Frontend

*   **React:** A JavaScript library for building user interfaces.
*   **Vite:** A fast build tool for modern web projects.
*   **React Router:** For routing in the React application.
*   **Three.js, React Three Fiber, React Three XR:** For 3D rendering and AR functionality.
*   **Capacitor:** For building cross-platform mobile apps.
*   **Tailwind CSS:** A utility-first CSS framework for styling.
*   **Axios:** For making HTTP requests to the backend.
*   **date-fns, nanoid, recharts:** For date formatting, unique ID generation, and charts.

### Backend

*   **Node.js & Express:** For building the RESTful API.
*   **MongoDB & Mongoose:** As the database and ODM.
*   **JSON Web Tokens (JWT):** For user authentication.
*   **Bcrypt.js:** For password hashing.
*   **Cloudinary & Multer:** For image storage and handling file uploads.
*   **Nodemailer:** for sending emails.
*   **CORS, dotenv:** For handling Cross-Origin Resource Sharing and environment variables.

## Getting Started

### Prerequisites

*   Node.js and npm installed
*   MongoDB installed and running
*   A Cloudinary account for image uploads
*   An email service provider (e.g., Gmail) for sending emails

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/creake.git
    cd creake
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory and add the following environment variables:
    ```
    PORT=5001
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    EMAIL_HOST=your_email_host
    EMAIL_PORT=your_email_port
    EMAIL_USER=your_email_user
    EMAIL_PASS=your_email_password
    ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    ```
    Create a `.env` file in the `frontend` directory and add the following environment variable:
    ```
    VITE_API_URL=http://localhost:5001/api
    ```

### Running the Application

1.  **Start the backend server:**
    ```bash
    cd backend
    npm run dev
    ```

2.  **Start the frontend development server:**
    ```bash
    cd ../frontend
    npm run dev
    ```

The application will be available at `http://localhost:5173`.

## Available Scripts

### Backend

*   `npm start`: Starts the server in production mode.
*   `npm run dev`: Starts the server in development mode with nodemon.
*   `npm run cleanup:allproducts`: Deletes all products from the database.
*   `npm run make:admin`: Gives admin privileges to a user.
*   `npm run seed:assets`: Seeds the database with initial assets.

### Frontend

*   `npm run dev`: Starts the Vite development server.
*   `npm run build`: Builds the application for production.
*   `npm run preview`: Previews the production build locally.

## API Endpoints

The backend API provides the following endpoints:

*   `POST /api/auth/register` - Register a new user
*   `POST /api/auth/login` - Login a user
*   `GET /api/users` - Get all users (admin)
*   `GET /api/shop/:bakerId` - Get a baker's shop profile
*   `GET /api/products` - Get all products
*   `GET /api/products/:id` - Get a single product
*   `POST /api/orders` - Create a new order
*   `GET /api/orders/myorders` - Get orders for the logged-in user
*   `...and more`

## Folder Structure

```
.
├── backend
│   ├── config          # Database connection, etc.
│   ├── controllers     # Request handling logic
│   ├── middleware      # Custom middleware (auth, uploads)
│   ├── models          # Mongoose schemas
│   ├── routes          # API routes
│   └── server.js       # Main backend entry point
└── frontend
    ├── public          # Static assets
    ├── src
    │   ├── assets      # Images, fonts, etc.
    │   ├── components  # Reusable React components
    │   ├── context     # Auth and Cart context
    │   ├── pages       # Main page components
    │   ├── services    # API service
    │   └── App.jsx     # Main React app component
    └── capacitor.config.json # Capacitor configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is licensed under the ISC License.