import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import CakeModel from '../components/CakeModel';
import CakeCustomizer from '../components/CakeCustomizer';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CakeBuilder = () => {
  const navigate = useNavigate();
  const [cakeConfig, setCakeConfig] = useState({
    size: 'medium',
    layers: ['vanilla', 'chocolate'],
    frosting: 'vanilla',
    toppings: ['cherries'],
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.post('/cakes', cakeConfig);
      alert('Cake design saved successfully!');
      console.log('Saved cake:', response.data);
    } catch (error) {
      console.error('Error saving cake:', error);
      alert('Failed to save cake design. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Cake AR Builder</h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
          {/* 3D Viewer */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-full relative">
              <Canvas
                shadows
                camera={{ position: [0, 3, 8], fov: 50 }}
                className="bg-gradient-to-b from-sky-100 to-white"
              >
                <Suspense fallback={null}>
                  {/* Lighting */}
                  <ambientLight intensity={0.5} />
                  <directionalLight
                    position={[5, 5, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                  />
                  <pointLight position={[-5, 5, -5]} intensity={0.5} />

                  {/* Cake Model */}
                  <CakeModel
                    size={cakeConfig.size}
                    layers={cakeConfig.layers}
                    frosting={cakeConfig.frosting}
                    toppings={cakeConfig.toppings}
                  />

                  {/* Environment & Controls */}
                  <Environment preset="sunset" />
                  <ContactShadows
                    position={[0, -0.8, 0]}
                    opacity={0.4}
                    scale={10}
                    blur={2}
                    far={4}
                  />
                  <OrbitControls
                    enablePan={false}
                    minDistance={4}
                    maxDistance={12}
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 2}
                  />
                </Suspense>
              </Canvas>

              {/* Instructions Overlay */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">💡 Tip:</span> Drag to rotate, scroll to zoom
                </p>
              </div>
            </div>
          </div>

          {/* Customization Panel */}
          <div className="lg:col-span-1">
            <CakeCustomizer
              config={cakeConfig}
              setConfig={setCakeConfig}
              onSave={handleSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CakeBuilder;
