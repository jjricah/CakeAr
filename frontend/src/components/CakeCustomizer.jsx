const CakeCustomizer = ({ config, setConfig, onSave }) => {
  const handleLayerChange = (index, flavor) => {
    const newLayers = [...config.layers];
    newLayers[index] = flavor;
    setConfig({ ...config, layers: newLayers });
  };

  const addLayer = () => {
    if (config.layers.length < 5) {
      setConfig({ ...config, layers: [...config.layers, 'vanilla'] });
    }
  };

  const removeLayer = () => {
    if (config.layers.length > 1) {
      const newLayers = config.layers.slice(0, -1);
      setConfig({ ...config, layers: newLayers });
    }
  };

  const toggleTopping = (topping) => {
    const newToppings = config.toppings.includes(topping)
      ? config.toppings.filter((t) => t !== topping)
      : [...config.toppings, topping];
    setConfig({ ...config, toppings: newToppings });
  };

  const flavorOptions = ['vanilla', 'chocolate', 'strawberry', 'redvelvet'];
  const frostingOptions = ['vanilla', 'chocolate', 'cream', 'strawberry'];
  const toppingOptions = ['cherries', 'sprinkles', 'candles', 'flowers'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Customize Your Cake</h2>

      {/* Cake Size */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Cake Size</label>
        <div className="grid grid-cols-3 gap-3">
          {['small', 'medium', 'large'].map((size) => (
            <button
              key={size}
              onClick={() => setConfig({ ...config, size })}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                config.size === size
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Cake Layers */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            Cake Layers ({config.layers.length})
          </label>
          <div className="flex gap-2">
            <button
              onClick={removeLayer}
              disabled={config.layers.length <= 1}
              className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              −
            </button>
            <button
              onClick={addLayer}
              disabled={config.layers.length >= 5}
              className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {config.layers.map((layer, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 w-20">Layer {index + 1}</span>
              <select
                value={layer}
                onChange={(e) => handleLayerChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                {flavorOptions.map((flavor) => (
                  <option key={flavor} value={flavor} className="capitalize">
                    {flavor}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Frosting */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Frosting</label>
        <select
          value={config.frosting}
          onChange={(e) => setConfig({ ...config, frosting: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          {frostingOptions.map((frosting) => (
            <option key={frosting} value={frosting} className="capitalize">
              {frosting}
            </option>
          ))}
        </select>
      </div>

      {/* Toppings */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Toppings</label>
        <div className="grid grid-cols-2 gap-3">
          {toppingOptions.map((topping) => (
            <button
              key={topping}
              onClick={() => toggleTopping(topping)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                config.toppings.includes(topping)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {topping}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-indigo-800 transform hover:-translate-y-0.5 transition duration-200"
      >
        Save Design
      </button>
    </div>
  );
};

export default CakeCustomizer;
