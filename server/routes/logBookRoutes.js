import express from 'express';
import LogBook from '../models/LogBook.js';
import Transaction from '../models/Transaction.js';
import { authenticateToken, requireAdmin, requireStaff } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const logBooks = await LogBook.find().sort({ createdAt: -1 });
    res.json(logBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const logBook = new LogBook({
    name: req.body.name,
    color: req.body.color,
    quantity: req.body.quantity,
    available: req.body.available,
    category: req.body.category,
    storageLocation: req.body.storageLocation,
    reorderLevel: req.body.reorderLevel,
    notes: req.body.notes
  });

  try {
    const newLogBook = await logBook.save();
    res.status(201).json(newLogBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const logBook = await LogBook.findById(req.params.id);
    if (!logBook) return res.status(404).json({ message: 'Log book not found' });

    if (req.body.name != null) logBook.name = req.body.name;
    if (req.body.color != null) logBook.color = req.body.color;
    if (req.body.quantity != null) logBook.quantity = req.body.quantity;
    if (req.body.available != null) logBook.available = req.body.available;
    if (req.body.category != null) logBook.category = req.body.category;
    if (req.body.storageLocation != null) logBook.storageLocation = req.body.storageLocation;
    if (req.body.reorderLevel != null) logBook.reorderLevel = req.body.reorderLevel;
    if (req.body.notes != null) logBook.notes = req.body.notes;

    const updatedLogBook = await logBook.save();
    res.json(updatedLogBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const logBook = await LogBook.findByIdAndDelete(req.params.id);
    if (!logBook) return res.status(404).json({ message: 'Log book not found' });

    await Transaction.deleteMany({ logBookId: req.params.id });

    res.json({ message: 'Log book and history deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/transactions', authenticateToken, requireStaff, async (req, res) => {
  try {
    const logBook = await LogBook.findById(req.params.id);
    if (!logBook) return res.status(404).json({ message: 'Log book not found' });

    const { type, quantityChange, recipient, notes, signature } = req.body;

    if (!logBook.category) {
      logBook.category = 'Personal';
    }

    if (type === 'Issue Out') {
      if (logBook.available < quantityChange) {
        return res.status(400).json({ message: 'Not enough books available' });
      }
      logBook.available -= quantityChange;
    } else if (type === 'Return') {
      if (logBook.available + quantityChange > logBook.quantity) {
        return res.status(400).json({ message: `Cannot return more than total quantity. Max returnable: ${logBook.quantity - logBook.available}` });
      }
      logBook.available += quantityChange;
    } else if (type === 'Add Stock') {
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Only admins can add stock' });
      }
      logBook.quantity += quantityChange;
      logBook.available += quantityChange;
    } else if (type === 'Adjustment') {
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Only admins can make adjustments' });
      }
      const diff = quantityChange - logBook.available;
      logBook.available = quantityChange;
      logBook.quantity += diff;
    }

    const transaction = new Transaction({
      logBookId: req.params.id,
      type,
      quantityChange,
      recipient,
      notes,
      signature,
      createdBy: {
        userId: req.user.userId,
        username: req.body.username || 'Unknown',
        role: req.user.role
      }
    });

    await logBook.save();
    await transaction.save();

    res.status(201).json({ logBook, transaction });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ logBookId: req.params.id }).sort({ timestamp: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/analytics/burnrate', authenticateToken, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await Transaction.find({
      type: 'Issue Out',
      timestamp: { $gte: thirtyDaysAgo }
    });

    const totalIssued = transactions.reduce((sum, tx) => sum + tx.quantityChange, 0);
    const burnRate = totalIssued / 30;

    const logBooks = await LogBook.find();

    const predictions = logBooks.map(book => {
      const bookIssuedInPeriod = transactions
        .filter(tx => tx.logBookId.toString() === book._id.toString())
        .reduce((sum, tx) => sum + tx.quantityChange, 0);

      const bookBurnRate = bookIssuedInPeriod / 30;
      const daysRemaining = bookBurnRate > 0 ? Math.floor(book.available / bookBurnRate) : Infinity;

      return {
        id: book._id,
        name: book.name,
        available: book.available,
        burnRate: bookBurnRate.toFixed(2),
        daysRemaining: daysRemaining === Infinity ? '∞' : daysRemaining
      };
    });

    res.json({
      overallBurnRate: burnRate.toFixed(2),
      totalIssuedLast30Days: totalIssued,
      bookPredictions: predictions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
