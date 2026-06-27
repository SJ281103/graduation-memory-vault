const router = require('express').Router();
const auth = require('../middleware/auth');
const FriendMemory  = require('../models/FriendMemory');
const TeacherMemory = require('../models/TeacherMemory');
const { Guestbook, TimeCapsule } = require('../models/extras');

// GET /api/admin/analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const [
      totalFriends, pendingFriends, approvedFriends, featuredFriends,
      totalTeachers, pendingTeachers,
      totalGuestbook, pendingGuestbook,
      totalCapsules,
    ] = await Promise.all([
      FriendMemory.countDocuments(),
      FriendMemory.countDocuments({ status: 'pending' }),
      FriendMemory.countDocuments({ status: 'approved' }),
      FriendMemory.countDocuments({ featured: true }),
      TeacherMemory.countDocuments(),
      TeacherMemory.countDocuments({ status: 'pending' }),
      Guestbook.countDocuments(),
      Guestbook.countDocuments({ status: 'pending' }),
      TimeCapsule.countDocuments(),
    ]);

    // Recent submissions (last 7 days) by day
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSubmissions = await FriendMemory.aggregate([
      { $match: { submittedAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const avgRating = await FriendMemory.aggregate([
      { $match: { status: 'approved', friendshipRating: { $exists: true, $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$friendshipRating' } } },
    ]);

    res.json({
      friends:    { total: totalFriends, pending: pendingFriends, approved: approvedFriends, featured: featuredFriends },
      teachers:   { total: totalTeachers, pending: pendingTeachers },
      guestbook:  { total: totalGuestbook, pending: pendingGuestbook },
      capsules:   { total: totalCapsules },
      recentSubmissions,
      avgFriendshipRating: avgRating[0]?.avg?.toFixed(1) || '0',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/export — export all as JSON (for PDF generation on frontend)
router.get('/export', auth, async (req, res) => {
  try {
    const [friends, teachers, guestbook] = await Promise.all([
      FriendMemory.find({ status: 'approved' }).select('-ipAddress -likedBy'),
      TeacherMemory.find({ status: 'approved' }),
      Guestbook.find({ status: 'approved' }),
    ]);
    res.json({ friends, teachers, guestbook, exportedAt: new Date() });
  } catch {
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
