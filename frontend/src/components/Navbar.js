import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold">🌾 Farm Connect</Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/crops" className="hover:text-accent transition">Crops</Link>
            <Link to="/forum" className="hover:text-accent transition">Forum</Link>
            <Link to="/orders" className="hover:text-accent transition">Orders</Link>
            <Link to="/alerts" className="hover:text-accent transition">🔔 Alerts</Link>
            {token ? (
              <>
                <Link to="/profile" className="hover:text-accent transition">
                  👤 {user.username || 'Profile'}
                </Link>
                {user.role === 'admin' && (
      <Link to="/admin" className="hover:text-accent transition">📊 Admin</Link>
    )}
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-accent transition">Login</Link>
                <Link to="/register" className="bg-accent text-primary px-4 py-2 rounded hover:bg-yellow-400">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;