import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Lock, Shield, Save, Loader2, AlertCircle, CheckCircle2,
  KeyRound
} from 'lucide-react';

const Profile = () => {
  const { user, isAdmin } = useAuth();
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [passMessage, setPassMessage] = useState(null);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await axios.patch('http://localhost:5000/api/auth/profile', profileData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // Update local storage user data
      const savedUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...savedUser, ...response.data }));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error updating profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPassMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setPassLoading(true);
    setPassMessage(null);
    try {
      await axios.patch('http://localhost:5000/api/auth/profile/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPassMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassMessage({ type: 'error', text: err.response?.data?.message || 'Error updating password' });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <User className="w-8 h-8 text-blue-600" />
          My Profile
        </h2>
        <p className="text-gray-500 font-medium">Manage your personal information and security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
            <div className="w-24 h-24 bg-gray-900 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-xl mx-auto mb-4">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-black text-gray-900">{user?.username}</h3>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 border-blue-100 mt-2">
              <Shield className="w-3 h-3" />
              {user?.role}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          {/* General Information */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h4 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-400" />
              General Information
            </h4>

            {message && (
              <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border ${
                message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-sm font-bold">{message.text}</p>
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </button>
            </form>
          </div>

          {/* Security */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h4 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-gray-400" />
              Security & Password
            </h4>

            {passMessage && (
              <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border ${
                passMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
              }`}>
                {passMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-sm font-bold">{passMessage.text}</p>
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-50"
              >
                {passLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound className="w-5 h-5" />}
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
