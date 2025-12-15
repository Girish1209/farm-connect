import React, { useState, useEffect, useContext } from 'react';
import { cropAPI, orderAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import WeatherWidget from '../components/WeatherWidget';


const Crops = () => {
  const { user } = useContext(AuthContext);
  const [crops, setCrops] = useState([]);
  const [myCrops, setMyCrops] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);

  const isFarmer = user?.role === 'farmer';

  // Helper function
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'vegetable': return 'bg-green-100 text-green-800';
      case 'fruit': return 'bg-red-100 text-red-800';
      case 'grain': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch all crops
  useEffect(() => {
    fetchCrops();
  }, [page, search, category]);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const res = await cropAPI.getAll(page, search, category);
      setCrops(res.data || []);
    } catch (err) {
      console.error('Crop load error:', err);
      alert('Failed to load crops. Check console.');
    }
    setLoading(false);
  };

  // MOVED OUTSIDE useEffect – now accessible everywhere!
  const fetchMyCrops = async () => {
    if (!user?.id) return;
    try {
      const res = await cropAPI.getAll(1, '', '');
      const allCrops = res.data || [];
      const owned = allCrops.filter(c => c.farmer_id === user.id);
      setMyCrops(owned);
    } catch (err) {
      console.error('My crops fetch error:', err);
    }
  };

  // Fetch farmer's own crops on login
  useEffect(() => {
    if (isFarmer) {
      fetchMyCrops();
    }
  }, [isFarmer, user]);

  const handleOrder = async (cropId, price) => {
    const quantityInput = prompt(`How many? (₹${price}/unit)`);
    const quantity = parseInt(quantityInput);
    if (!quantityInput || isNaN(quantity) || quantity <= 0) return;

    try {
      await orderAPI.placeOrder({ crop_id: cropId, quantity });
      alert('Order placed! Check email 📧');
      fetchCrops();
      if (isFarmer) fetchMyCrops(); // Update farmer dashboard
    } catch (err) {
      alert('Order failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">🌾 Fresh From Farm</h1>
          <p className="text-2xl text-gray-600">Direct from farmers to you</p>
        </div>

        {/* ADD WEATHER WIDGET HERE – BEAUTIFUL PLACEMENT */}
<div className="mb-20">
  <WeatherWidget />
</div>

        {/* Farmer Dashboard */}
        {isFarmer && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-primary">My Crops Dashboard</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-green-700 shadow-lg"
              >
                + Add New Crop
              </button>
            </div>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">{myCrops.length}</p>
                <p className="text-xl text-gray-600">Total Crops</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-accent">₹{myCrops.reduce((sum, c) => sum + (c.price * c.quantity_available), 0).toFixed(2)}</p>
                <p className="text-xl text-gray-600">Inventory Value</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-green-600">{myCrops.reduce((sum, c) => sum + c.quantity_available, 0)}</p>
                <p className="text-xl text-gray-600">Total Stock</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          <input
            type="text"
            placeholder="🔍 Search crops (e.g., tomato)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-8 py-4 border-2 rounded-2xl w-96 focus:border-primary outline-none text-lg"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-8 py-4 border-2 rounded-2xl focus:border-primary outline-none text-lg"
          >
            <option value="">All Categories</option>
            <option value="vegetable">Vegetables</option>
            <option value="fruit">Fruits</option>
            <option value="grain">Grains</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Add Form */}
        {showAddForm && isFarmer && (
          <AddCropForm
            onSuccess={() => {
              fetchCrops();
              fetchMyCrops(); // Now works because it's defined!
            }}
            onClose={() => setShowAddForm(false)}
          />
        )}

        {/* Crops Grid */}
        {loading ? (
          <div className="text-center py-20">Loading fresh crops... 🌱</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {crops.map((crop) => (
              <div key={crop.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2">
                <img
                  src={`http://localhost:5000${crop.image_path}`}
                  alt={crop.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => { e.target.src = 'dp.jpg'; }}
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-primary">{crop.name}</h3>
                  <p className="text-gray-600 mt-2">{crop.description}</p>
                  <div className="flex justify-between items-center mt-6">
                    <span className="text-3xl font-bold text-accent">₹{crop.price}</span>
                    <span className="text-lg text-gray-600">Stock: {crop.quantity_available}</span>
                  </div>
                  <button
                    onClick={() => handleOrder(crop.id, crop.price)}
                    disabled={crop.quantity_available === 0}
                    className={`w-full mt-6 py-3 rounded-lg text-white font-bold transition ${
                      crop.quantity_available === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary hover:bg-green-700'
                    }`}
                  >
                    {crop.quantity_available === 0 ? 'Sold Out' : 'Buy Now 🛒'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}



        {/* Pagination */}
        <div className="flex justify-center mt-12 space-x-4">
          <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-6 py-3 bg-primary text-white rounded-lg disabled:bg-gray-400">
            Previous
          </button>
          <span className="text-xl font-bold">Page {page}</span>
          <button onClick={() => setPage(page + 1)} className="px-6 py-3 bg-primary text-white rounded-lg">
            Next
          </button>
        </div>

      



        {/* Crop Detail Modal */}
        {selectedCrop && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-6"
            onClick={() => setSelectedCrop(null)}
          >
            <div
              className="bg-white rounded-3xl shadow-3xl max-w-5xl w-full max-h-screen overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`http://localhost:5000${selectedCrop.image_path || '/placeholder.jpg'}`}
                alt={selectedCrop.name}
                className="w-full h-96 object-cover rounded-t-3xl"
              />
              <div className="p-12">
                <h2 className="text-5xl font-bold text-primary mb-6">{selectedCrop.name}</h2>
                <div className="flex items-center gap-4 mb-8">
                  <span className={`px-6 py-3 rounded-full text-lg font-bold ${getCategoryColor(selectedCrop.category)}`}>
                    {selectedCrop.category?.toUpperCase() || 'OTHER'}
                  </span>
                  <p className="text-2xl text-gray-600">
                    by <strong>{selectedCrop.farmer_name}</strong>
                  </p>
                </div>
                <p className="text-2xl text-gray-800 mb-10 leading-relaxed">{selectedCrop.description || 'No description available.'}</p>
                <div className="grid grid-cols-2 gap-12 mb-12">
                  <div>
                    <p className="text-5xl font-bold text-accent">₹{selectedCrop.price}</p>
                    <p className="text-2xl text-gray-600">per unit</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-green-600">{selectedCrop.quantity_available}</p>
                    <p className="text-2xl text-gray-600">units available</p>
                    {selectedCrop.quantity_available < 10 && selectedCrop.quantity_available > 0 && (
                      <p className="text-red-600 text-2xl font-bold mt-4">Hurry – Low Stock!</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleOrder(selectedCrop.id, selectedCrop.price)}
                  disabled={selectedCrop.quantity_available === 0}
                  className={`w-full py-8 rounded-3xl text-3xl font-bold transition shadow-2xl ${
                    selectedCrop.quantity_available === 0
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-green-700'
                  }`}
                >
                  {selectedCrop.quantity_available === 0 ? 'Sold Out' : 'Buy Now 🛒'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add/Edit Crop Form
const AddCropForm = ({ onSuccess, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('quantity_available', quantity);
    if (image) formData.append('image', image);

    try {
      await cropAPI.addCrop(formData);
      alert('Crop added successfully! 🌱');
      onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to add crop: ' + (err.response?.data?.msg || 'Try again'));
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-12 mb-16">
      <h2 className="text-4xl font-bold text-primary mb-10 text-center">Add New Crop</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <input
          type="text"
          placeholder="Crop Name (e.g., Tomato)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="px-8 py-5 border-2 rounded-2xl text-xl focus:border-primary outline-none"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price per unit (₹)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="px-8 py-5 border-2 rounded-2xl text-xl focus:border-primary outline-none"
        />
        <input
          type="number"
          placeholder="Available Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          className="px-8 py-5 border-2 rounded-2xl text-xl focus:border-primary outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-8 py-5 border-2 rounded-2xl text-xl focus:border-primary outline-none"
        >
          <option value="vegetable">Vegetable</option>
          <option value="fruit">Fruit</option>
          <option value="grain">Grain</option>
          <option value="other">Other</option>
        </select>
        <textarea
          placeholder="Description (quality, freshness, etc.)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
          className="md:col-span-2 px-8 py-6 border-2 rounded-2xl text-xl focus:border-primary outline-none"
        />
        <div className="md:col-span-2">
          <label className="block text-xl font-semibold mb-4">Upload Crop Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setImage(file);
                setPreview(URL.createObjectURL(file));
              }
            }}
            required
            className="block w-full text-lg file:mr-6 file:py-4 file:px-8 file:rounded-xl file:border-0 file:text-lg file:font-semibold file:bg-primary file:text-white hover:file:bg-green-700"
          />
          {preview && (
            <img src={preview} alt="Preview" className="mt-8 max-h-96 rounded-2xl shadow-xl mx-auto" />
          )}
        </div>
        <div className="md:col-span-2 flex justify-center gap-8 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-12 py-5 bg-gray-500 text-white rounded-2xl text-xl font-bold hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-12 py-5 bg-primary text-white rounded-2xl text-xl font-bold hover:bg-green-700 shadow-xl transition"
          >
            Add Crop
          </button>
        </div>
      </form>
    </div>
  );
};

export default Crops;