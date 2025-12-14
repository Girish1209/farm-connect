import React, { useState, useEffect, useContext } from 'react';
import { cropAPI, orderAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Crops = () => {
  const { user } = useContext(AuthContext);
  const [crops, setCrops] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const isFarmer = user?.role === 'farmer'; // We'll set role properly later

  useEffect(() => {
    fetchCrops();
  }, [page, search]);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const res = await cropAPI.getAll(page, search);
      setCrops(res.data);
    } catch (err) {
      alert('Failed to load crops');
    }
    setLoading(false);
  };

  const handleOrder = async (cropId, price) => {
    const quantity = prompt(`How many do you want? (Price: ₹${price} each)`);
    if (!quantity || isNaN(quantity) || quantity <= 0) return;

    try {
      await orderAPI.placeOrder({ crop_id: cropId, quantity: parseInt(quantity) });
      alert('Order placed successfully! 📧 Check your email!');
      fetchCrops(); // Refresh stock
    } catch (err) {
      alert('Order failed: ' + (err.response?.data?.msg || ''));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">🛒 Available Crops</h1>
          {isFarmer && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-700 transition text-lg"
            >
              + Add New Crop
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="🔍 Search crops (e.g., tomato)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-6 py-3 border border-gray-300 rounded-full mb-8 focus:outline-none focus:border-primary"
        />

        {showAddForm && isFarmer && <AddCropForm onSuccess={fetchCrops} onClose={() => setShowAddForm(false)} />}

        {loading ? (
          <div className="text-center py-20">Loading fresh crops... 🌱</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {crops.map((crop) => (
              <div key={crop.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2">
                <img
                  src={`http://localhost:5000${crop.image_path}`}
                  alt={crop.name}
                  className="w-full h-64 object-cover"
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

        <div className="flex justify-center mt-12 space-x-4">
          <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-6 py-3 bg-primary text-white rounded-lg disabled:bg-gray-400">
            Previous
          </button>
          <span className="text-xl font-bold">Page {page}</span>
          <button onClick={() => setPage(page + 1)} className="px-6 py-3 bg-primary text-white rounded-lg">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Crop Form Component
const AddCropForm = ({ onSuccess, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('quantity_available', quantity);
    if (image) formData.append('image', image);

    try {
      await cropAPI.addCrop(formData);
      alert('Crop added successfully! 🌱');
      onSuccess();
      onClose();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.msg || ''));
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl mb-12">
      <h2 className="text-3xl font-bold text-primary mb-6">Add New Crop</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <input placeholder="Crop Name" value={name} onChange={(e) => setName(e.target.value)} required className="px-4 py-3 border rounded-lg" />
        <input type="number" placeholder="Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} required className="px-4 py-3 border rounded-lg" />
        <input type="number" placeholder="Quantity Available" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="px-4 py-3 border rounded-lg" />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required className="col-span-2" />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-2 px-4 py-3 border rounded-lg h-32" />
        <div className="col-span-2 flex space-x-4">
          <button type="submit" className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-green-700">Add Crop</button>
          <button type="button" onClick={onClose} className="bg-gray-500 text-white px-8 py-3 rounded-lg">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default Crops;