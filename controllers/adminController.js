const User = require('../models/User');
const Specialist = require('../models/Specialist');
const Resource = require('../models/Resource');
const Activity = require('../models/Activity');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get admin dashboard stats
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
    try {
        const ForumPost = require('../models/ForumPost');

        // Time ranges
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);

        // Helper for percentage change
        const calculateChange = (current, previous) => {
            if (previous === 0) return current > 0 ? '+100%' : '0%';
            const change = ((current - previous) / previous) * 100;
            return (change > 0 ? '+' : '') + change.toFixed(1) + '%';
        };

        // 1. User counts
        const totalUsers = await User.countDocuments();
        const usersYesterday = await User.countDocuments({ createdAt: { $lt: startOfToday } });
        const userChange = calculateChange(totalUsers, usersYesterday);

        const totalSpecialists = await Specialist.countDocuments();

        const specialistsYesterday = await Specialist.countDocuments({ createdAt: { $lt: startOfToday } });
        const specialistChange = calculateChange(totalSpecialists, specialistsYesterday);

        // Active Users comparison
        const activeUsersTodayCount = (await Activity.distinct('user', { createdAt: { $gte: startOfToday } })).length;
        const activeUsersYesterdayCount = (await Activity.distinct('user', { createdAt: { $gte: startOfYesterday, $lt: startOfToday } })).length;
        const activeUserChange = calculateChange(activeUsersTodayCount, activeUsersYesterdayCount);

        // 2. Resource counts
        const totalResources = await Resource.countDocuments();
        const resourcesYesterday = await Resource.countDocuments({ createdAt: { $lt: startOfToday } });
        const resourceChange = calculateChange(totalResources, resourcesYesterday);

        // 3. Post counts (New Posts Today vs Yesterday)
        const postsToday = await ForumPost.countDocuments({ createdAt: { $gte: startOfToday } });
        const postsYesterday = await ForumPost.countDocuments({ createdAt: { $gte: startOfYesterday, $lt: startOfToday } });
        const postsChange = calculateChange(postsToday, postsYesterday);

        // 4. Flagged Content
        const flaggedPosts = await ForumPost.countDocuments({ isFlagged: true });
        // const flaggedReplies = await Reply.countDocuments({ isFlagged: true }); // If Reply needed, require it
        const totalFlagged = flaggedPosts; // + flaggedReplies

        // 5. Recent Users
        const recentUsers = await User.find()
            .sort('-createdAt')
            .limit(5)
            .select('firstName lastName email role createdAt isVerified');

        // 6. Recent Activities
        const recentActivities = await Activity.find()
            .sort('-createdAt')
            .limit(5)
            .populate('user', 'firstName lastName email');

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    userChange,
                    totalSpecialists,
                    specialistChange,
                    activeUsers: activeUsersTodayCount,
                    activeUserChange,
                    totalResources,
                    resourceChange,
                    newPosts: postsToday,
                    postsChange,
                    totalFlagged
                },
                recentUsers,
                recentActivities
            }
        });
    } catch (err) {
        next(err);
    }
};
