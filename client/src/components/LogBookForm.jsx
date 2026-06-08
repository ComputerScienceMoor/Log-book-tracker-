import React, { useState, useEffect } from 'react';
import { X, Plus, Save, MapPin, AlertCircle, StickyNote } from 'lucide-react';

const CATEGORIES = [
  'Aviation', 'Marine', 'Driving', 'Maintenance', 
  'Personal', 'Medical', 'Engineering', 'Security'
];

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1',
  '#14b8a6', '#f97316', '#71717a', '#000000'
];

const LogBookForm = ({ onSubmit, initialData, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    quantity: 0,
    available: 0,
    category: CATEGORIES[0],
    storageLocation: '',
    reorderLevel: 5,
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // Ensure category is never undefined if initialData doesn't have it
        category: initialData.category || prev.category
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'quantity' || name === 'available' || name === 'reorderLevel') 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-8 rounded-full" style={{ backgroundColor: formData.color }}></div>
            <h2 className="text-xl font-bold text-gray-800">
              {initialData ? 'Edit Log Book' : 'New Log Book'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Log Book Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. Flight Log 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Colour Theme</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        formData.color === color ? 'border-gray-900 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="h-10 w-12 p-1 border border-gray-200 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-mono uppercase"
                    placeholder="#HEX CODE"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Storage Location
                </label>
                <input
                  type="text"
                  name="storageLocation"
                  value={formData.storageLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Cabinet A, Shelf 2"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Total Stock</label>
                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Available Now</label>
                  <input
                    type="number"
                    name="available"
                    min="0"
                    max={formData.quantity}
                    value={formData.available}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Reorder Level
                </label>
                <input
                  type="number"
                  name="reorderLevel"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">Alert when availability drops to or below this level.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <StickyNote className="w-3.5 h-3.5" /> Notes
                </label>
                <textarea
                  name="notes"
                  rows="5"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Additional details about this log book..."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors font-bold flex items-center justify-center gap-2"
            >
              {initialData ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {initialData ? 'Update Log Book' : 'Create Log Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogBookForm;
