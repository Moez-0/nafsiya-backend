const express = require('express');
const router = express.Router();
const {
    generateAgoraToken
} = require('../controllers/agoraController');



// Middleware to protect routes
const { protect } = require('../middlewares/auth');

// Route to generate Agora token
router.post('/token', protect, generateAgoraToken);

module.exports = router;
