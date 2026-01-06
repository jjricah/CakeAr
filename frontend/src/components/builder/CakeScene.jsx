import React, { Suspense, useImperativeHandle, forwardRef, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei";
import CakeModel from './CakeModel';
import * as Icons from '../Icons';

// --- NEW: Loader component for Suspense fallback ---
const Loader = () => {
  return (
    <Html center>
      <div className="w-48 text-center text-[#8B5E3C] dark:text-[#C59D5F]">
        <div className="animate-pulse text-5xl mb-2 mx-auto">
          <Icons.CakeSolid />
        </div>
        <p className="text-xs font-bold tracking-wider">Building your cake...</p>
      </div>
    </Html>
  );
};


// Helper component MUST be defined inside Canvas to access Three.js context (useThree)
// It uses useImperativeHandle to attach the 'capture' function to the external ref.
const CanvasScreenshotHandler = forwardRef((props, ref) => {
    // useThree grants access to the renderer (gl), scene, and camera
    const { gl } = useThree();

    // The function that performs the actual screenshot capture
    const capture = () => {
        // gl prop in Canvas is set to { preserveDrawingBuffer: true } to enable toDataURL()
        // This method captures the current state of the canvas and returns a Base64 data URL
        const dataURL = gl.domElement.toDataURL('image/png');
        console.log('3D Snapshot captured successfully. Data URL length:', dataURL.length);
        return dataURL;
    };

    // Expose the capture function to the ref passed from CakeBuilder.jsx
    useImperativeHandle(ref, () => ({
        capture: capture
    }));

    // This component is purely for logic and doesn't render anything visible
    return null;
});

// Helper function now defensively checks if assets is defined and an array (UNCHANGED)
const getColorFromMap = (assets = [], name) => {
    if (!Array.isArray(assets)) return '#F9E4B7'; // Safety fallback
    const asset = assets.find(a => a.name.toLowerCase() === name.toLowerCase());
    return asset?.metadata?.color || '#F9E4B7'; // Default to a neutral color if not found
}

// FIX: Added default empty object {} to colorMap to prevent TypeError on initial render.
const CakeScene = forwardRef(({ config, handleARPreview, colorMap = {}, textureMap = {} }, ref) => {
  // Use the colorMap to generate color lookup functions
  const getLayerColor = (f) => getColorFromMap(colorMap.flavors, f);
  const getFrostingColor = (f) => getColorFromMap(colorMap.frostings, f);

  return (
    <div className="h-[40vh] lg:h-auto lg:col-span-2 bg-[#F2E8DC] dark:bg-[#4A403A] lg:rounded-[2rem] shadow-none lg:shadow-xl relative overflow-hidden shrink-0 group border-b lg:border border-[#E6DCCF] dark:border-[#2C2622]">
      <div className="h-full w-full relative">
        {/* AR Button (unchanged) */}
        <button onClick={handleARPreview} className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-[#2C2622]/90 backdrop-blur-md border border-[#E6DCCF] dark:border-[#4A403A] text-[#4A403A] dark:text-[#F3EFE0] px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 hover:scale-105 transition-all duration-300">
          <Icons.AR />
          <span className="text-xs font-bold">AR View</span>
        </button>
        
        {/* CRITICAL: gl={{ preserveDrawingBuffer: true }} ensures toDataURL() works */}
        <Canvas shadows camera={{ position: [0, 3, 9], fov: 40 }} className="touch-none" gl={{ preserveDrawingBuffer: true }}>
          <color attach="background" args={['#F2E8DC']} />
          <Suspense fallback={<Loader />}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <Environment preset="apartment" />
            
            <CakeModel 
              config={config} // ✅ FIX: Pass full config object so CakeModel can access topperText
              shape={config.shape} 
              layers={config.layers} 
              frosting={config.frosting} 
              frostingCoverage={config.frostingCoverage} 
              toppings={config.toppings} 
              // ✅ NEW: Pass the message configuration
              texture={config.texture}
              textures={textureMap.textures}
              messageConfig={config.messageConfig} 
              getLayerColor={getLayerColor} 
              getFrostingColor={getFrostingColor}
            />
            
            <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={10} blur={2} far={4} color="#8B5E3C" />
            
            <OrbitControls 
              enablePan={false} 
              minDistance={4} 
              maxDistance={15} 
              maxPolarAngle={Math.PI / 2.2}
              autoRotate={true}
              autoRotateSpeed={-1.5} 
            />
            
            {/* FIX: Pass the external ref to the handler which now exposes the capture function */}
            <CanvasScreenshotHandler ref={ref} /> 
          </Suspense>
        </Canvas>
        
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white/60 dark:bg-[#2C2622]/60 backdrop-blur-md px-3 py-1 rounded-full border border-[#E6DCCF] dark:border-[#4A403A] pointer-events-none hidden sm:block">
            <p className="text-[10px] text-[#8B5E3C] dark:text-[#C59D5F] font-semibold">Drag to rotate • Scroll to zoom</p>
        </div>
      </div>
    </div>
  );
});

export default CakeScene;