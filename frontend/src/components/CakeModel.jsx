import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CakeModel = ({ size, layers, frosting, toppings }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  const getSizeMultiplier = () => {
    switch (size) {
      case 'small':
        return 0.8;
      case 'medium':
        return 1;
      case 'large':
        return 1.2;
      default:
        return 1;
    }
  };

  const getLayerColor = (layer) => {
    const colors = {
      vanilla: '#F4E8C1',
      chocolate: '#8B4513',
      strawberry: '#FFB3D9',
      redvelvet: '#8B1A1A',
    };
    return colors[layer] || '#F4E8C1';
  };

  const getFrostingColor = () => {
    const colors = {
      vanilla: '#FFFACD',
      chocolate: '#654321',
      cream: '#FFFDD0',
      strawberry: '#FFB6C1',
    };
    return colors[frosting] || '#FFFACD';
  };

  const sizeMultiplier = getSizeMultiplier();
  const baseRadius = 1.5 * sizeMultiplier;
  const layerHeight = 0.5;

  return (
    <group ref={groupRef}>
      {/* Cake Layers */}
      {layers.map((layer, index) => (
        <group key={index} position={[0, index * layerHeight, 0]}>
          {/* Cake layer */}
          <mesh castShadow>
            <cylinderGeometry args={[baseRadius, baseRadius, layerHeight, 32]} />
            <meshStandardMaterial color={getLayerColor(layer)} />
          </mesh>
          
          {/* Frosting layer */}
          <mesh position={[0, layerHeight / 2, 0]} castShadow>
            <cylinderGeometry args={[baseRadius + 0.05, baseRadius + 0.05, 0.1, 32]} />
            <meshStandardMaterial 
              color={getFrostingColor()} 
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* Toppings */}
      {toppings.includes('cherries') && (
        <>
          {[...Array(5)].map((_, i) => {
            const angle = (i / 5) * Math.PI * 2;
            const radius = baseRadius * 0.6;
            return (
              <mesh
                key={`cherry-${i}`}
                position={[
                  Math.cos(angle) * radius,
                  layers.length * layerHeight + 0.3,
                  Math.sin(angle) * radius,
                ]}
                castShadow
              >
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="#DC143C" />
              </mesh>
            );
          })}
        </>
      )}

      {toppings.includes('sprinkles') && (
        <>
          {[...Array(30)].map((_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * baseRadius * 0.8;
            const colors = ['#FF69B4', '#FFD700', '#00CED1', '#FF6347', '#9370DB'];
            return (
              <mesh
                key={`sprinkle-${i}`}
                position={[
                  Math.cos(angle) * radius,
                  layers.length * layerHeight + 0.15,
                  Math.sin(angle) * radius,
                ]}
                rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
                castShadow
              >
                <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
                <meshStandardMaterial color={colors[Math.floor(Math.random() * colors.length)]} />
              </mesh>
            );
          })}
        </>
      )}

      {toppings.includes('candles') && (
        <>
          {[...Array(3)].map((_, i) => {
            const angle = (i / 3) * Math.PI * 2;
            const radius = baseRadius * 0.4;
            return (
              <group
                key={`candle-${i}`}
                position={[
                  Math.cos(angle) * radius,
                  layers.length * layerHeight + 0.2,
                  Math.sin(angle) * radius,
                ]}
              >
                {/* Candle body */}
                <mesh castShadow>
                  <cylinderGeometry args={[0.05, 0.05, 0.4, 16]} />
                  <meshStandardMaterial color="#FFB6C1" />
                </mesh>
                {/* Flame */}
                <mesh position={[0, 0.3, 0]}>
                  <sphereGeometry args={[0.06, 16, 16]} />
                  <meshStandardMaterial 
                    color="#FFA500" 
                    emissive="#FFA500"
                    emissiveIntensity={2}
                  />
                </mesh>
              </group>
            );
          })}
        </>
      )}

      {toppings.includes('flowers') && (
        <>
          {[...Array(4)].map((_, i) => {
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 8;
            const radius = baseRadius * 0.7;
            return (
              <group
                key={`flower-${i}`}
                position={[
                  Math.cos(angle) * radius,
                  layers.length * layerHeight + 0.1,
                  Math.sin(angle) * radius,
                ]}
              >
                {/* Flower petals */}
                {[...Array(5)].map((_, p) => {
                  const petalAngle = (p / 5) * Math.PI * 2;
                  return (
                    <mesh
                      key={`petal-${p}`}
                      position={[Math.cos(petalAngle) * 0.1, 0, Math.sin(petalAngle) * 0.1]}
                      rotation={[Math.PI / 2, 0, petalAngle]}
                      castShadow
                    >
                      <sphereGeometry args={[0.08, 16, 16]} />
                      <meshStandardMaterial color="#FF1493" />
                    </mesh>
                  );
                })}
                {/* Flower center */}
                <mesh castShadow>
                  <sphereGeometry args={[0.05, 16, 16]} />
                  <meshStandardMaterial color="#FFD700" />
                </mesh>
              </group>
            );
          })}
        </>
      )}

      {/* Cake Stand */}
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <cylinderGeometry args={[baseRadius + 0.2, baseRadius + 0.3, 0.1, 32]} />
        <meshStandardMaterial color="#E8E8E8" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
};

export default CakeModel;
