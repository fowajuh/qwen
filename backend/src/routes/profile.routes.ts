import { Router } from 'express';
import { profileService } from '../services/profile.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * GET /api/profile/me
 * Get current user's profile
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const profile = await profileService.getProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * GET /api/profile/username/:username
 * Get profile by username
 */
router.get('/username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await profileService.getProfileByUsername(username);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching profile by username:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * GET /api/profile/:userId
 * Get profile by user ID
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await profileService.getProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/profile/me
 * Update current user's profile
 */
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { bio, avatar_url, cover_image_url, category, website, location } = req.body;
    
    const updates: any = {};
    if (bio !== undefined) updates.bio = bio;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (cover_image_url !== undefined) updates.cover_image_url = cover_image_url;
    if (category !== undefined) updates.category = category;
    if (website !== undefined) updates.website = website;
    if (location !== undefined) updates.location = location;
    
    const profile = await profileService.updateProfile(userId, updates);
    
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /api/profile/:userId/stats
 * Get user statistics/analytics
 */
router.get('/:userId/stats', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    // Only allow users to see their own stats
    if (req.user!.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const stats = await profileService.getUserStats(userId, parseInt(days as string));
    
    if (!stats) {
      return res.status(404).json({ error: 'Stats not found' });
    }
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/profile/:userId/followers
 * Get user's followers
 */
router.get('/:userId/followers', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const followers = await profileService.getFollowers(
      userId,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    res.json({ success: true, data: followers });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

/**
 * GET /api/profile/:userId/following
 * Get users that this user is following
 */
router.get('/:userId/following', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const following = await profileService.getFollowing(
      userId,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    res.json({ success: true, data: following });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

/**
 * POST /api/profile/:userId/follow
 * Toggle follow/unfollow user
 */
router.post('/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user!.id;
    
    if (followerId === userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    
    const result = await profileService.toggleFollow(followerId, userId);
    
    res.json({ success: true, data: { status: result } });
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
});

/**
 * GET /api/profile/:userId/is-following
 * Check if current user is following another user
 */
router.get('/:userId/is-following', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user!.id;
    
    const isFollowing = await profileService.isFollowing(followerId, userId);
    
    res.json({ success: true, data: { isFollowing } });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

/**
 * GET /api/profile/suggestions
 * Get suggested users to follow
 */
router.get('/suggestions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { limit = 10 } = req.query;
    
    const suggestions = await profileService.getSuggestedUsers(
      userId,
      parseInt(limit as string)
    );
    
    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

/**
 * DELETE /api/profile/me
 * Delete current user's profile and account
 */
router.delete('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    await profileService.deleteProfile(userId);
    
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export { router as profileRoutes };
