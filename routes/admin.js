const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllStores,
  deleteStore,
  getAllSales,
  getSaleById
} = require('../controllers/adminCtrl');


router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/stores', getAllStores);
router.delete('/stores/:id', deleteStore);


router.get('/sales', getAllSales);
router.get('/sales/:id', getSaleById);

module.exports = router;