import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

async function debugAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/logbook_tracker');
    console.log('Connected to MongoDB');

    const email = 'adc@gmail.com';
    const password = 'password123';
    
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`User ${email} NOT FOUND`);
    } else {
      console.log('User found:', user.email);
      console.log('Role:', user.role);
      console.log('IsActive:', user.isActive);
      
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(`Testing password "${password}": ${isMatch ? 'MATCH' : 'NO MATCH'}`);
      
      if (!isMatch) {
          console.log('Hash in DB:', user.password);
          // Let's try to fix it right now to be sure
          user.password = password;
          await user.save();
          console.log('Re-saved user with password123');
          
          const newUser = await User.findOne({ email: email.toLowerCase() });
          const isMatchNow = await bcrypt.compare(password, newUser.password);
          console.log(`Testing password again after re-save: ${isMatchNow ? 'MATCH' : 'NO MATCH'}`);
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

debugAdmin();
