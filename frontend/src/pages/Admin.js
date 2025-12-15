import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Admin = () => {
  const [stats, setStats] = useState({ 
    totalUsers: 0, activeCrops: 0, ordersToday: 0, 
    revenueToday: 0, totalRevenue: 0 
  });
  const [topCrops, setTopCrops] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [statsRes, topRes, ordersRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/top-crops'),
          api.get('/admin/recent-orders'),
          api.get('/admin/users')
        ]);
        setStats(statsRes.data);
        setTopCrops(topRes.data);
        setRecentOrders(ordersRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        alert('Error loading admin data – check if logged in as admin');
      }
      setLoading(false);
    };
    fetchAllData();
  }, []);

  if (loading) return <div className="text-center py-32 text-4xl text-primary">Loading Admin Dashboard... 📊</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-primary text-center mb-12">👑 Admin Control Center</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center transform hover:scale-105 transition">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-gray-700">Total Users</h3>
            <p className="text-5xl text-primary font-bold mt-4">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center transform hover:scale-105 transition">
            <div className="text-5xl mb-4">🌾</div>
            <h3 className="text-2xl font-bold text-gray-700">Active Crops</h3>
            <p className="text-5xl text-green-600 font-bold mt-4">{stats.activeCrops}</p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center transform hover:scale-105 transition">
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="text-2xl font-bold text-gray-700">Orders Today</h3>
            <p className="text-5xl text-blue-600 font-bold mt-4">{stats.ordersToday}</p>
            <p className="text-2xl text-accent mt-2">₹{stats.revenueToday.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center transform hover:scale-105 transition">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-gray-700">Total Revenue</h3>
            <p className="text-5xl text-accent font-bold mt-4">₹{stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Top Crops Chart */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 mb-16">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">🥇 Top Selling Crops</h2>
          {topCrops.length === 0 ? (
            <p className="text-center text-gray-600 py-12 text-2xl">No sales yet – waiting for first orders!</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topCrops}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Bar dataKey="total_revenue" fill="#228B22" name="Revenue (₹)" />
                <Bar dataKey="total_sold" fill="#90EE90" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 mb-16">
          <h2 className="text-3xl font-bold text-primary mb-8">📦 Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-xl">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Crop</th>
                    <th className="p-4">Buyer</th>
                    <th className="p-4">Qty</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">#{order.id}</td>
                      <td className="p-4 font-semibold">{order.crop_name}</td>
                      <td className="p-4">{order.buyer_name}</td>
                      <td className="p-4 text-center">{order.quantity}</td>
                      <td className="p-4 text-accent font-bold">₹{order.total_price}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-white text-sm ${
                          order.status === 'delivered' ? 'bg-green-600' :
                          order.status === 'shipped' ? 'bg-blue-600' :
                          'bg-yellow-500'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <h2 className="text-3xl font-bold text-primary mb-8">👥 Platform Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-4">Username</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-semibold">{user.username}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-4 py-1 rounded-full text-white ${
                        user.role === 'admin' ? 'bg-purple-600' :
                        user.role === 'farmer' ? 'bg-green-600' :
                        'bg-blue-600'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;