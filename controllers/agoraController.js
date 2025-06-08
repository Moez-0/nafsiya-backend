require('dotenv').config();
// controllers/agoraController.js
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');


exports.generateAgoraToken = async (req, res, next) => {
  try {
    const { channelName, uid } = req.body;
    
    if (!channelName) {
      return next(new ErrorResponse('Channel name is required', 400));
    }

    // Get role (publisher or subscriber)
    const role = req.user.role === 'specialist' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    // Generate token
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      process.env.AGORA_APP_ID,
      process.env.AGORA_APP_CERTIFICATE,
      channelName,
      uid || 0,
      role,
      privilegeExpiredTs
    );

    res.status(200).json({
      success: true,
      token,
      appId: process.env.AGORA_APP_ID,
      channelName,
      uid
    });
  } catch (err) {
    next(err);
  }
};