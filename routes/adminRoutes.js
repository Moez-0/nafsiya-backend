const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/admin');
const { getDashboardStats } = require('../controllers/adminController');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

router.route('/dashboard')
    .get(getDashboardStats);

module.exports = router;
