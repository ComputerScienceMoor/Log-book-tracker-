import mongoose from 'mongoose';

const logBookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    default: '#3b82f6' // Default blue
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  available: {
    type: Number,
    required: [true, 'Available quantity is required'],
    min: [0, 'Available quantity cannot be negative'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    default: 'Personal'
  },
  storageLocation: {
    type: String,
    trim: true
  },
  reorderLevel: {
    type: Number,
    default: 5
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const LogBook = mongoose.model('LogBook', logBookSchema);

export default LogBook;
