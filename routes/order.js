const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/orderCtrl');
const isSignedIn = require('../middleware/isSignedIn');
const isSeller = require('../middleware/isSeller');


router.use(isSignedIn);

router.post('/', orderCtrl.create);
router.get('/', orderCtrl.index);
router.get('/:id', orderCtrl.show);
router.put('/:id', orderCtrl.update);
router.delete('/:id', orderCtrl.destroy);


module.exports = router;