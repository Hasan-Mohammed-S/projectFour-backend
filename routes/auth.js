const router = require('express').Router();
const ctrl = require('../controllers/authCtrl');
const auth = require('../middleware/isSignedIn');



router.post(['/signup', '/sign-up'], ctrl.signup);
router.post(['/login', '/sign-in'], ctrl.login);

router.get('/me', auth, ctrl.me);
router.put('/me', auth, ctrl.updateProfile);

router.post('/logout', auth, ctrl.logout);

module.exports = router;