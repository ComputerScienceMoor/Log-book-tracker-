import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users as UsersIcon, Shield, ShieldAlert, UserX, UserCheck, 
  Loader2, Search, Mail, Calendar, ShieldCheck, Trash2
} from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/auth/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users. Access denied or server error.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'Admin' ? 'Staff' : 'Admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    try {
      setActionLoading(userId);
      await axios.patch(`http://localhost:5000/api/auth/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Error updating role: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    if (!window.confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this user?`)) return;

    try {
      setActionLoading(userId);
      await axios.patch(`http://localhost:5000/api/auth/users/${userId}/status`, { isActive: newStatus });
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: newStatus } : u));
    } catch (err) {
      alert('Error updating status: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;

    try {
      setActionLoading(userId);
      await axios.delete(`http://localhost:5000/api/auth/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert('Error deleting user: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-600" />
        <p className="font-black text-gray-400 uppercase tracking-widest text-sm">Loading User Directory</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border-2 border-red-50 rounded-3xl p-12 text-center shadow-sm max-w-2xl mx-auto">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <p className="text-gray-900 font-black text-xl mb-2">Access Denied</p>
        <p className="text-gray-500 font-medium mb-8">{error}</p>
        <button 
          onClick={fetchUsers}
          className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <UsersIcon className="w-8 h-8 text-blue-600" />
            User Management
          </h2>
          <p className="text-gray-500 font-medium">Manage access and roles for all staff members</p>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">User Identity</th>
                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Role & Access</th>
                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Join Date</th>
                <th className="py-5 px-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map(user => (
                <tr key={user._id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-inner ${user.isActive ? 'bg-gray-900' : 'bg-gray-300'}`}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-black text-gray-900 ${!user.isActive && 'text-gray-400 line-through'}`}>{user.username}</p>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${
                        user.role === 'Admin' ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-gray-500 bg-gray-50 border-gray-100'
                      }`}>
                        {user.role === 'Admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        {user.role}
                      </div>
                      {!user.isActive && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 border-red-100">
                          Deactivated
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-bold">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleRole(user._id, user.role)}
                        disabled={actionLoading === user._id}
                        className={`p-2 rounded-xl transition-all ${
                          user.role === 'Admin' 
                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                            : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                        }`}
                        title={user.role === 'Admin' ? "Demote to Staff" : "Promote to Admin"}
                      >
                        {actionLoading === user._id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Shield className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                        disabled={actionLoading === user._id}
                        className={`p-2 rounded-xl transition-all ${
                          user.isActive 
                            ? 'text-gray-400 bg-gray-50 hover:text-red-600 hover:bg-red-50' 
                            : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                        title={user.isActive ? "Deactivate User" : "Activate User"}
                      >
                        {actionLoading === user._id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : user.isActive ? (
                          <UserX className="w-5 h-5" />
                        ) : (
                          <UserCheck className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={actionLoading === user._id}
                        className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete User Permanently"
                      >
                        {actionLoading === user._id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
