import React, { useState, useRef } from 'react';
import { X, Send, RotateCcw, PlusCircle, Settings2 } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

const TransactionModal = ({ logBook, onClose, onSubmit, userRole }) => {
  const [type, setType] = useState('Issue Out');
  const [quantityChange, setQuantityChange] = useState(1);
  const [recipient, setRecipient] = useState('');
  const [notes, setNotes] = useState('');
  const sigCanvas = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const qty = parseInt(quantityChange) || 0;
    if (qty <= 0) {
      alert('Please enter a valid quantity greater than 0');
      return;
    }

    if (type === 'Issue Out' && qty > logBook.available) {
      alert(`Not enough stock! Only ${logBook.available} available.`);
      return;
    }

    if (type === 'Return' && (parseInt(logBook.available) + qty) > logBook.quantity) {
      alert(`Cannot return more than total quantity! Max returnable: ${logBook.quantity - logBook.available}`);
      return;
    }

    if (type === 'Issue Out' && sigCanvas.current && sigCanvas.current.isEmpty()) {
      alert('Please provide a signature for Issue Out');
      return;
    }

    let signature = null;
    try {
      if (type === 'Issue Out' && sigCanvas.current && !sigCanvas.current.isEmpty()) {
        signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      }
    } catch (err) {
      console.error('Error capturing signature:', err);
    }

    onSubmit({
      type,
      quantityChange: qty,
      recipient,
      notes,
      signature
    });
  };

  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const types = [
    { id: 'Issue Out', icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'Return', icon: RotateCcw, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'Add Stock', icon: PlusCircle, color: 'text-purple-600', bg: 'bg-purple-50', adminOnly: true },
    { id: 'Adjustment', icon: Settings2, color: 'text-amber-600', bg: 'bg-amber-50', adminOnly: true },
  ];

  const availableTypes = types.filter(t => !t.adminOnly || userRole === 'Admin');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">Record Transaction</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {availableTypes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  type === t.id
                    ? `border-gray-900 ${t.bg}`
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <t.icon className={`w-4 h-4 ${t.color}`} />
                <span className="text-xs font-bold text-gray-700">{t.id}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              {type === 'Adjustment' ? 'New Available Count' : 'Quantity'}
            </label>
            <input
              type="number"
              min="1"
              step="1"
              required
              value={quantityChange}
              onChange={(e) => setQuantityChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
            />
          </div>

          {(type === 'Issue Out' || type === 'Return') && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Recipient Name</label>
              <input
                type="text"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Who is receiving/returning?"
              />
            </div>
          )}

          {type === 'Issue Out' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">Signature</label>
                <button type="button" onClick={handleClear} className="text-xs text-gray-400 hover:text-gray-600">
                  Clear
                </button>
              </div>
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{
                    className: "w-full h-32 signature-canvas"
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Sign above for Issue Out transactions</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
              placeholder="Any additional information..."
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors font-bold flex items-center justify-center gap-2"
          >
            Confirm {type}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
