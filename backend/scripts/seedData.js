const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const Product = require('../models/Product');

dotenv.config();

const categories = [
  {
    name: 'Birthday Cakes',
    slug: 'birthday-cakes',
    description: 'Celebrate special birthdays with our delicious custom cakes',
    image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=500',
    isActive: true
  },
  {
    name: 'Wedding Cakes',
    slug: 'wedding-cakes',
    description: 'Elegant multi-tier cakes for your special day',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500',
    isActive: true
  },
  {
    name: 'Custom Cakes',
    slug: 'custom-cakes',
    description: 'Design your own unique cake with AR customization',
    image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=500',
    isActive: true
  },
  {
    name: 'Cup Cakes',
    slug: 'cupcakes',
    description: 'Miniature delights perfect for any occasion',
    image: 'https://images.unsplash.com/photo-1426869981800-95ebf51ce900?w=500',
    isActive: true
  }
];

const products = [
  {
    name: 'Classic Chocolate Birthday Cake',
    slug: 'classic-chocolate-birthday-cake',
    description: 'Rich chocolate cake with smooth chocolate ganache frosting. Perfect for chocolate lovers!',
    price: 1299.99,
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500'
    ],
    categorySlug: 'birthday-cakes',
    stock: 25,
    sizes: ['6-inch', '8-inch', '10-inch'],
    flavors: ['Chocolate', 'Dark Chocolate', 'Milk Chocolate'],
    rating: 4.8,
    numReviews: 127,
    isCustomizable: true,
    customizationOptions: {
      toppings: ['Sprinkles', 'Chocolate Chips', 'Fresh Berries'],
      fillings: ['Chocolate Mousse', 'Chocolate Cream', 'Caramel']
    }
  },
  {
    name: 'Vanilla Dream Wedding Cake',
    slug: 'vanilla-dream-wedding-cake',
    description: 'Three-tier elegant vanilla cake with buttercream frosting and floral decorations',
    price: 8999.99,
    images: [
      'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=500',
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500'
    ],
    categorySlug: 'wedding-cakes',
    stock: 5,
    sizes: ['3-tier', '4-tier', '5-tier'],
    flavors: ['Vanilla', 'French Vanilla', 'Vanilla Bean'],
    rating: 5.0,
    numReviews: 89,
    isCustomizable: true,
    customizationOptions: {
      toppings: ['Fresh Flowers', 'Sugar Flowers', 'Pearl Decorations'],
      fillings: ['Vanilla Cream', 'Raspberry', 'Lemon Curd']
    }
  },
  {
    name: 'Red Velvet Supreme',
    slug: 'red-velvet-supreme',
    description: 'Moist red velvet cake with cream cheese frosting',
    price: 1499.99,
    images: [
      'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500'
    ],
    categorySlug: 'birthday-cakes',
    stock: 18,
    sizes: ['6-inch', '8-inch', '10-inch'],
    flavors: ['Red Velvet', 'Red Velvet with Cocoa'],
    rating: 4.9,
    numReviews: 203,
    isCustomizable: true,
    customizationOptions: {
      toppings: ['Cream Cheese Swirls', 'White Chocolate Shavings'],
      fillings: ['Cream Cheese', 'White Chocolate Cream']
    }
  },
  {
    name: 'Rainbow Delight',
    slug: 'rainbow-delight',
    description: 'Colorful layered cake that brings joy to any celebration',
    price: 1399.99,
    images: [
      'https://images.unsplash.com/photo-1562440499-64c9a74f0615?w=500'
    ],
    categorySlug: 'birthday-cakes',
    stock: 22,
    sizes: ['6-inch', '8-inch', '10-inch'],
    flavors: ['Vanilla Rainbow', 'Strawberry Rainbow'],
    rating: 4.7,
    numReviews: 156,
    isCustomizable: true,
    customizationOptions: {
      toppings: ['Rainbow Sprinkles', 'Edible Glitter', 'Candy Stars'],
      fillings: ['Vanilla Cream', 'Strawberry', 'Mixed Berry']
    }
  },
  {
    name: 'Strawberry Shortcake',
    slug: 'strawberry-shortcake',
    description: 'Light and fluffy cake with fresh strawberries and whipped cream',
    price: 1199.99,
    images: [
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500'
    ],
    categorySlug: 'birthday-cakes',
    stock: 30,
    sizes: ['6-inch', '8-inch'],
    flavors: ['Strawberry', 'Strawberry Vanilla'],
    rating: 4.6,
    numReviews: 98,
    isCustomizable: false
  },
  {
    name: 'Elegant Rose Gold Wedding Cake',
    slug: 'elegant-rose-gold-wedding-cake',
    description: 'Stunning 4-tier cake with rose gold accents and handcrafted sugar flowers',
    price: 9999.99,
    images: [
      'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=500'
    ],
    categorySlug: 'wedding-cakes',
    stock: 3,
    sizes: ['4-tier', '5-tier'],
    flavors: ['Champagne', 'Vanilla', 'Almond'],
    rating: 5.0,
    numReviews: 45,
    isCustomizable: true,
    customizationOptions: {
      toppings: ['Sugar Flowers', 'Gold Leaf', 'Pearl Decorations'],
      fillings: ['Champagne Cream', 'Raspberry', 'Lemon']
    }
  },
  {
    name: 'Custom AR Design Cake',
    slug: 'custom-ar-design-cake',
    description: 'Design your own cake using our AR builder. Choose everything from size to toppings!',
    price: 1899.99,
    images: [
      'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=500'
    ],
    categorySlug: 'custom-cakes',
    stock: 50,
    sizes: ['6-inch', '8-inch', '10-inch', '12-inch'],
    flavors: ['Chocolate', 'Vanilla', 'Red Velvet', 'Strawberry', 'Lemon', 'Caramel'],
    rating: 4.9,
    numReviews: 312,
    isCustomizable: true,
    customizationOptions: {
      toppings: ['Sprinkles', 'Fresh Fruit', 'Chocolate Chips', 'Nuts', 'Candy', 'Edible Flowers'],
      fillings: ['Buttercream', 'Chocolate Mousse', 'Fruit Jam', 'Caramel', 'Cream Cheese', 'Whipped Cream']
    }
  },
  {
    name: 'Chocolate Cupcake Box (12)',
    slug: 'chocolate-cupcake-box-12',
    description: 'Box of 12 decadent chocolate cupcakes with various toppings',
    price: 699.99,
    images: [
      'https://images.unsplash.com/photo-1426869981800-95ebf51ce900?w=500'
    ],
    categorySlug: 'cupcakes',
    stock: 40,
    sizes: ['Box of 12', 'Box of 24'],
    flavors: ['Chocolate', 'Double Chocolate', 'Chocolate Mint'],
    rating: 4.7,
    numReviews: 178,
    isCustomizable: false
  },
  {
    name: 'Vanilla Cupcake Assortment (24)',
    slug: 'vanilla-cupcake-assortment-24',
    description: 'Assorted vanilla cupcakes with different frostings and decorations',
    price: 1199.99,
    images: [
      'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=500'
    ],
    categorySlug: 'cupcakes',
    stock: 35,
    sizes: ['Box of 12', 'Box of 24'],
    flavors: ['Vanilla', 'French Vanilla', 'Vanilla Bean'],
    rating: 4.8,
    numReviews: 142,
    isCustomizable: false
  },
  {
    name: 'Black Forest Cake',
    slug: 'black-forest-cake',
    description: 'Traditional German cake with chocolate, cherries, and whipped cream',
    price: 1599.99,
    images: [
      'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500'
    ],
    categorySlug: 'birthday-cakes',
    stock: 15,
    sizes: ['8-inch', '10-inch'],
    flavors: ['Black Forest', 'Cherry Chocolate'],
    rating: 4.8,
    numReviews: 167,
    isCustomizable: true,
    customizationOptions: {
      toppings: ['Fresh Cherries', 'Chocolate Shavings', 'Whipped Cream'],
      fillings: ['Cherry Cream', 'Chocolate Cream']
    }
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✓ Created ${createdCategories.length} categories`);

    // Map category slugs to IDs
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    // Update products with category IDs
    const productsWithCategories = products.map(product => {
      // Remove sizes and categorySlug, add size
      const { sizes, categorySlug, ...productData } = product;
      return {
        ...productData,
        size: sizes ? (sizes.includes('8-inch') ? 'medium' : 'custom') : 'medium',
        category: categoryMap[categorySlug]
      };
    });

    // Insert products
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`✓ Created ${createdProducts.length} products`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nCategories:');
    createdCategories.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));
    console.log('\nSample Products:');
    createdProducts.slice(0, 5).forEach(prod => console.log(`  - ${prod.name} - $${prod.price}`));

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
