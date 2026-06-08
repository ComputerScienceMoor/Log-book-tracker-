import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  logBookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LogBook',
    required: true
  },
  type: {
    type: String,
    enum: ['Issue Out', 'Return', 'Add Stock', 'Adjustment'],
    required: true
  },
  quantityChange: {
    type: Number,
    required: true
  },
  recipient: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  signature: {
    type: String,
    trim: true
  },
  createdBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: {
      type: String
    },
    role: {
      type: String,
      enum: ['Admin', 'Staff']
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
