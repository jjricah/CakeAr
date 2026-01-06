// backend/config/priceCalculator.js
// Removed hardcoded PRICING_RULES object entirely, except for fixed non-configurable values
const BASE_FEE = 300;
const LAYER_DIAMETER_COST = 60;
const DELIVERY_FEE = 50;

const PRICING_RULES_STATIC = {
  BASE_FEE,
  LAYER_DIAMETER_COST,
  DELIVERY_FEE
};

/**
 * Creates lookup tables from an array of Asset documents.
 */
const createAssetLookups = (assets) => {
  const lookups = {
    shapeMultipliers: {}, // Key: shape name, Value: multiplier (from metadata.multiplier)
    flavorSurcharges: {}, // Key: flavor name, Value: priceModifier
    toppingCosts: {},     // Key: topping name, Value: priceModifier
    textureCosts: {},     // Key: texture name, Value: priceModifier
    heightSurcharges: {}  // Key: height value (string), Value: priceModifier
  };

  assets.forEach(asset => {
    if (asset.isAvailable) {
      const nameLower = asset.name.toLowerCase();
      if (asset.type === 'Shape') {
        lookups.shapeMultipliers[nameLower] = asset.metadata?.multiplier || 1.0;
      } else if (asset.type === 'Flavor') {
        lookups.flavorSurcharges[nameLower] = asset.priceModifier || 0;
      } else if (['Topper', 'Decoration'].includes(asset.type)) {
        // Toppings are keyed by their exact name for easy config lookup
        lookups.toppingCosts[asset.name] = asset.priceModifier || 0;
      } else if (asset.type === 'Texture') {
        lookups.textureCosts[nameLower] = asset.priceModifier || 0;
      } else if (asset.type === 'LayerHeight') {
        // Key by the numeric value stored in metadata
        if (asset.metadata && asset.metadata.value) {
            lookups.heightSurcharges[String(asset.metadata.value)] = asset.priceModifier || 0;
        }
      }
    }
  });

  return lookups;
};

/**
 * Calculates the price of a custom item config using fetched asset data.
 * NOTE: This function must fetch all assets before running if it's used standalone.
 * For now, OrderController must be updated to pass the asset list.
 */
const calculateItemPrice = (item, assets) => {

  // 1. If not a custom build, trust the provided price (for simplicity in a prototype)
  if (item.type === 'standard' || !item.customConfig || !assets) {
    return item.price;
  }

  const { shapeMultipliers, flavorSurcharges, toppingCosts, textureCosts, heightSurcharges } = createAssetLookups(assets);
  const config = item.customConfig;
  let price = BASE_FEE;

  // A. Calculate Layers
  if (config.layers && Array.isArray(config.layers)) {
    config.layers.forEach(layer => {
      let layerCost = layer.width * LAYER_DIAMETER_COST;

      // Dynamic Shape Multiplier Lookup (using initial config values)
      const currentShape = config.shape || 'Round';
      const shapeMult = shapeMultipliers[currentShape.toLowerCase()] || 1.0;
      layerCost *= shapeMult;

      // Dynamic Flavor Surcharge Lookup
      const currentFlavor = layer.flavor;
      const flavorCost = flavorSurcharges[currentFlavor.toLowerCase()] || 0;

      // Dynamic Height Surcharge
      const heightKey = String(layer.height || 4);
      const heightCost = heightSurcharges[heightKey] || 0;

      price += layerCost + flavorCost + heightCost;
    });
  }

  // B. Calculate Toppings
  if (config.toppings) {
    Object.keys(config.toppings).forEach(key => {
      const value = config.toppings[key];
      const toppingKey = key.toLowerCase();
      const costPerUnit = toppingCosts[key] || 0;

      if (typeof value === 'boolean' && value === true) {
        price += costPerUnit;
      } else if (typeof value === 'number' && value > 0) {
        price += (costPerUnit * value);
      }
    });
  }

  // C. Calculate Texture
  if (config.texture) {
      price += (textureCosts[config.texture.toLowerCase()] || 0);
  }

  return Math.ceil(price);
};

module.exports = { calculateItemPrice, PRICING_RULES: PRICING_RULES_STATIC, createAssetLookups };