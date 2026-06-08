import React, { useEffect, useState } from 'react';
import { Book, CheckCircle2, AlertTriangle, Send, TrendingDown, Download } from 'lucide-react';
import axios from 'axios';
import Papa from 'papaparse';

const API_URL = 'http://localhost:5000/api/logbooks';

const Dashboard = ({ logBooks }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const totalBooks = logBooks.length;
  const totalQuantity = logBooks.reduce((sum, item) => sum + item.quantity, 0);
  const totalAvailable = logBooks.reduce((sum, item) => sum + item.available, 0);
  const totalIssued = totalQuantity - totalAvailable;

  const lowStockItems = logBooks.filter(item =>
    item.available <= item.reorderLevel && item.available > 0
  ).length;

  const outOfStockItems = logBooks.filter(item => item.available === 0).length;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${API_URL}/analytics/burnrate`);
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoadingAnalytics(false);
      }
    };
    fetchAnalytics();
  }, [logBooks]);

  const exportToCSV = () => {
    const data = logBooks.map(book => ({
      Name: book.name,
      Category: book.category,
      Color: book.color,
      'Total Stock': book.quantity,
      Available: book.available,
      'Reorder Level': book.reorderLevel,
      'Storage Location': book.storageLocation || '',
      Notes: book.notes || ''
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `logbook-inventory-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = [
    {
      label: 'Total Types',
      value: totalBooks,
      icon: Book,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: 'Unique log book models'
    },
    {
      label: 'Available Copies',
      value: totalAvailable,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      description: `In stock across all types`
    },
    {
      label: 'Issued Out',
      value: totalIssued,
      icon: Send,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      description: 'Currently with recipients'
    },
    {
      label: 'Stock Alerts',
      value: lowStockItems + outOfStockItems,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      description: `${outOfStockItems} empty, ${lowStockItems} low`
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</span>
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-[11px] text-gray-500 font-medium">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-5 h-5 text-amber-400" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Stock Prediction</p>
              </div>
              <h3 className="text-2xl font-black">Burn Rate Analysis</h3>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm font-bold"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {loadingAnalytics ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : analytics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1">Daily Burn Rate</p>
                  <p className="text-2xl font-black">{analytics.overallBurnRate}</p>
                  <p className="text-xs text-gray-400">items/day average</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1">Issued (30 Days)</p>
                  <p className="text-2xl font-black">{analytics.totalIssuedLast30Days}</p>
                  <p className="text-xs text-gray-400">total items issued</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-2">Days Until Stockout</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {analytics.bookPredictions.slice(0, 5).map((book) => (
                    <div key={book.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium truncate mr-4">{book.name}</span>
                      <span className={`text-sm font-black flex-shrink-0 ${
                        book.daysRemaining === '∞' ? 'text-gray-400' :
                        book.daysRemaining <= 7 ? 'text-red-400' :
                        book.daysRemaining <= 30 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {book.daysRemaining === '∞' ? '∞ days' : `${book.daysRemaining}d`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">No analytics data available</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingDown className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Quick Stats</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600">Total Inventory Value</span>
              <span className="text-lg font-black text-gray-900">{totalBooks} types</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600">Total Copies</span>
              <span className="text-lg font-black text-gray-900">{totalQuantity}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
              <span className="text-sm font-medium text-emerald-700">In Circulation</span>
              <span className="text-lg font-black text-emerald-700">{totalAvailable}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
              <span className="text-sm font-medium text-purple-700">Currently Issued</span>
              <span className="text-lg font-black text-purple-700">{totalIssued}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
