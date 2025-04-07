const express = require('express');
const router = express.Router();
const { protect, anonymousAccess } = require('../middlewares/auth');
const {
    getRecommendedResources,
    getResources,
    getResource,
    createResource,
    updateResource,
    deleteResource
  } = require('../controllers/resourceController');


  // Resource routes
router.route('/recommended')
.get(protect, getRecommendedResources);

router.route('/resources')
.get( getResources)
.post(protect, createResource);

router.route('/:id')
.get(getResource)
.put(protect, updateResource)
.delete(protect, deleteResource);

// Export the router
module.exports = router;



