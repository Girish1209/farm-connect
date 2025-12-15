import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, loadUser } = useContext(AuthContext); // Get loadUser
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', bio: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({ username: user.username || '', bio: user.bio || '' });
      setLoading(false);
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', formData);
      await loadUser(); // Reload full profile
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    const formData = new FormData();
    formData.append('profile_pic', file);

    try {
      await api.post('/users/profile/pic', formData);
      toast.success('Profile picture updated!');
      await loadUser(); // Critical – reload user with new photo
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  if (loading || !user) return <div className="text-center py-20 text-2xl">Loading profile... 👤</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary text-center mb-12">👤 My Profile</h1>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-green-600 h-32"></div>

          <div className="relative px-10 pb-10 -mt-16">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={user?.profile_pic 
                    ? `http://localhost:5000${user.profile_pic}` 
                    : 'https://via.placeholder.com/160?text=No+Photo'
                  }
                  alt="Profile"
                  className="w-40 h-40 rounded-full border-8 border-white shadow-2xl object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-accent text-white p-4 rounded-full cursor-pointer hover:bg-yellow-500 transition text-2xl">
                  📷
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              <h2 className="text-3xl font-bold mt-6">{user.username}</h2>
              <p className="text-xl text-gray-600">{user.email}</p>
              <p className="mt-4 px-8 py-3 bg-primary text-white rounded-full text-xl font-bold">
                {user.role.toUpperCase()}
              </p>
              {user.role === 'farmer' && <p className="mt-6 text-2xl text-accent">🌾 You can add crops!</p>}
              {user.role === 'admin' && <p className="mt-6 text-2xl text-accent">👑 Admin Access</p>}
            </div>

            <div className="mt-12 bg-gray-50 rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-primary">About Me (Bio)</h3>
                <button
                  onClick={() => setEditing(!editing)}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  {editing ? 'Cancel' : 'Edit Bio'}
                </button>
              </div>

              {editing ? (
                <form onSubmit={handleUpdate} className="space-y-6">
                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-primary outline-none text-lg"
                    required
                  />
                  <textarea
                    placeholder="Write your bio..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows="5"
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-primary outline-none text-lg"
                  />
                  <button type="submit" className="bg-accent text-primary font-bold px-8 py-4 rounded-xl hover:bg-yellow-500 transition text-lg">
                    Save Changes
                  </button>
                </form>
              ) : (
                <p className="text-lg text-gray-700 leading-relaxed">
                  {user.bio || 'No bio added yet. Click "Edit Bio" to tell us about yourself! 🌱'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;