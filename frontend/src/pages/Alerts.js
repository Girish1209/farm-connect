import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Alerts = () => {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ message: '', type: 'other', priority: 'normal' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  const canCreate = user && (user.role === 'farmer' || user.role === 'admin');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      const allAlerts = res.data;
      setAlerts(allAlerts);
      // Simple unread simulation (in real app, track per user)
      setUnreadCount(allAlerts.filter(a => !a.is_read).length);
    } catch (err) {
      toast.error('Failed to load alerts');
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('message', formData.message);
    data.append('type', formData.type);
    data.append('priority', formData.priority);
    if (image) data.append('image', image);

    try {
      await api.post('/alerts', data);
      toast.success('Alert posted!');
      setFormData({ message: '', type: 'other', priority: 'normal' });
      setImage(null);
      setImagePreview(null);
      setShowForm(false);
      fetchAlerts();
    } catch (err) {
      toast.error('Failed to post');
    }
  };

    const getIcon = (type) => {
    switch (type) {
      case 'weather': return '🌧️';
      case 'market': return '📈';
      case 'pest': return '🐛';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'normal': return 'border-yellow-500 bg-yellow-50';
      case 'info': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesSearch = alert.message.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">🔔 Farm Alerts Hub</h1>
          <p className="text-xl text-gray-600">Critical updates for weather, pests, and market prices</p>
          {unreadCount > 0 && <span className="ml-4 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold">{unreadCount} Unread</span>}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <input
            type="text"
            placeholder="🔍 Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-6 py-3 border-2 rounded-xl w-80 focus:border-primary outline-none"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-6 py-3 border-2 rounded-xl focus:border-primary outline-none"
          >
            <option value="all">All Types</option>
            <option value="weather">Weather</option>
            <option value="market">Market</option>
            <option value="pest">Pest</option>
            <option value="other">Other</option>
          </select>
        </div>

        {canCreate && (
          <div className="text-center mb-12">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-green-700 shadow-xl transition"
            >
              {showForm ? 'Cancel' : '+ Broadcast New Alert'}
            </button>
          </div>
        )}

        {/* Create Form */}
        {showForm && canCreate && (
          <div className="bg-white rounded-3xl shadow-2xl p-10 mb-12">
            <h2 className="text-3xl font-bold text-primary mb-8">Post New Alert</h2>
            <form onSubmit={handleCreate} className="space-y-8">
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Alert message (e.g., Heavy rain expected tomorrow in Punjab)"
                rows="5"
                required
                className="w-full px-8 py-6 border-2 rounded-2xl focus:border-primary outline-none text-lg"
              />
              <div className="grid grid-cols-2 gap-8">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="px-8 py-4 border-2 rounded-2xl focus:border-primary outline-none text-lg"
                >
                  <option value="other">General</option>
                  <option value="weather">Weather</option>
                  <option value="market">Market Price</option>
                  <option value="pest">Pest/Disease</option>
                </select>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="px-8 py-4 border-2 rounded-2xl focus:border-primary outline-none text-lg"
                >
                  <option value="info">Info</option>
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent (Red)</option>
                </select>
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setImage(e.target.files[0]);
                      setImagePreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="block w-full text-lg"
                />
                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 max-h-64 rounded-xl" />}
              </div>
              <button type="submit" className="bg-accent text-primary font-bold px-12 py-5 rounded-2xl hover:bg-yellow-500 text-2xl transition shadow-xl">
                Broadcast Alert
              </button>
            </form>
          </div>
        )}

        {/* Alerts List */}
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl shadow-2xl">
            <p className="text-6xl mb-6">🌱</p>
            <p className="text-4xl text-gray-500">All clear!</p>
            <p className="text-xl text-gray-600 mt-4">No matching alerts right now</p>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className={`rounded-3xl shadow-2xl overflow-hidden border-l-8 ${getPriorityColor(alert.priority)} transition hover:shadow-3xl`}>
                {alert.image_path && (
                  <img src={`http://localhost:5000${alert.image_path}`} alt="Alert" className="w-full h-96 object-cover" />
                )}
                <div className="p-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-6">
                      <span className="text-6xl">{getIcon(alert.type)}</span>
                      <div>
                        <span className="text-3xl font-bold text-primary">{alert.type.toUpperCase()} • {alert.priority.toUpperCase()}</span>
                        <p className="text-lg text-gray-600">
                          by <strong>{alert.username}</strong> • {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-2xl text-gray-800 leading-relaxed">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;