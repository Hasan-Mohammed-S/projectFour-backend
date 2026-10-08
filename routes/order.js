const router = require('express').Router();
const ctrl = require('../controllers/orderCtrl');

router.use(require('../middleware/isSignedIn'));

router.post('/', ctrl.create);
router.get('/', ctrl.index);
router.get('/mine', ctrl.index);
router.get('/store/:storeId', require('../middleware/isSeller'), ctrl.byStore);
router.get('/:id', ctrl.show);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.destroy);

module.exports = router;
