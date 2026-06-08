import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/logbook_tracker');
    console.log('Connected to MongoDB');

    const email = 'adc@gmail.com';
    const username = 'opeadmin';
    const password = 'password123';
    const role = 'Admin';

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      console.log('User or Username already exists:', existing.email, existing.username);
      // Update it to be sure
      existing.password = password;
      existing.role = 'Admin';
      existing.email = email;
      existing.username = username;
      await existing.save();
      console.log('Updated existing user to Admin with password123');
    } else {
      const user = new User({ username, email, password, role });
      await user.save();
      console.log('Created NEW admin user adc@gmail.com with password123');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

createAdmin();
