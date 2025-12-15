import React, { useState, useEffect, useContext } from 'react';
import { orderAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderAPI.getMyOrders();
        console.log('Orders data:', res.data);
        setOrders(res.data || []);
      } catch (err) {
        console.error('Fetch orders error:', err);
        setError('Failed to load orders. Please make sure you are logged in.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'shipped': return 'bg-blue-500';
      case 'delivered': return 'bg-green-600';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl text-primary animate-pulse mb-4">Loading your orders... 🛒</p>
          <p className="text-xl text-gray-600">Fetching from the farm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-red-50 p-10 rounded-3xl border-2 border-red-200 shadow-2xl">
          <p className="text-2xl text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-white px-10 py-4 rounded-xl text-xl font-bold hover:bg-green-700 shadow-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">🛒 My Orders</h1>
          <p className="text-2xl text-gray-600">
            {user?.role === 'farmer' ? 'Orders received from buyers' : 'Your purchase history'}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl shadow-2xl">
            <div className="text-8xl mb-8">📦</div>
            <p className="text-4xl text-gray-600 mb-6">No orders yet!</p>
            <p className="text-2xl text-gray-500 mb-10">
              {user?.role === 'farmer' 
                ? 'Your crops will appear here when buyers place orders' 
                : 'Visit the Crops page and place your first order'}
            </p>
            {user?.role !== 'farmer' && (
              <a 
                href="/crops" 
                className="bg-primary text-white px-12 py-6 rounded-2xl text-2xl font-bold hover:bg-green-700 shadow-xl transition inline-block"
              >
                Browse Fresh Crops 🌽
              </a>
            )}
          </div>
        ) : (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 hover:shadow-3xl transition duration-300"
              >
                {order.image_path && (
                  <img
                    src={`http://localhost:5000${order.image_path}`}
                    alt={order.crop_name}
                    className="w-full h-72 object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="p-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="text-2xl font-bold text-primary">{order.order_number || `ORD-${String(order.id).padStart(6, '0')}`}</p>
                    </div>
                    <span className={`px-6 py-3 rounded-full text-white font-bold ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-3xl font-bold text-primary mb-4">{order.crop_name}</h3>

                  <div className="space-y-4 text-lg">
                    <p>
                      <span className="font-semibold">Quantity:</span> {order.quantity} units
                    </p>
                    <p>
                      <span className="font-semibold">Unit Price:</span> ₹{order.unit_price || (order.total_price / order.quantity).toFixed(2)}
                    </p>
                    <p>
                      <span className="font-semibold text-2xl">Total Amount:</span>{' '}
                      <span className="text-3xl font-bold text-accent">₹{order.total_price}</span>
                    </p>
                    {user?.role === 'farmer' && order.buyer_name && (
                      <p>
                        <span className="font-semibold">Buyer:</span> {order.buyer_name}
                      </p>
                    )}
                    {user?.role !== 'farmer' && order.farmer_name && (
                      <p>
                        <span className="font-semibold">Seller:</span> {order.farmer_name}
                      </p>
                    )}
                  </div>

                  <p className="text-center text-gray-600 mt-8 text-lg">
                    Ordered on: <strong>{new Date(order.created_at).toLocaleDateString()}</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;