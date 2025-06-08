const express = require('express');
const router = express.Router();
const { protect, anonymousAccess } = require('../middlewares/auth');
const {
    getUserActivity,
    updateMood,
    getMe,
    updateUser,
    getUserById
  } = require('../controllers/userController');
// User routes
router.route('/activity/:id')
  .get(getUserActivity);

router.route('/mood')
  .post(protect, updateMood);

router.route('/me')
  .get(protect, getMe)
  .put(protect, updateUser);

router.route('/:id')
  .get(protect, getUserById);
  

  


// Export the router
module.exports = router;
