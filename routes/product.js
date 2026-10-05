const express = require('express');
const router = express.Router();


const productCtrl = require('../controllers/productCtrl');


const isSignedIn = require('../middleware/isSignedIn');
const isSeller = require('../middleware/isSeller');
const upload = require('../middleware/multer');

router.get('/', productCtrl.getAllProducts);
router.get('/:id', productCtrl.getProductById);


router.post(
  '/',
  isSignedIn,
  isSeller,
  upload.single('image'),
  productCtrl.createProduct
);



router.put(
  '/:id',
  isSignedIn,
  isSeller,
  upload.single('image'),
  productCtrl.updateProduct
);


router.delete(
  '/:id',
  isSignedIn,
  isSeller,
  productCtrl.deleteProduct
);

module.exports = router;