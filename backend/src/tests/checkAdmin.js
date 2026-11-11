const mongoose = require('mongoose');
const User = require('../models/User');

async function testLocal() {
  await mongoose.connect('mongodb://127.0.0.1:27017/cleanora');
  const admin = await User.findOne({ email: 'admin@asmshine.com' });
  console.log('Local admin document:');
  console.log('id:', admin?._id);
  console.log('email:', admin?.email);
  console.log('passwordChangedAt:', admin?.passwordChangedAt, '-> timestamp seconds:', admin?.passwordChangedAt ? Math.floor(admin.passwordChangedAt.getTime() / 1000) : null);
  console.log('updatedAt:', admin?.updatedAt);
  await mongoose.disconnect();
}
testLocal();

