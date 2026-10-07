const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

require('dotenv').config();

require('./config/database');

const authRoutes = require('./routes/auth');
const authRouter = require('./routes/authRouter');
const productRoutes = require('./routes/product');
const storeRoutes = require('./routes/stores');
const orderRoutes = require('./routes/order');
const adminRoutes = require('./routes/admin');

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/auth', authRoutes);
// app.use('/authRouter', authRouter);
app.use('/products', productRoutes);
app.use('/stores', storeRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);



app.get('/', (req, res) => {
  res.json({ message: 'Server is running successfully!' });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});