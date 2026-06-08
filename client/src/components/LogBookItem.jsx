import React from 'react';
import { Edit2, Trash2, MapPin, AlertCircle, CheckCircle2, History, ArrowRightLeft, Package } from 'lucide-react';

const LogBookItem = ({ logBook, onEdit, onDelete, onTransaction, onHistory, viewType, isAdmin = false }) => {
  const isLowStock = logBook.available <= logBook.reorderLevel && logBook.available > 0;
  const isOutOfStock = logBook.available === 0;

  const status = isOutOfStock 
    ? { label: 'Out of Stock', color: 'text-red-600 bg-red-50 border-red-100', icon: AlertCircle }
    : isLowStock 
    ? { label: 'Low Stock', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: AlertCircle }
    : { label: 'In Stock', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2 };

  const StatusIcon = status.icon;

  if (viewType === 'list') {
    return (
      <tr className="hover:bg-gray-50/50 transition-colors group border-b border-gray-100">
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-sm"
              style={{ backgroundColor: logBook.color }}
            >
              {logBook.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900">{logBook.name}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{logBook.category}</p>
            </div>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-1.5 text-gray-500">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">{logBook.storageLocation || 'N/A'}</span>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex flex-col">
            <span className="text-sm font-black text-gray-900">{logBook.available} / {logBook.quantity}</span>
            <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${(logBook.available / logBook.quantity) * 100}%` }}
              ></div>
            </div>
          </div>
        </td>
        <td className="py-4 px-4 text-right">
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => onTransaction(logBook)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Transaction">
              <ArrowRightLeft className="w-4 h-4" />
            </button>
            <button onClick={() => onHistory(logBook)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all" title="History">
              <History className="w-4 h-4" />
            </button>
            {isAdmin && (
              <>
                <button onClick={() => onEdit(logBook)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(logBook._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full">
      <div className="h-2 w-full" style={{ backgroundColor: logBook.color }}></div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-inner"
              style={{ backgroundColor: logBook.color }}
            >
              {logBook.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                {logBook.name}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {logBook.category}
              </span>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isAdmin && (
              <>
                <button onClick={() => onEdit(logBook)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(logBook._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-6 flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{logBook.storageLocation || 'No location specified'}</span>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${status.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </div>
          {logBook.notes && (
            <p className="text-sm text-gray-400 line-clamp-2 italic">"{logBook.notes}"</p>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-50">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Availability</p>
                <p className="text-lg font-black text-gray-900 leading-none">
                  {logBook.available} <span className="text-gray-300 text-sm font-bold">/ {logBook.quantity}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Reorder At</p>
              <p className="text-sm font-bold text-gray-500">{logBook.reorderLevel}</p>
            </div>
          </div>

          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min((logBook.available / logBook.quantity) * 100, 100)}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button 
              onClick={() => onTransaction(logBook)}
              className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-bold text-xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Transact
            </button>
            <button 
              onClick={() => onHistory(logBook)}
              className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-bold text-xs"
            >
              <History className="w-3.5 h-3.5" />
              History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogBookItem;
