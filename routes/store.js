const express = require('express');
const router = express.Router();
const storeController = require('../controller/store');

router.get('/', storeController.index);
router.get('/:id', storeController.show);
router.post('/', storeController.create);
router.put('/:id', storeController.update);
router.delete('/:id', storeController.destroy);


module.exports = router;