const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Asset = require('../models/Asset');

dotenv.config({ path: __dirname + '/../.env' });
connectDB();

const assets = [
    // --- SHAPES ---
    { name: 'Round', type: 'Shape', priceModifier: 0, metadata: { multiplier: 1.0 } },
    { name: 'Square', type: 'Shape', priceModifier: 50, metadata: { multiplier: 1.2 } },
    { name: 'Heart', type: 'Shape', priceModifier: 100, metadata: { multiplier: 1.4 } },
    { name: 'Rectangle', type: 'Shape', priceModifier: 80, metadata: { multiplier: 1.3 } },

    // --- SIZES ---
    { name: '6 Inch', type: 'Size', priceModifier: 0, metadata: { value: 6 } },
    { name: '8 Inch', type: 'Size', priceModifier: 200, metadata: { value: 8 } },
    { name: '10 Inch', type: 'Size', priceModifier: 400, metadata: { value: 10 } },
    { name: '12 Inch', type: 'Size', priceModifier: 600, metadata: { value: 12 } },

    // --- FLAVORS ---
    { name: 'Vanilla', type: 'Flavor', priceModifier: 0, metadata: { color: '#F9E4B7' } },
    { name: 'Chocolate', type: 'Flavor', priceModifier: 50, metadata: { color: '#5D4037' } },
    { name: 'Red Velvet', type: 'Flavor', priceModifier: 80, metadata: { color: '#9E2A2B' } },
    { name: 'Ube', type: 'Flavor', priceModifier: 60, metadata: { color: '#6A1B9A' } },
    { name: 'Mocha', type: 'Flavor', priceModifier: 40, metadata: { color: '#8D6E63' } },
    { name: 'Strawberry', type: 'Flavor', priceModifier: 50, metadata: { color: '#FFB7C5' } },
    { name: 'Lemon', type: 'Flavor', priceModifier: 40, metadata: { color: '#FFFACD' } },

    // --- FROSTINGS ---
    { name: 'Vanilla', type: 'Frosting', priceModifier: 0, metadata: { color: '#FFFDD0' } },
    { name: 'Chocolate', type: 'Frosting', priceModifier: 30, metadata: { color: '#3E2723' } },
    { name: 'Cream Cheese', type: 'Frosting', priceModifier: 50, metadata: { color: '#F0F4C3' } },
    { name: 'Strawberry', type: 'Frosting', priceModifier: 40, metadata: { color: '#FFB7C5' } },
    { name: 'Matcha', type: 'Frosting', priceModifier: 60, metadata: { color: '#C1E1C1' } },
    { name: 'Caramel', type: 'Frosting', priceModifier: 40, metadata: { color: '#C68E17' } },

    // --- TEXTURES ---
    { name: 'Smooth', type: 'Texture', priceModifier: 0, thumbnailUrl: '/textures/smooth_thumb.png', metadata: { textureUrl: null } },
    { name: 'Ribbed', type: 'Texture', priceModifier: 50, thumbnailUrl: '/textures/ribbed_thumb.png', metadata: { textureUrl: '/textures/ribbed_normal.png' } },
    { name: 'Wavy', type: 'Texture', priceModifier: 70, thumbnailUrl: '/textures/wavy_thumb.png', metadata: { textureUrl: '/textures/wavy_normal.png' } },

    // --- DECORATIONS (Icing Tab - Borders) ---
    { name: 'Cream Dollops', type: 'Decoration', priceModifier: 20, metadata: { tab: 'icing', isCountable: false } },
    { name: 'Icing Swirls', type: 'Decoration', priceModifier: 25, metadata: { tab: 'icing', isCountable: false } },
    { name: 'Rosettes', type: 'Decoration', priceModifier: 30, metadata: { tab: 'icing', isCountable: false } },
    { name: 'Shell Border', type: 'Decoration', priceModifier: 25, metadata: { tab: 'icing', isCountable: false } },

    // --- DECORATIONS (Decor Tab - Countable Items) ---
    { name: 'Macarons', type: 'Decoration', priceModifier: 35, metadata: { tab: 'decor', isCountable: true } },
    { name: 'Cherries', type: 'Decoration', priceModifier: 15, metadata: { tab: 'decor', isCountable: true } },
    { name: 'Flowers', type: 'Decoration', priceModifier: 25, metadata: { tab: 'decor', isCountable: true } },
    { name: 'Candles', type: 'Decoration', priceModifier: 10, metadata: { tab: 'decor', isCountable: true } },
    { name: 'Strawberries', type: 'Decoration', priceModifier: 20, metadata: { tab: 'decor', isCountable: true } },
    { name: 'Chocolates', type: 'Decoration', priceModifier: 25, metadata: { tab: 'decor', isCountable: true } },

    // --- DECORATIONS (Decor Tab - Toggles/Scatter) ---
    { name: 'Sprinkles', type: 'Decoration', priceModifier: 20, metadata: { tab: 'decor', isCountable: false } },
    { name: 'Nuts', type: 'Decoration', priceModifier: 25, metadata: { tab: 'decor', isCountable: false } },
    { name: 'Cookies', type: 'Decoration', priceModifier: 20, metadata: { tab: 'decor', isCountable: false } },
    { name: 'Gold Flakes', type: 'Decoration', priceModifier: 50, metadata: { tab: 'decor', isCountable: false } },
    { name: 'Confetti', type: 'Decoration', priceModifier: 20, metadata: { tab: 'decor', isCountable: false } },

    // --- TOPPERS ---
    { name: 'Happy Birthday Sign', type: 'Topper', priceModifier: 150, metadata: { tab: 'decor', isCountable: false } },
    { name: 'Mr & Mrs Sign', type: 'Topper', priceModifier: 200, metadata: { tab: 'decor', isCountable: false } },
    { name: 'Number Topper', type: 'Topper', priceModifier: 80, metadata: { tab: 'decor', isCountable: true } },
    { name: 'Generic Star', type: 'Topper', priceModifier: 50, metadata: { tab: 'decor', isCountable: true } },

    // --- LAYER HEIGHTS ---
    { name: '3 Inch', type: 'LayerHeight', priceModifier: 0, metadata: { value: 3 } },
    { name: '4 Inch', type: 'LayerHeight', priceModifier: 50, metadata: { value: 4 } },
    { name: '5 Inch', type: 'LayerHeight', priceModifier: 100, metadata: { value: 5 } },
    { name: '6 Inch', type: 'LayerHeight', priceModifier: 150, metadata: { value: 6 } },
];

const seedAssets = async () => {
    try {
        console.log('Cleaning up database...');
        
        // 1. Drop the entire collection to remove old indexes (like the problematic name_1 unique index)
        try {
            await Asset.collection.drop();
            console.log('Asset collection dropped (clearing old indexes).');
        } catch (e) {
            if (e.code === 26) {
                console.log('Collection does not exist, skipping drop.');
            } else {
                throw e;
            }
        }

        // 2. Re-create indexes based on the current Schema (which has the compound index)
        await Asset.syncIndexes();
        console.log('Indexes synced.');

        // 3. Insert new assets
        console.log('Importing new assets...');
        await Asset.insertMany(assets);
        console.log('✅ Assets imported successfully!');

        process.exit();
    } catch (error) {
        console.error('❌ Error importing assets:', error);
        process.exit(1);
    }
};

seedAssets();
