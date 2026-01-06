// frontend/src/components/builder/ToppingElements.jsx
import React, { Suspense } from 'react'; 
import * as THREE from 'three'; // Import THREE
// Import Text and a font loader utility if needed, but we'll stick to Text for simplicity.
import { Text } from '@react-three/drei'; 


// --- FONT ASSET MAPPING (Assumes fonts are bundled in /public or /assets/fonts) ---
const FONT_MAP = {
    // Note: 'sans-serif' is handled by NOT passing the font prop (drei default)
    'serif': '/fonts/PlayfairDisplay-Regular.woff',   // Elegant, classic font
    'cursive': '/fonts/GreatVibes-Regular.woff',     // Script/Handwritten style
    'monospace': '/fonts/RobotoMono-Regular.woff',   // Block/Code style
    // ✅ IMPORTANT: Ensure these files exist in your `frontend/public/fonts/` directory.
    // If files are missing, the component will fail to render when these styles are selected.
};

// --- MATERIALS ---

export const FrostingMaterial = ({ color, normalMap }) => (
  <meshPhysicalMaterial 
    color={color} 
    roughness={0.45} 
    clearcoat={0.1} 
    normalMap={normalMap || null}
    normalScale={new THREE.Vector2(0.3, 0.3)}
  />
);

export const GlazeMaterial = ({ color, normalMap }) => (
  <meshPhysicalMaterial 
    color={color} 
    roughness={0.2} 
    clearcoat={0.4} 
    transparent opacity={0.95} 
    polygonOffset polygonOffsetFactor={-1} 
    polygonOffsetUnits={-1}
    normalMap={normalMap || null}
    normalScale={new THREE.Vector2(0.1, 0.1)}
  />
);

// --- UPDATED COMPONENT: CakeText (Functional 3D Text) ---
export const CakeText = ({ config, topScale }) => {
    if (!config.text || config.text.trim().length === 0) return null;
    
    // 1. Dynamic Font Selection & Fallback Logic
    const customFontPath = FONT_MAP[config.font];
    
    // If the selected font is 'sans-serif' or not found in the map, fontToLoad remains undefined, 
    // forcing the <Text> component to use its highly stable internal default font.
    const fontToLoad = customFontPath; 

    // Size and positioning calculations
    const maxCakeDiameter = topScale * 2; 
    const maxWidth = maxCakeDiameter * 0.8; 
    const position = [0, 0.08, 0]; 
    const rotation = [-Math.PI / 2, 0, Math.PI];
    // Scale text size inversely proportional to length for better fit
    const textSize = Math.max(0.2, 0.3 - (config.text.length * 0.005)); 

    return (
        <group position={[0, 0, 0]}>
            <Suspense fallback={null}> 
                <Text 
                    fontSize={textSize}
                    color={config.color} 
                    maxWidth={maxWidth}
                    lineHeight={1}
                    textAlign="center"
                    
                    // ✅ FIX: Conditionally spread the font prop.
                    // Passing `font={undefined}` can cause an internal crash in `useTexture`.
                    {...(fontToLoad && { font: fontToLoad })}
                    
                    position={position}
                    rotation={rotation}
                    anchorX="center" 
                    anchorY="middle" 
                    depthOffset={-10}
                    castShadow 
                >
                    {config.text}
                    <meshStandardMaterial 
                        attach="material" 
                        color={config.color} 
                        metalness={0.5} 
                        roughness={0.5} 
                    />
                </Text>
            </Suspense>
        </group>
    );
};


// --- INDIVIDUAL TOPPING COMPONENTS (Remainder of file is unchanged) ---

export const IcingDollop = ({ position, color, scale = 1 }) => (
  <group position={position} scale={[scale, scale, scale]}>
    <mesh position={[0, 0.08, 0]} castShadow frustumCulled={false}><sphereGeometry args={[0.25, 16, 12]} /><FrostingMaterial color={color} /></mesh>
    <mesh position={[0, 0.25, 0]} castShadow frustumCulled={false}><sphereGeometry args={[0.2, 16, 12]} /><FrostingMaterial color={color} /></mesh>
    <mesh position={[0, 0.38, 0]} castShadow frustumCulled={false}><coneGeometry args={[0.1, 0.2, 16]} /><FrostingMaterial color={color} /></mesh>
  </group>
);

export const IcingSwirl = ({ position, color, scale = 1 }) => (
    <group position={position} scale={[scale * 0.8, scale * 0.8, scale * 0.8]}>
        <mesh position={[0, 0.04, 0]} castShadow frustumCulled={false}><cylinderGeometry args={[0.3, 0.35, 0.08, 24]} /><FrostingMaterial color={color} /></mesh>
        <mesh position={[0, 0.12, 0]} castShadow frustumCulled={false}><cylinderGeometry args={[0.22, 0.25, 0.08, 24]} /><FrostingMaterial color={color} /></mesh>
        <mesh position={[0, 0.25, 0]} castShadow frustumCulled={false}><coneGeometry args={[0.15, 0.2, 16]} /><FrostingMaterial color={color} /></mesh>
    </group>
);

export const Macaron = ({ position, color }) => (
  <group position={position} scale={0.7} rotation={[0, Math.random(), 0]}>
    <mesh position={[0, 0.04, 0]} frustumCulled={false}><cylinderGeometry args={[0.15, 0.15, 0.05, 16]} /><meshStandardMaterial color={color} /></mesh>
    <mesh position={[0, 0.08, 0]} frustumCulled={false}><cylinderGeometry args={[0.14, 0.14, 0.03, 16]} /><meshStandardMaterial color="#FFF" /></mesh>
    <mesh position={[0, 0.12, 0]} frustumCulled={false}><cylinderGeometry args={[0.15, 0.15, 0.05, 16]} /><meshStandardMaterial color={color} /></mesh>
  </group>
);

export const Candle = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.25, 0]} frustumCulled={false}><cylinderGeometry args={[0.03, 0.03, 0.5, 8]} /><meshStandardMaterial color="#FF69B4" /></mesh>
    <mesh position={[0, 0.5, 0]} frustumCulled={false}><sphereGeometry args={[0.04]} /><meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} /></mesh>
  </group>
);

export const EdibleFlower = ({ position }) => (
  <group position={position} scale={0.6}>
    {[...Array(5)].map((_, i) => (<mesh key={i} position={[Math.cos(i * 1.25) * 0.15, 0.05, Math.sin(i * 1.25) * 0.15]} frustumCulled={false}><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial color="#FFB7C5" /></mesh>))}
    <mesh position={[0, 0.08, 0]} frustumCulled={false}><sphereGeometry args={[0.08]} /><meshStandardMaterial color="#FFF" /></mesh>
  </group>
);

export const Cherry = ({ position }) => (
  <group position={position} rotation={[0, Math.random() * Math.PI * 2, 0]}>
    <mesh position={[0, 0.12, 0]} castShadow frustumCulled={false}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="#8B0000" roughness={0.1} />
    </mesh>
    <mesh position={[0, 0.28, 0]} rotation={[0, 0, Math.random() * 0.2]} frustumCulled={false}>
      <cylinderGeometry args={[0.015, 0.015, 0.35, 8]} />
      <meshStandardMaterial color="#388E3C" />
    </mesh>
  </group>
);

// --- NEW TOPPERS ---

export const HappyBirthdaySign = ({ position, scale = 1 }) => (
  <group position={position} scale={scale}>
    {/* Sticks */}
    <mesh position={[-0.3, 0.15, 0]} castShadow frustumCulled={false}><cylinderGeometry args={[0.015, 0.015, 0.5, 8]} /><meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} /></mesh>
    <mesh position={[0.3, 0.15, 0]} castShadow frustumCulled={false}><cylinderGeometry args={[0.015, 0.015, 0.5, 8]} /><meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} /></mesh>
    {/* Text Mesh (Gold) */}
    <Text 
        position={[0, 0.4, 0]} 
        fontSize={0.25} 
        color="#FFD700" 
        font="/fonts/GreatVibes-Regular.woff" // Uses cursive if available
        anchorX="center" 
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#B8860B"
    >
        Happy Birthday
    </Text>
  </group>
);

export const MrMrsSign = ({ position, scale = 1 }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.15, 0]} castShadow frustumCulled={false}><cylinderGeometry args={[0.015, 0.015, 0.5, 8]} /><meshStandardMaterial color="#C0C0C0" /></mesh>
    <Text position={[0, 0.4, 0]} fontSize={0.3} color="#000" font="/fonts/PlayfairDisplay-Regular.woff" anchorX="center" anchorY="middle">
        Mr & Mrs
    </Text>
  </group>
);

// --- MISSING DECORATIONS ---

export const Rosette = ({ position, color, scale = 1 }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.05, 0]} castShadow frustumCulled={false}><torusKnotGeometry args={[0.12, 0.04, 64, 8, 2, 3]} /><FrostingMaterial color={color} /></mesh>
  </group>
);

export const ShellBorder = ({ position, color, scale = 1 }) => (
  <group position={position} scale={scale} rotation={[0, 0, Math.PI / 2]}>
     <mesh position={[0, 0.05, 0]} castShadow frustumCulled={false}><coneGeometry args={[0.12, 0.25, 8, 1, true, 0, Math.PI]} /><FrostingMaterial color={color} /></mesh>
  </group>
);

export const ChocolatePiece = ({ position, scale = 1 }) => (
  <group position={position} scale={scale} rotation={[Math.random(), Math.random(), Math.random()]}>
    <mesh position={[0, 0.05, 0]} castShadow frustumCulled={false}><boxGeometry args={[0.2, 0.05, 0.2]} /><meshStandardMaterial color="#3E2723" roughness={0.4} /></mesh>
  </group>
);

export const GoldFlake = ({ position, scale = 1 }) => (
  <group position={position} scale={scale} rotation={[Math.random(), Math.random(), 0]}>
    <mesh position={[0, 0.01, 0]} frustumCulled={false}><planeGeometry args={[0.08, 0.08]} /><meshStandardMaterial color="#FFD700" metalness={1} roughness={0.2} side={THREE.DoubleSide} /></mesh>
  </group>
);

export const ConfettiPiece = ({ position, scale = 1 }) => (
  <group position={position} scale={scale} rotation={[Math.random(), Math.random(), 0]}>
    <mesh position={[0, 0.01, 0]} frustumCulled={false}><circleGeometry args={[0.04, 8]} /><meshStandardMaterial color={['#FF0000', '#00FF00', '#0000FF', '#FFFF00'][Math.floor(Math.random() * 4)]} side={THREE.DoubleSide} /></mesh>
  </group>
);

// --- SCATTERED ITEMS (For Instancing in CakeModel, but defined here for consistency if needed as single items) ---
export const SprinkleMesh = () => (
  <mesh><capsuleGeometry args={[0.015, 0.06, 4, 8]} /><meshStandardMaterial color="#FF69B4" /></mesh>
);

export const NutMesh = () => (
  <mesh><dodecahedronGeometry args={[0.04]} /><meshStandardMaterial color="#8D6E63" /></mesh>
);

export const CookieMesh = () => (
  <mesh><cylinderGeometry args={[0.06, 0.06, 0.02]} /><meshStandardMaterial color="#3E2723" /></mesh>
);

// --- TOPPING COMPONENT MAP (For dynamic loading) ---
export const TOPPING_COMPONENTS_MAP = {
    'Cream Dollops': IcingDollop, 
    'Icing Swirls': IcingSwirl, 
    'Rosettes': Rosette,
    'Shell Border': ShellBorder,
    'Macarons': Macaron,
    'Cherries': Cherry,       
    'Candles': Candle,
    'Flowers': EdibleFlower,
    'Chocolates': ChocolatePiece,
    'Gold Flakes': GoldFlake,
    'Confetti': ConfettiPiece,
    // ✅ NEW: Register the new components
    'Happy Birthday Sign': HappyBirthdaySign,
    'Mr & Mrs Sign': MrMrsSign
};