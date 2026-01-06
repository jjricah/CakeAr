// frontend/src/components/builder/useCakeConfig.js
import { useState, useMemo, useCallback, useEffect } from 'react';

const BASE_FEE = 300;
const LAYER_VOLUME_COST_FACTOR = 15; // Price per inch of diameter per inch of height
const MAX_HISTORY = 10; // Limits the undo depth

// --- DEFAULT STATE CONSTANT ---
const getDefaultConfig = (toppingsAssets = []) => {
    // Collect all topping names from the fetched assets
    const initialToppings = toppingsAssets.reduce((acc, asset) => {
        // Set initial quantity to 0 for countable, or false for toggles
        const isCountable = asset.metadata?.isCountable || false;
        
        // Rely solely on asset metadata. Any asset not explicitly marked countable defaults to boolean toggle (false).
        acc[asset.name] = isCountable ? 0 : false;

        return acc;
    }, {});
    
    return {
        shape: 'Round', 
        frostingCoverage: 'naked', 
        layers: [{ id: 1, flavor: 'Vanilla', width: 6, height: 4 }], 
        frosting: 'Vanilla', 
        texture: 'Smooth',
        toppings: initialToppings,
        // ✅ FIX: Default message text to '' (None)
        messageConfig: { 
          text: '',
          color: '#4A403A',
          position: 'top',
          font: 'sans-serif',
        }
    };
};


// Updated hook signature to accept assetOptions
export const useCakeConfig = (initialConfig, assetOptions = {}) => {
  const { shapes = [], flavors = [], toppings = [], textures = [], heights = [] } = assetOptions;
  
  // 1. Create lookup maps (unchanged)
  const { shapeMultipliers, flavorSurcharges, toppingCosts, textureCosts, heightSurcharges } = useMemo(() => {
      const shapeMultipliers = shapes.reduce((acc, a) => ({ ...acc, [a.name.toLowerCase()]: a.metadata?.multiplier || 1.0 }), {});
      const flavorSurcharges = flavors.reduce((acc, a) => ({ ...acc, [a.name.toLowerCase()]: a.priceModifier || 0 }), {});
      const toppingCosts = toppings.reduce((acc, a) => ({ ...acc, [a.name]: a.priceModifier || 0 }), {});
      // ✅ NEW: Add texture costs to the lookup
      const textureCosts = textures.reduce((acc, a) => ({ ...acc, [a.name]: a.priceModifier || 0 }), {});
      // ✅ NEW: Add height surcharges
      const heightSurcharges = heights.reduce((acc, a) => ({ ...acc, [a.metadata?.value]: a.priceModifier || 0 }), {});
      
      return { shapeMultipliers, flavorSurcharges, toppingCosts, textureCosts, heightSurcharges };
  }, [shapes, flavors, toppings, textures, heights]);


  // 2. State for Config History and Pointer
  // Memoized initial load config to prevent re-initialization unless assets change
  const initialLoadConfig = useMemo(() => {
      if (initialConfig) return initialConfig;
      return getDefaultConfig(assetOptions.toppings);
  }, [initialConfig, assetOptions.toppings]);
  
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Effect to initialize history
  useEffect(() => {
      if (history.length === 0 && initialLoadConfig) {
          setHistory([initialLoadConfig]);
          setHistoryIndex(0);
      }
  }, [initialLoadConfig, history.length]);
  
  const config = history[historyIndex] || initialLoadConfig;
  

  // --- Core State Updater (Pushes new state to history) ---
  const updateConfig = useCallback((newConfig) => {
      if (!newConfig) return;
      
      const newHistory = history.slice(0, historyIndex + 1); // Truncate redo history
      
      // Prevent saving if the new config is identical to the current one
      if (JSON.stringify(newConfig) === JSON.stringify(newHistory[newHistory.length - 1])) {
          return;
      }

      newHistory.push(newConfig);

      if (newHistory.length > MAX_HISTORY) {
          newHistory.shift(); // Remove oldest entry
      }

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  
  // --- Exposed Utility Functions ---

  const resetConfig = useCallback(() => {
      // Always reset to index 0 and clear history (or set a fresh default as the only item)
      const freshConfig = getDefaultConfig(assetOptions.toppings);
      setHistory([freshConfig]);
      setHistoryIndex(0);
  }, [assetOptions.toppings]);
  
  const undo = useCallback(() => {
      setHistoryIndex(prev => Math.max(0, prev - 1));
  }, []);
  
  const redo = useCallback(() => {
      setHistoryIndex(prev => Math.min(history.length - 1, prev + 1));
  }, [history.length]);


  // 3. Memoized Price Calculation (unchanged logic)
  const price = useMemo(() => {
    // Only run if necessary asset data has been fetched (now includes heights)
    if (assetOptions.loading || !shapes.length || !flavors.length) {
         return BASE_FEE;
    }
    
    // --- CALCULATION LOGIC ---
    let newPrice = BASE_FEE;

    // 1. Calculate Layers (Size + Shape + Flavor)
    config.layers.forEach(layer => {
      // ✅ FIX: Price now based on volume (width * height)
      let layerCost = (layer.width || 6) * (layer.height || 4) * LAYER_VOLUME_COST_FACTOR;
      
      const currentShape = config.shape || 'Round';
      const shapeMult = shapeMultipliers[currentShape.toLowerCase()] || 1.0;
      layerCost *= shapeMult;

      const currentFlavor = layer.flavor || 'Vanilla';
      const flavorCost = flavorSurcharges[currentFlavor.toLowerCase()] || 0;
      
      newPrice += (layerCost + flavorCost);

      // ✅ NEW: Add height surcharge for each layer
      const heightCost = heightSurcharges[layer.height] || 0;
      newPrice += heightCost;
    });

    // 2. Calculate Toppings
    // ✅ FIX: Relies entirely on dynamic toppingCosts lookup for scattered toppings too (Cookies, Nuts, Sprinkles)
    if(config.toppings) {
        Object.keys(config.toppings).forEach(key => {
            const value = config.toppings[key];
            const costPerUnit = toppingCosts[key] || 0; 
            
            if (typeof value === 'boolean' && value === true) {
                newPrice += costPerUnit; 
            } else if (typeof value === 'number' && value > 0) {
                newPrice += (costPerUnit * value);
            }
        });
    }

    // 3. Optional: Add a flat fee for customized message (UX/Pricing Decision)
    if (config.messageConfig.text.trim().length > 0) {
        newPrice += 50; // Flat Fee for custom message
    }

    // 4. ✅ NEW: Add Texture Cost
    if (config.texture && toppingCosts[config.texture]) {
        newPrice += toppingCosts[config.texture];
    }

    return Math.ceil(newPrice);
    
  // Depend only on config and the derived cost maps
  // ✅ FIX: Add textures, heights, and their cost maps to dependency array
  }, [config, assetOptions.loading, shapes, flavors, textures, shapeMultipliers, flavorSurcharges, toppingCosts, textureCosts, heightSurcharges]);


  // 4. Asset Synchronization Logic (updated to use updateConfig)
  useEffect(() => {
    if (assetOptions.loading || !config) return; 

    const currentToppingNames = new Set(Object.keys(config.toppings));
    const assetToppingNames = new Set(assetOptions.toppings.map(a => a.name));
    
    const hasNewToppings = [...assetToppingNames].some(name => !currentToppingNames.has(name));

    // Simple check: if the number of managed toppings changes, resync
    if (hasNewToppings || currentToppingNames.size !== assetToppingNames.size) {
        const newInitialToppings = getDefaultConfig(assetOptions.toppings).toppings;
        
        const syncedToppings = Object.keys(newInitialToppings).reduce((acc, name) => {
            // Keep the user's existing value if it exists, otherwise use the new default (false or 0)
            acc[name] = config.toppings[name] !== undefined ? config.toppings[name] : newInitialToppings[name];
            return acc;
        }, {});

        updateConfig({
            ...config,
            toppings: syncedToppings
        });
    }
  }, [assetOptions.loading, assetOptions.toppings, config, updateConfig]);

  // Expose functions for usage
  return { 
      config, 
      setConfig: updateConfig, 
      price, 
      resetConfig, 
      undo, 
      redo,
      canUndo: historyIndex > 0,
      canRedo: historyIndex < history.length - 1
  };
};