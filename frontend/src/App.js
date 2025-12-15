import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Crops from './pages/Crops';
import Forum from './pages/Forum';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoutes';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Alerts from './pages/Alerts';


let socket;

function AppContent() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      socket = io('http://localhost:5000');

      socket.on('connect', () => {
        console.log('Socket.io Connected! ⚡');
      });

      socket.on('newComment', (comment) => {
        toast.success(
          `New comment: "${comment.content.substring(0, 30)}..." by ${comment.username}`
        );
      });

      socket.on('newAlert', (alert) => {
        toast(alert.message, {
          icon: '⚠️',
          style: {
            background: '#FFD700',
            color: '#228B22',
          },
        });
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/crops" element={<Crops />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin" element={
    <ProtectedRoute requiredRole="admin">
        <Admin />
    </ProtectedRoute>
} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
 
            <Route path="/alerts" element={<Alerts />} />
            
            
            <Route
              path="/"
              element={
                <div className="text-center py-20">
                  <h1 className="text-5xl font-bold text-green-600">
                    Welcome to Farm Connect! 🌾
                  </h1>
                </div>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
