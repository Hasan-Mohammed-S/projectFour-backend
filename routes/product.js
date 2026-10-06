const express = require('express');
const router = express.Router();


const productCtrl = require('../controllers/productCtrl');


const isSignedIn = require('../middleware/isSignedIn');
const isSeller = require('../middleware/isSeller');
const upload = require('../config/multer');

router.get('/', productCtrl.index);
router.get('/:id', productCtrl.show);


router.post(
  '/',
  isSignedIn,
  isSeller,
  upload.single('image'),
  productCtrl.create
);



router.put(
  '/:id',
  isSignedIn,
  isSeller,
  upload.single('image'),
  productCtrl.update
);


router.delete(
  '/:id',
  isSignedIn,
  isSeller,
  productCtrl.destroy
);

module.exports = router;