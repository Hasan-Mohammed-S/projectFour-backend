const express = require('express');
const router = express.Router();


const authController = require('../controllers/authCtrl.js');

router.get('/signup', authController.signup);
router.post('/signup', authController.signup);


router.get('/login', authController.login);
router.post('/login', authController.login);


router.get('/logout', authController.logout);

module.exports = router;