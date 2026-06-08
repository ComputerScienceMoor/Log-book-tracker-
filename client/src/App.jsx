import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, Search, SlidersHorizontal, Loader2, LayoutGrid, List,
  Package, AlertTriangle, Users as UsersIcon
} from 'lucide-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LogBookItem from './components/LogBookItem';
import LogBookForm from './components/LogBookForm';
import TransactionModal from './components/TransactionModal';
import HistoryModal from './components/HistoryModal';
import Login from './pages/Login';
import Users from './pages/Users';
import Profile from './pages/Profile';

const API_URL = 'http://localhost:5000/api/logbooks';

function App() {
  const { user, isAuthenticated, isAdmin, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [logBooks, setLogBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [selectedLogBook, setSelectedLogBook] = useState(null);

  const [viewType, setViewType] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [stockStatusTab, setStockStatusTab] = useState('All');

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogBooks();
    }
  }, [isAuthenticated]);

  const fetchLogBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setLogBooks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch log books. Is the server running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (selectedLogBook && !isTransactionOpen) {
        await axios.patch(`${API_URL}/${selectedLogBook._id}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      fetchLogBooks();
      setIsFormOpen(false);
      setSelectedLogBook(null);
    } catch (err) {
      alert('Error saving log book: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleTransaction = async (txData) => {
    try {
      if (!selectedLogBook) return;
      await axios.post(`${API_URL}/${selectedLogBook._id}/transactions`, {
        ...txData,
        username: user?.username || 'Unknown'
      });
      fetchLogBooks();
      setIsTransactionOpen(false);
      setSelectedLogBook(null);
    } catch (err) {
      alert('Error recording transaction: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${selectedLogBook._id}`);
      fetchLogBooks();
      setIsDeleteConfirmOpen(false);
      setSelectedLogBook(null);
    } catch (err) {
      alert('Error deleting log book: ' + (err.response?.data?.message || err.message));
    }
  };

  const categories = ['All', ...new Set(logBooks.map(item => item.category).filter(Boolean))];

  const filteredLogBooks = logBooks.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.storageLocation && item.storageLocation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;

    const isLow = item.available <= item.reorderLevel && item.available > 0;
    const isOut = item.available === 0;

    let matchesStatus = true;
    if (stockStatusTab === 'Low Stock') matchesStatus = isLow;
    if (stockStatusTab === 'Out of Stock') matchesStatus = isOut;
    if (stockStatusTab === 'In Stock') matchesStatus = !isLow && !isOut;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <Header user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard logBooks={logBooks} />

        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, location, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-gray-50 p-1 rounded-xl">
                <button
                  onClick={() => navigate('/')}
                  className={`p-2 rounded-lg transition-all ${location.pathname === '/' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Inventory"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => navigate('/users')}
                    className={`p-2 rounded-lg transition-all ${location.pathname === '/users' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    title="User Management"
                  >
                    <UsersIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="h-8 w-px bg-gray-100 hidden sm:block"></div>

              <div className="flex bg-gray-50 p-1 rounded-xl">
                <button
                  onClick={() => setViewType('grid')}
                  className={`p-2 rounded-lg transition-all ${viewType === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewType('list')}
                  className={`p-2 rounded-lg transition-all ${viewType === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <div className="h-8 w-px bg-gray-100 hidden sm:block"></div>

              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm font-bold text-gray-700 cursor-pointer pr-4"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    setSelectedLogBook(null);
                    setIsFormOpen(true);
                  }}
                  className="bg-gray-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-gray-200"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">New Log Book</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStockStatusTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  stockStatusTab === tab
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <Routes>
          <Route path="/" element={
            <>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-600" />
                  <p className="font-black text-gray-400 uppercase tracking-widest text-sm">Synchronizing Database</p>
                </div>
              ) : error ? (
                <div className="bg-white border-2 border-red-50 rounded-3xl p-12 text-center shadow-sm">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                  </div>
                  <p className="text-gray-900 font-black text-xl mb-2">Connection Failed</p>
                  <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">{error}</p>
                  <button
                    onClick={fetchLogBooks}
                    className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
                  >
                    Try to Reconnect
                  </button>
                </div>
              ) : filteredLogBooks.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] p-24 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-gray-200" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Inventory is Empty</h3>
                  <p className="text-gray-400 font-medium max-w-xs mx-auto mb-8">
                    {searchQuery || filterCategory !== 'All' || stockStatusTab !== 'All'
                      ? "No log books match your current filter settings."
                      : isAdmin ? "You haven't added any log books yet. Let's get started!"
                      : "No log books available."}
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => setIsFormOpen(true)}
                      className="px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-2xl font-black hover:bg-gray-900 hover:text-white transition-all uppercase tracking-tighter"
                    >
                      Add First Item
                    </button>
                  )}
                </div>
              ) : viewType === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLogBooks.map(book => (
                    <LogBookItem
                      key={book._id}
                      logBook={book}
                      viewType="grid"
                      isAdmin={isAdmin}
                      onEdit={(item) => { setSelectedLogBook(item); setIsFormOpen(true); }}
                      onDelete={(id) => { setSelectedLogBook({ _id: id }); setIsDeleteConfirmOpen(true); }}
                      onTransaction={(item) => { setSelectedLogBook(item); setIsTransactionOpen(true); }}
                      onHistory={(item) => { setSelectedLogBook(item); setIsHistoryOpen(true); }}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Log Book</th>
                          <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Location</th>
                          <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                          <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Stock</th>
                          <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLogBooks.map(book => (
                          <LogBookItem
                            key={book._id}
                            logBook={book}
                            viewType="list"
                            isAdmin={isAdmin}
                            onEdit={(item) => { setSelectedLogBook(item); setIsFormOpen(true); }}
                            onDelete={(id) => { setSelectedLogBook({ _id: id }); setIsDeleteConfirmOpen(true); }}
                            onTransaction={(item) => { setSelectedLogBook(item); setIsTransactionOpen(true); }}
                            onHistory={(item) => { setSelectedLogBook(item); setIsHistoryOpen(true); }}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          } />
          {isAdmin && <Route path="/users" element={<Users />} />}
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      {isFormOpen && isAdmin && (
        <LogBookForm
          onSubmit={handleCreateOrUpdate}
          initialData={selectedLogBook}
          onClose={() => { setIsFormOpen(false); setSelectedLogBook(null); }}
        />
      )}

      {isTransactionOpen && (
        <TransactionModal
          logBook={selectedLogBook}
          userRole={user?.role}
          onSubmit={handleTransaction}
          onClose={() => { setIsTransactionOpen(false); setSelectedLogBook(null); }}
        />
      )}

      {isHistoryOpen && (
        <HistoryModal
          logBook={selectedLogBook}
          onClose={() => { setIsHistoryOpen(false); setSelectedLogBook(null); }}
        />
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Delete Permanently?</h3>
              <p className="text-gray-500 font-medium mb-8">
                This will remove the log book and its entire transaction history. This action cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDelete}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all uppercase tracking-tighter"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => { setIsDeleteConfirmOpen(false); setSelectedLogBook(null); }}
                  className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl font-black hover:bg-gray-100 transition-all uppercase tracking-tighter"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
