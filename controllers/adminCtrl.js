const User = require('../models/user');
const Product = require('../models/product');
const Store = require('../models/stores');
const Order = require('../models/order');


const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalStores = await Store.countDocuments();
    const totalOrders = await Order.countDocuments();

    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || order.totalPrice || 0), 0);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalStores,
        totalOrders,
        totalSalesCount: totalOrders,
        totalRevenue
        }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find().populate('owner', 'username email');

    res.status(200).json({ success: true, stores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const deleteStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    res.status(200).json({ success: true, message: 'Store deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getAllSales = async (req, res) => {
  try {
    const sales = await Order.find()
      .populate('user', 'username email')
      .populate('items.product', 'title price');
      
    res.status(200).json({ success: true, count: sales.length, sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



const getSaleById = async (req, res) => {
  try {
    const sale = await Order.findById(req.params.id)
      .populate('user', 'username email')
      .populate('items.product', 'title price');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale/Order not found' });
    }

    res.status(200).json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllStores,
  deleteStore,
  getAllSales,
  getSaleById
};
