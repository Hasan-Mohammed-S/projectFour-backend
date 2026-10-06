const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

require('dotenv').config();

const connectDB = require('./config/database');


const authRoutes = require('./routes/auth');
const authRouter = require('./routes/authRouter');
const productRoutes = require('./routes/product');
const storeRoutes = require('./routes/store');
const orderRoutes = require('./routes/order');
const adminRoutes = require('./routes/admin');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();



app.use('/api/auth', authRoutes);
app.use('/api/authRouter', authRouter);
app.use('/api/products', productRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);



app.get('/', (req, res) => {
  res.json({ message: 'Server is running successfully!' });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});