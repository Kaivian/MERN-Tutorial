import mongoose from 'mongoose';
import ENV from './src/config/env.config.js';
import User from './src/models/user.model.js';
import Role from './src/models/role.model.js';

async function checkAdmin() {
  try {
    console.log('Connecting to:', ENV.db.url);
    await mongoose.connect(ENV.db.url);
    const admin = await User.findOne({ username: 'admin' }).populate('roles');
    console.log('Admin user roles:', admin ? admin.roles : 'Not found');
    const roles = await Role.find({});
    console.log('All Roles from DB:', roles.map(r => ({ slug: r.slug, permissions: r.permissions })));
  } catch(e) {
    console.error('Error:', e);
  } finally {
    mongoose.disconnect();
  }
}
checkAdmin();
