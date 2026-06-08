import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

export const requireStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'Staff')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Valid role required.' });
  }
};
