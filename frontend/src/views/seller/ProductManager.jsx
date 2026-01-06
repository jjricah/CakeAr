import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import * as Icons from '../../components/Icons';

// Helper: Convert File to Base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
  });
};

const ProductManager = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', basePrice: '', category: 'Custom', image: ''
  });

  useEffect(() => {
    if (user?._id) {
      fetchProducts();
    } else {
      setLoading(false); 
    }
  }, [user]);

  useEffect(() => {
    if (statusMsg.text) {
      const timer = setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  const fetchProducts = async () => {
    if (!user?._id) return;
    setRefreshing(true);
    try {
      const res = await api.get('/products/seller');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load products", error);
      setStatusMsg({ type: 'error', text: "Could not load products." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setShowAddForm(false);
    setFormData({ title: '', description: '', basePrice: '', category: 'Custom', image: '' });
    setStatusMsg({ type: '', text: '' });
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      basePrice: product.basePrice,
      category: product.category,
      image: product.image
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatusMsg({ type: 'error', text: "Image too large (Max 5MB)" });
        return;
      }
      try {
        const base64 = await convertToBase64(file);
        setFormData({ ...formData, image: base64 });
      } catch (err) {
        setStatusMsg({ type: 'error', text: "Failed to process image" });
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setStatusMsg({ type: '', text: '' });

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
        setStatusMsg({ type: 'success', text: "Product updated successfully!" });
      } else {
        await api.post('/products', formData);
        setStatusMsg({ type: 'success', text: "New cake added to catalog!" });
      }
      await fetchProducts(); 
      setTimeout(resetForm, 1500);
    } catch (error) {
      console.error("Submit error:", error);
      setStatusMsg({ type: 'error', text: error.response?.data?.message || "Operation failed" });
    } finally {
      setLoading(false); 
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this cake permanently?")) return;
    try {
      await api.delete(`/products/${productId}`);
      setProducts(prev => prev.filter(p => p._id !== productId));
      setStatusMsg({ type: 'success', text: "Product removed." });
    } catch (error) {
      setStatusMsg({ type: 'error', text: "Delete failed." });
    }
  };

  if (loading && products.length === 0) return <div className="p-8 text-center text-gray-500">Loading catalog...</div>;

  return (
    <div className="animate-fade-in pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-xl text-[#4A403A] dark:text-[#F3EFE0]">
            Catalog <span className="text-[#B0A69D] text-sm font-normal">({products.length})</span>
          </h3>
          <button onClick={fetchProducts} disabled={refreshing} className={`p-2 rounded-full bg-white dark:bg-[#2C2622] shadow-sm border border-[#E6DCCF] dark:border-[#4A403A] text-[#C59D5F] hover:bg-[#F9F7F2] transition ${refreshing ? 'animate-spin' : ''}`} title="Refresh Products">
            <Icons.ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>
        <button onClick={() => { if (showAddForm) resetForm(); else setShowAddForm(true); }} className={`w-full sm:w-auto justify-center text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition active:scale-95 ${showAddForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-[#C59D5F] hover:bg-[#B0894F]'}`}>
          <Icons.Plus /> {showAddForm ? 'Close Form' : 'Add New Cake'}
        </button>
      </div>

      {statusMsg.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in-down shadow-sm border ${statusMsg.type === 'error' ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300' : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300'}`}>
          <span className="text-xl">{statusMsg.type === 'error' ? '⚠️' : '✅'}</span>
          <p className="font-bold text-sm">{statusMsg.text}</p>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white dark:bg-[#4A403A] p-4 sm:p-6 rounded-2xl shadow-lg border border-[#C59D5F]/50 mb-8 animate-fade-in-down">
          <div className="flex justify-between items-center mb-4 border-b border-[#F3EFE0] dark:border-[#2C2622] pb-3">
            <h3 className="font-bold text-lg text-[#4A403A] dark:text-[#F3EFE0]">{editingProduct ? 'Edit Product' : 'Add New Cake'}</h3>
            <button onClick={resetForm} className="text-xs font-bold text-red-400 hover:text-red-500">Cancel</button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase mb-1 block">Product Name</label>
              <input type="text" required name="title" value={formData.title} onChange={handleChange} className="w-full p-2.5 bg-[#F9F7F2] dark:bg-[#2C2622] rounded-lg outline-none border-2 border-transparent focus:border-[#C59D5F] dark:text-[#F3EFE0] transition-colors" placeholder="e.g. Strawberry Bliss"/>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase mb-1 block">Price (₱)</label>
                <input type="number" required name="basePrice" value={formData.basePrice} onChange={handleChange} className="w-full p-2.5 bg-[#F9F7F2] dark:bg-[#2C2622] rounded-lg outline-none border-2 border-transparent focus:border-[#C59D5F] dark:text-[#F3EFE0]" placeholder="0.00"/>
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase mb-1 block">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2.5 bg-[#F9F7F2] dark:bg-[#2C2622] rounded-lg outline-none border-2 border-transparent focus:border-[#C59D5F] dark:text-[#F3EFE0]">
                  {['Custom', 'Birthday', 'Wedding', 'Bento', 'Themed'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase mb-2 block">Product Image</label>
              <div className="bg-[#F9F7F2] dark:bg-[#2C2622] p-3 rounded-xl border border-dashed border-[#B0A69D] flex flex-col items-center gap-3">
                <div className="w-full h-40 bg-white dark:bg-[#1E1A17] rounded-lg overflow-hidden flex items-center justify-center border border-[#E6DCCF] dark:border-[#4A403A] relative">
                  {formData.image ? ( <img src={formData.image} className="w-full h-full object-contain" alt="Preview" /> ) : ( <div className="text-center text-gray-400"><Icons.Image className="w-10 h-10 mx-auto"/> <p className="text-[10px] mt-1">No Image</p></div> )}
                </div>
                <label className="cursor-pointer bg-[#4A403A] dark:bg-[#C59D5F] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md active:scale-95 transition-transform w-full text-center">
                  <span>{formData.image ? 'Change Photo' : 'Upload Photo'}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-[#8B5E3C] dark:text-[#C59D5F] uppercase mb-1 block">Description</label>
              <textarea required rows="3" name="description" value={formData.description} onChange={handleChange} className="w-full p-2.5 bg-[#F9F7F2] dark:bg-[#2C2622] rounded-lg outline-none border-2 border-transparent focus:border-[#C59D5F] dark:text-[#F3EFE0]" placeholder="Describe flavors, allergens, etc..."></textarea>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#C59D5F] text-white py-3 rounded-xl font-bold hover:bg-[#B0894F] shadow-lg active:scale-[0.98] transition-transform disabled:opacity-70 flex items-center justify-center gap-2">
              {loading ? ( <><Icons.LoadingSpinner className="w-5 h-5"/> Saving...</> ) : (editingProduct ? 'Update Product' : 'Save Product')}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <div key={product._id} className="bg-white dark:bg-[#4A403A] rounded-2xl border border-[#E6DCCF] dark:border-[#2C2622] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
            <div className="aspect-square bg-[#F9F7F2] dark:bg-[#2C2622] relative overflow-hidden">
              <img src={product.image || 'https://placehold.co/100'} alt={product.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
              <button onClick={() => handleEditClick(product)} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/80 dark:bg-[#2C2622]/80 backdrop-blur-sm rounded-full shadow-md text-[#4A403A] dark:text-[#F3EFE0] transition-transform active:scale-90 opacity-0 group-hover:opacity-100">
                <Icons.Edit />
              </button>
            </div>
            <div className="p-3 flex flex-col flex-1">
              <div className="flex-1">
                <h4 className="font-bold text-sm text-[#4A403A] dark:text-[#F3EFE0] line-clamp-2 h-10">{product.title}</h4>
                <p className="text-[10px] text-[#B0A69D] dark:text-[#E6DCCF] uppercase mt-0.5">{product.category}</p>
              </div>
              <div className="flex justify-between items-end mt-2 pt-2 border-t border-[#F3EFE0] dark:border-[#2C2622]/50">
                <p className="text-[#C59D5F] font-bold text-md">₱{product.basePrice.toLocaleString()}</p>
                <button onClick={() => handleDelete(product._id)} className="text-red-400 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition active:scale-90">
                  <Icons.Trash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !showAddForm && !loading && (
        <div className="py-20 text-center text-[#B0A69D] dark:text-[#E6DCCF] opacity-70 flex flex-col items-center">
          <div className="mb-4 text-[#C59D5F] opacity-50 transform scale-150">
            <Icons.CakeSolid />
          </div>
          <p className="font-bold text-lg">Your catalog is empty.</p>
          <p className="text-xs mt-1">Tap "Add New Cake" to upload your first product!</p>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
