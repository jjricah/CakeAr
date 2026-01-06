// frontend/src/components/builder/CakeModel.jsx (New Location)

import { useRef, useMemo } from 'react';
import { useTexture, Instances, Instance } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { 
    FrostingMaterial, GlazeMaterial, 
    TOPPING_COMPONENTS_MAP, CakeText
} from './ToppingElements'; 

// --- PROCEDURAL TEXTURE GENERATOR ---
const generateNormalMap = (type) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Fill neutral normal blue
    ctx.fillStyle = '#8080FF';
    ctx.fillRect(0, 0, 512, 512);

    if (type === 'Ribbed') {
        for (let i = 0; i < 512; i += 20) {
            // Create gradients to simulate ribs
            const grd = ctx.createLinearGradient(0, i, 0, i + 20);
            grd.addColorStop(0, '#8080FF');
            grd.addColorStop(0.5, '#80FFFF'); // Highlight
            grd.addColorStop(1, '#8080FF');
            ctx.fillStyle = grd;
            ctx.fillRect(0, i, 512, 20);
        }
    } else if (type === 'Wavy') {
        ctx.strokeStyle = '#80FFFF';
        ctx.lineWidth = 15;
        for (let i = -50; i < 562; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.bezierCurveTo(170, i - 50, 340, i + 50, 512, i);
            ctx.stroke();
        }
    }
    return canvas.toDataURL();
};

// ✅ NEW: Empty normal map (1x1 pixel flat blue) to satisfy useTexture hook unconditionally
const EMPTY_NORMAL_MAP = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkqAcAAIQAgP/176MAAAAASUVORK5CYII=";

// --- 1. CONFIGURATION (unchanged) ---
const HEART_SCALE_FACTOR = 2.8;
const DECOR_SPACING_FACTOR = 0.20; 
const SCENE_HEIGHT_FACTOR = 0.15; // Each "inch" in config becomes 0.15 units in 3D scene

const PLACEMENT_ZONES = {
    border: 0.95,
    inner: 0.75,
    scatter: 0.7 
};


// --- 2. MATH HELPERS (unchanged) ---
const calculateHeartPoint = (t, scale = 1) => {
  const xRaw = 16 * Math.pow(Math.sin(t), 3);
  const yRaw = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  const x = xRaw * 0.035 * scale;
  const y = yRaw * 0.035 * scale;
  return { x, y };
};

const getHeartShape = () => {
  const shape = new THREE.Shape();
  const resolution = 60;
  for (let i = 0; i <= resolution; i++) {
    const t = (i / resolution) * Math.PI * 2;
    const { x, y } = calculateHeartPoint(t, 1);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return shape;
};

const getBorderCount = (shape, topLayerWidth, getScale) => {
    const s = getScale(topLayerWidth);
    let perimeter;
    
    if (shape === 'Round') {
        perimeter = 2 * Math.PI * s;
    } else if (shape === 'Square') {
        perimeter = 4 * (s * 1.8);
    } else if (shape === 'Rectangle') {
        perimeter = 2 * (s * 2.2 + s * 1.5);
    } else if (shape === 'Heart') {
        perimeter = (s * HEART_SCALE_FACTOR) * 12; 
    } else {
        perimeter = 2 * Math.PI * s; 
    }

    const count = Math.ceil(perimeter / DECOR_SPACING_FACTOR);
    
    return Math.max(8, count);
};

// **CRITICAL FIX: Initializing effectiveInset before use, and simplifying scatter math**
const getToppingPosition = (index, total, shape, topScale, placementZone = 'inner', isScatter = false) => {
  let inset;
  if (placementZone === 'border') {
      inset = PLACEMENT_ZONES.border;
  } else if (placementZone === 'inner') {
      inset = PLACEMENT_ZONES.inner;
  } else {
      // Default scatter inset
      inset = PLACEMENT_ZONES.scatter;
  }

  // Define effectiveInset once in scope (FIX for ReferenceError)
  const effectiveInset = inset; 

  let x = 0, z = 0;
  
  // SCATTER LOGIC 
  if (isScatter) {
    const randomInset = Math.random() * effectiveInset;
    
    if (shape === 'Heart') {
      const angle = Math.random() * Math.PI * 2;
      const pos = calculateHeartPoint(angle, topScale * HEART_SCALE_FACTOR * randomInset);
      return [pos.x, 0.06, -pos.y];
    }
    else if (shape === 'Rectangle') {
      const w = topScale * 2.2 * effectiveInset, d = topScale * 1.5 * effectiveInset;
      // Scatter within the rectangular bounds
      return [(Math.random() - 0.5) * w, 0.06, (Math.random() - 0.5) * d];
    }
    else if (shape === 'Square') {
      const w = topScale * 1.8 * effectiveInset;
      // Scatter within the square bounds
      return [(Math.random() - 0.5) * w, 0.06, (Math.random() - 0.5) * w];
    }
    else {
      // Round/Cylinder scatter
      const a = Math.random() * Math.PI * 2, r = topScale * randomInset;
      x = Math.cos(a) * r; z = Math.sin(a) * r;
    }
    return [x, 0.06, z];
  }
  
  // STRUCTURED LOGIC 
  // Position around the edge based on shape and total count
  
  if (shape === 'Heart') {
    const t = (index / total) * Math.PI * 2;
    const pos = calculateHeartPoint(t, topScale * HEART_SCALE_FACTOR * effectiveInset);
    x = pos.x; z = -pos.y;
  }
  else if (shape === 'Rectangle') {
    const w = topScale * 2.2 * effectiveInset, d = topScale * 1.5 * effectiveInset, p = (w + d) * 2;
    let spacing = (index / total) * p; 
    
    if (spacing < w) { x = spacing - w / 2; z = -d / 2; } 
    else if (spacing < w + d) { spacing -= w; x = w / 2; z = -d / 2 + spacing; } 
    else if (spacing < w + d + w) { spacing -= (w + d); x = w / 2 - spacing; z = d / 2; } 
    else { spacing -= (w + d + w); x = -w / 2; z = d / 2 - spacing; } 
  }
  else if (shape === 'Square') {
    const w = topScale * 1.8 * effectiveInset, p = w * 4;
    let spacing = (index / total) * p; 
    if (spacing < w) { x = spacing - w / 2; z = -w / 2; } 
    else if (spacing < 2 * w) { spacing -= w; x = w / 2; z = -w / 2 + spacing; } 
    else if (spacing < 3 * w) { spacing -= 2 * w; x = w / 2 - spacing; z = w / 2; } 
    else { spacing -= 3 * w; x = -w / 2; z = w / 2 - spacing; } 
  }
  else {
    const a = (index / total) * Math.PI * 2, r = topScale * effectiveInset;
    x = Math.cos(a) * r; z = Math.sin(a) * r;
  }
  return [x, 0.06, z];
};

// --- MAIN MODEL ---
const CakeModel = ({ 
    shape = 'Round', layers = [], frosting = 'Vanilla', frostingCoverage = 'full', texture = 'Smooth', toppings = {}, 
    getLayerColor, getFrostingColor, messageConfig, config, // ✅ FIX: Accept full config to access topperText
    textures = []
}) => {
  const groupRef = useRef();
  const heartShape = useMemo(() => getHeartShape(), []);

  // --- DYNAMIC SCALE & HEIGHT CALCULATIONS ---
  const getScale = (inches) => inches / 5.0; // Diameter scaling
  const topLayerWidth = layers.length > 0 ? layers[layers.length - 1]?.width || 6 : 6;
  const topScale = getScale(topLayerWidth);
  const totalHeight = layers.reduce((sum, layer) => sum + (layer.height * SCENE_HEIGHT_FACTOR), 0);
  const bottomScale = layers.length > 0 ? getScale(layers[0]?.width || 12) * (shape === 'Heart' ? 2.0 : shape === 'Rectangle' ? 1.7 : 1.5) : getScale(12) * 1.5;
  const PLATE_THICKNESS = 0.05;

  // --- NEW: Texture Loading ---
  // Define geometries for instanced meshes once
  const sprinkleGeometry = useMemo(() => new THREE.CapsuleGeometry(0.015, 0.06, 4, 8), []);
  const nutGeometry = useMemo(() => new THREE.DodecahedronGeometry(0.04), []);
  const cookieGeometry = useMemo(() => new THREE.CylinderGeometry(0.06, 0.06, 0.02), []);
  const goldFlakeGeometry = useMemo(() => new THREE.PlaneGeometry(0.08, 0.08), []);
  const confettiGeometry = useMemo(() => new THREE.CircleGeometry(0.04, 8), []);

  // Pre-calculate positions for instanced meshes
  const scatteredPositions = useMemo(() => {
    const positions = { sprinkles: [], nuts: [], cookies: [], goldFlakes: [], confetti: [] };
    
    // Helper to generate N items for a specific category
    const generateItems = (count, targetArray, extraPropsFn) => {
        for (let i = 0; i < count; i++) {
            const pos = getToppingPosition(i, 0, shape, topScale, 'inner', true);
            targetArray.push({ position: pos, ...extraPropsFn(i) });
        }
    };

    // Generate dense populations for each type independently
    generateItems(250, positions.sprinkles, (i) => ({
        rotation: [Math.PI / 2, Math.random() * Math.PI, Math.random() * Math.PI],
        color: ['#FF69B4', '#FFD700', '#00CED1'][i % 3]
    }));

    generateItems(60, positions.nuts, () => ({}));
    
    generateItems(50, positions.cookies, () => ({
        rotation: [Math.random() * Math.PI, 0, 0]
    }));

    generateItems(120, positions.goldFlakes, () => ({
        rotation: [Math.random(), Math.random(), 0]
    }));

    generateItems(120, positions.confetti, (i) => ({
        rotation: [Math.random(), Math.random(), 0],
        color: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'][i % 4]
    }));

    return positions;
  }, [shape, topScale]);
  const selectedTexture = useMemo(() => {
    if (!textures || !texture) return null;
    return textures.find(t => t.name === texture);
  }, [texture, textures]);

  // --- TEXTURE LOGIC: Use URL if available, otherwise generate procedural ---
  const textureUrl = useMemo(() => {
      if (!selectedTexture) return null;
      // If a real URL exists (e.g. from Cloudinary), use it
      if (selectedTexture.metadata?.textureUrl) return selectedTexture.metadata.textureUrl;
      // Otherwise, generate a data URI for standard types
      if (['Ribbed', 'Wavy'].includes(selectedTexture.name)) return generateNormalMap(selectedTexture.name);
      return EMPTY_NORMAL_MAP; 
  }, [selectedTexture]);

  // ✅ FIX: Ensure useTexture receives a valid string. If textureUrl is null/undefined, fallback to EMPTY_NORMAL_MAP.
  const normalMap = useTexture(textureUrl || EMPTY_NORMAL_MAP);
  
  if (normalMap && normalMap.wrapS) { // Check if normalMap is a valid texture object
      normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
      normalMap.repeat.set(4, 4); // Adjust repeat for desired texture density
  }

  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() / 8) / 8;
  });

  // 1. Memoize Topping Generation 
  const memoizedToppings = useMemo(() => {
    
    const renderToppingGroup = (count, componentKey, placementZone = 'inner', extraProps = {}) => {
      if (!count || count <= 0) return null;
      const Component = TOPPING_COMPONENTS_MAP[componentKey];
      if (!Component) return null; 
      
      return [...Array(count)].map((_, i) => {
        const pos = getToppingPosition(i, count, shape, topScale, placementZone);
        return <Component key={`${componentKey}-${i}`} position={pos} {...extraProps} />;
      });
    };

    const renderSpecificToppings = (key, count) => {
      if (!count || count <= 0) return null;
      const Component = TOPPING_COMPONENTS_MAP[key];
      if (!Component) return null;
      
      if (key === 'Candles') {
          return [...Array(count)].map((_, i) => (
              <Component key={i} position={count === 1 ? [0, 0.06, 0] : getToppingPosition(i, count, shape, topScale, 'inner', false)} />
          ));
      }
      return renderToppingGroup(count, key, 'inner');
    }

    const frostColor = getFrostingColor(frosting); 
    const isDollopPipingOn = toppings['Cream Dollops'] === true;
    const isSwirlPipingOn = toppings['Icing Swirls'] === true;
    const isRosettePipingOn = toppings['Rosettes'] === true;
    const isShellPipingOn = toppings['Shell Border'] === true;
    const borderCount = getBorderCount(shape, topLayerWidth, getScale);
    
    // --- Get Toggle Topping States (Cookies, Nuts, Sprinkles) ---
    const isCookiesOn = toppings['Cookies'] === true;
    const isNutsOn = toppings['Nuts'] === true;
    const isSprinklesOn = toppings['Sprinkles'] === true;
    const isGoldFlakesOn = toppings['Gold Flakes'] === true;
    const isConfettiOn = toppings['Confetti'] === true;

    // --- Check for Signs/Toppers ---
    const isHBDOn = toppings['Happy Birthday Sign'] === true;
    const isMrMrsOn = toppings['Mr & Mrs Sign'] === true;

    // Retrieve components for JSX (JSX tags cannot use bracket notation directly)
    const HappyBirthdaySign = TOPPING_COMPONENTS_MAP['Happy Birthday Sign'];
    const MrMrsSign = TOPPING_COMPONENTS_MAP['Mr & Mrs Sign'];
    // -----------------------------------------------------------
    
    // Combine all toppings into one array
    return [
        // --- A. BORDER DECORATIONS ---
        isDollopPipingOn && renderToppingGroup(borderCount, 'Cream Dollops', 'border', { 
            color: frostColor, scale: 0.5 
        }),
        isSwirlPipingOn && renderToppingGroup(borderCount, 'Icing Swirls', 'border', {
             color: frostColor, scale: 0.5
        }),
        isRosettePipingOn && renderToppingGroup(borderCount, 'Rosettes', 'border', {
             color: frostColor, scale: 0.5
        }),
        isShellPipingOn && renderToppingGroup(borderCount, 'Shell Border', 'border', {
             color: frostColor, scale: 0.5
        }),
        
        // --- B. INNER COUNTABLE DECORATIONS ---
        renderToppingGroup(toppings.Macarons, 'Macarons', 'inner', { color: '#FFC0CB' }),
        renderToppingGroup(toppings.Cherries, 'Cherries', 'inner'),
        renderToppingGroup(toppings.Flowers, 'Flowers', 'inner'),
        renderToppingGroup(toppings.Chocolates, 'Chocolates', 'inner'),
        renderSpecificToppings('Candles', toppings.Candles),
        
        // --- C. CENTER TOPPERS ---
        // We position these slightly back (z=-0.5) so they don't overlap with the message text
        isHBDOn && HappyBirthdaySign && <HappyBirthdaySign key="hbd" position={[0, 0, -0.5 * topScale]} scale={topScale} />,
        isMrMrsOn && MrMrsSign && <MrMrsSign key="mrmrs" position={[0, 0, -0.5 * topScale]} scale={topScale} />,

        // --- C. SCATTERED DECORATIONS (OPTIMIZED WITH INSTANCING) ---
        isSprinklesOn && (
          <Instances key="sprinkles" geometry={sprinkleGeometry} frustumCulled={false}>
            <meshStandardMaterial />
            {scatteredPositions.sprinkles.map((props, i) => <Instance key={i} {...props} />)}
          </Instances>
        ),
        isNutsOn && (
          <Instances key="nuts" geometry={nutGeometry} frustumCulled={false}>
            <meshStandardMaterial color="#8D6E63" />
            {scatteredPositions.nuts.map((props, i) => <Instance key={i} {...props} />)}
          </Instances>
        ),
        isCookiesOn && (
          <Instances key="cookies" geometry={cookieGeometry} frustumCulled={false}>
            <meshStandardMaterial color="#3E2723" />
            {scatteredPositions.cookies.map((props, i) => <Instance key={i} {...props} />)}
          </Instances>
        ),
        isGoldFlakesOn && (
          <Instances key="gold" geometry={goldFlakeGeometry} frustumCulled={false}>
            <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.2} side={THREE.DoubleSide} />
            {scatteredPositions.goldFlakes.map((props, i) => <Instance key={i} {...props} />)}
          </Instances>
        ),
        isConfettiOn && (
          <Instances key="confetti" geometry={confettiGeometry} frustumCulled={false}>
            <meshStandardMaterial side={THREE.DoubleSide} />
            {scatteredPositions.confetti.map((props, i) => <Instance key={i} {...props} />)}
          </Instances>
        ),
    ].flat().filter(Boolean); // Filter out the nulls
    
  }, [shape, layers, frostingCoverage, toppings, topScale, frosting, getFrostingColor]);

  const isNaked = frostingCoverage === 'naked';
  const frostColor = getFrostingColor(frosting); 

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. CERAMIC PLATE (unchanged) */}
      <mesh position={[0, PLATE_THICKNESS / 2, 0]} receiveShadow>
        <cylinderGeometry args={[bottomScale, bottomScale * 0.95, PLATE_THICKNESS, 64]} />
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.1} clearcoat={0.5} />
      </mesh>

      {/* 2. LAYERS (unchanged geometry rendering) */}
      {layers.map((layer, index) => {
        const sceneLayerHeight = layer.height * SCENE_HEIGHT_FACTOR;
        const s = getScale(layer.width);
        // Calculate bottom position based on the sum of heights of layers below
        const previousLayersHeight = layers.slice(0, index).reduce((sum, l) => sum + (l.height * SCENE_HEIGHT_FACTOR), 0);
        const currentLayerBottom = PLATE_THICKNESS + previousLayersHeight;
        const color = getLayerColor(layer.flavor); 
        const renderShape = shape.replace(/cake/i, '').trim(); 

        if (renderShape === 'Heart') {
          const heartS = s * HEART_SCALE_FACTOR;
          return (
            <group key={index} position={[0, currentLayerBottom, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[heartS, heartS, 1]} castShadow receiveShadow frustumCulled={false}>
                <extrudeGeometry args={[heartShape, { depth: sceneLayerHeight, bevelEnabled: !isNaked, bevelThickness: 0.02, bevelSize: 0.02 }]} />
                {isNaked ? <meshStandardMaterial color={color} /> : <FrostingMaterial color={frostColor} normalMap={normalMap} />}
              </mesh>
              {isNaked && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, sceneLayerHeight / 2, 0]} scale={[heartS * 1.01, heartS * 1.01, 1]} frustumCulled={false}>
                  <extrudeGeometry args={[heartShape, { depth: 0.05, bevelEnabled: false }]} />
                  <FrostingMaterial color={frostColor} normalMap={normalMap} />
                </mesh>
              )}
            </group>
          );
        }

        if (renderShape === 'Rectangle' || renderShape === 'Square') {
          const isSquare = renderShape === 'Square';
          const layerHeight = sceneLayerHeight;
          return (
            <group key={index} position={[0, currentLayerBottom + layerHeight / 2, 0]}>
              <mesh castShadow receiveShadow>
                {isSquare ? <boxGeometry args={[s * 1.8, layerHeight, s * 1.8]} /> : <boxGeometry args={[s * 2.2, layerHeight, s * 1.5]} />}
                {isNaked ? <meshStandardMaterial color={color} /> : <FrostingMaterial color={frostColor} normalMap={normalMap} />}
              </mesh>
              {isNaked && (
                <mesh position={[0, layerHeight / 2, 0]} scale={[1.03, 1, 1.03]}>
                  {isSquare ? <boxGeometry args={[s * 1.8, 0.05, s * 1.8]} /> : <boxGeometry args={[s * 2.2, 0.05, s * 1.5]} />}
                  <FrostingMaterial color={frostColor} normalMap={normalMap} />
                </mesh>
              )}
            </group>
          );
        }

        // Default to Round/Cylinder
        const layerHeight = sceneLayerHeight;
        return (
          <group key={index} position={[0, currentLayerBottom + layerHeight / 2, 0]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[s, s, layerHeight, 32]} />
              {isNaked ? <meshStandardMaterial color={color} /> : <FrostingMaterial color={frostColor} normalMap={normalMap} />}
            </mesh>
            {isNaked && (
              <mesh position={[0, layerHeight / 2, 0]} scale={[1.03, 1, 1.03]}>
                <cylinderGeometry args={[s, s, 0.05, 64]} />
                <FrostingMaterial color={frostColor} normalMap={normalMap} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* 3. TOPPINGS GROUP */}
      <group position={[0, PLATE_THICKNESS + totalHeight, 0]}>
        {/* Top Glaze (unchanged) */}
        {shape === 'Heart' ? (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} scale={[topScale * HEART_SCALE_FACTOR * 1.005, topScale * HEART_SCALE_FACTOR * 1.005, 1]} receiveShadow={false} castShadow={false}>
            <extrudeGeometry args={[heartShape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 }]} />
            <GlazeMaterial color={frostColor} normalMap={normalMap} />
          </mesh>
        ) : (
          <mesh position={[0, 0.015, 0]} receiveShadow={false} castShadow={false}>
            {shape === 'Rectangle' && <boxGeometry args={[topScale * 2.25 * 1.005, 0.04, topScale * 1.55 * 1.005]} />}
            {shape === 'Square' && <boxGeometry args={[topScale * 1.85 * 1.005, 0.04, topScale * 1.85 * 1.005]} />}
            {shape === 'Round' && <cylinderGeometry args={[topScale * 1.005, topScale * 1.005, 0.04, 32]} />}
            <GlazeMaterial color={frostColor} normalMap={normalMap} />
          </mesh>
        )}
        
        {/* RENDER CUSTOM MESSAGE */}
        {messageConfig.text.trim().length > 0 && (
             <CakeText config={messageConfig} topScale={topScale} />
        )}

        {/* Render all memoized toppings here */}
        {memoizedToppings}
        
      </group>
    </group>
  );
};

export default CakeModel;