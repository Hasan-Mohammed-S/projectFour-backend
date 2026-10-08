const router = require('express').Router();

const ctrl = require('../controllers/productCtrl');
const auth = require('../middleware/isSignedIn');
const seller = require('../middleware/isSeller');
const upload = require('../config/multer');

router.get('/', ctrl.index);
router.get('/mine', auth, seller, ctrl.mine);
router.get('/:id', ctrl.show);
router.post('/', auth, seller, upload.single('image'), ctrl.create);
router.put('/:id', auth, seller, upload.single('image'), ctrl.update);
router.delete('/:id', auth, seller, ctrl.destroy);

module.exports = router;
