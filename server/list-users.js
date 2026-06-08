import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/logbook_tracker');
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Total users found: ${users.length}`);
    users.forEach(u => {
      console.log(`- ID: ${u._id}, Email: "${u.email}", Username: "${u.username}", Role: ${u.role}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

listUsers();
