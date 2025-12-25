const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

// Load .env variables
dotenv.config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected for seeding');

    // Remove old admin if exists (optional, ensures a fresh account)
    await Admin.deleteOne({ username: 'admin' });

    // Create fresh admin
    const admin = new Admin({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'superadmin'
    });

    await admin.save();
    console.log('🎯 Default admin created:');
    console.log('   Username: admin');
    console.log('   Password: admin123');

    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedAdmin();
