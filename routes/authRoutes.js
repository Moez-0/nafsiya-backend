const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyAccount,
  getMe,
  forgotPassword,
  resetPassword,
  anonymousLogin
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/verify/:verificationToken', verifyAccount);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/anonymous', anonymousLogin);

module.exports = router;