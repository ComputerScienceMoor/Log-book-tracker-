import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Clock, User, Hash, Info, Send, RotateCcw, PlusCircle, Settings2, PenTool } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/logbooks';

const HistoryModal = ({ logBook, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${API_URL}/${logBook._id}/transactions`);
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [logBook._id]);

  const getIcon = (type) => {
    switch (type) {
      case 'Issue Out': return Send;
      case 'Return': return RotateCcw;
      case 'Add Stock': return PlusCircle;
      default: return Settings2;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'Issue Out': return 'text-blue-600 bg-blue-50';
      case 'Return': return 'text-emerald-600 bg-emerald-50';
      case 'Add Stock': return 'text-purple-600 bg-purple-50';
      default: return 'text-amber-600 bg-amber-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Transaction History</h2>
            <p className="text-xs text-gray-500 font-medium">{logBook.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No transactions recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((tx) => {
                const Icon = getIcon(tx.type);
                const colorClass = getColor(tx.type);
                return (
                  <div key={tx._id} className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{tx.type}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            {new Date(tx.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-black ${
                          tx.type === 'Issue Out' ? 'text-blue-600' :
                          tx.type === 'Return' || tx.type === 'Add Stock' ? 'text-emerald-600' : 'text-gray-600'
                        }`}>
                          {tx.type === 'Issue Out' ? '-' : '+'}{tx.quantityChange}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {tx.recipient && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium truncate">{tx.recipient}</span>
                        </div>
                      )}
                      {tx.createdBy && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="font-medium truncate">{tx.createdBy.username} ({tx.createdBy.role})</span>
                        </div>
                      )}
                    </div>

                    {tx.signature && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          <PenTool className="w-4 h-4" />
                          Signature
                        </div>
                        <div className="border-2 border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                          <img src={tx.signature} alt="Signature" className="h-24 w-full object-contain" />
                        </div>
                      </div>
                    )}

                    {tx.notes && (
                      <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                        <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="italic text-xs">{tx.notes}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
