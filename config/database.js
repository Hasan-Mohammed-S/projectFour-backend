const mongoose = require('mongoose');

module.exports = async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required.');
  }

  await mongoose.connect(process.env.MONGODB_URI, { 
    serverSelectionTimeoutMS: 10000 
  });

  await require('../models/order').init();

  await Promise.all([
    require('../models/user').init(), 
    require('../models/stores').init(), 
    require('../models/product').init()
  ]);

  console.log('Database connected.');
};