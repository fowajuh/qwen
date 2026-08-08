import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  category: string | null;
  website: string | null;
  location: string | null;
  is_verified: boolean;
  is_business: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserStats {
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  engagement_rate: number;
  top_posts: Array<{ id: string; views: number; likes: number }>;
}

export interface Follower {
  id: string;
  username: string;
  name: string;
  avatar_url: string | null;
  is_verified: boolean;
  followed_at: Date;
}

export interface Following extends Follower {}

export class ProfileService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Get complete user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const result = await this.pool.query(
      `SELECT 
        u.id, u.email, u.name, 
        COALESCE(p.username, CONCAT('user_', SUBSTRING(u.id FROM 1 FOR 8))) as username,
        p.bio, p.avatar_url, p.cover_image_url, p.category, p.website, p.location,
        u.is_verified, p.is_business,
        COALESCE(stats.followers_count, 0) as followers_count,
        COALESCE(stats.following_count, 0) as following_count,
        COALESCE(stats.posts_count, 0) as posts_count,
        u.created_at, u.updated_at
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN (
         SELECT 
           user_id,
           COUNT(DISTINCT CASE WHEN type = 'follower' THEN follower_id END) as followers_count,
           COUNT(DISTINCT CASE WHEN type = 'following' THEN following_id END) as following_count,
           COUNT(DISTINCT post_id) as posts_count
         FROM user_stats_cache
         WHERE user_id = $1
         GROUP BY user_id
       ) stats ON u.id = stats.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0] as UserProfile;
  }

  /**
   * Get profile by username
   */
  async getProfileByUsername(username: string): Promise<UserProfile | null> {
    const result = await this.pool.query(
      `SELECT 
        u.id, u.email, u.name, p.username,
        p.bio, p.avatar_url, p.cover_image_url, p.category, p.website, p.location,
        u.is_verified, p.is_business,
        COALESCE(stats.followers_count, 0) as followers_count,
        COALESCE(stats.following_count, 0) as following_count,
        COALESCE(stats.posts_count, 0) as posts_count,
        u.created_at, u.updated_at
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN (
         SELECT 
           user_id,
           COUNT(DISTINCT CASE WHEN type = 'follower' THEN follower_id END) as followers_count,
           COUNT(DISTINCT CASE WHEN type = 'following' THEN following_id END) as following_count,
           COUNT(DISTINCT post_id) as posts_count
         FROM user_stats_cache
         GROUP BY user_id
       ) stats ON u.id = stats.user_id
       WHERE p.username = $1`,
      [username]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0] as UserProfile;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<Pick<UserProfile, 'bio' | 'avatar_url' | 'cover_image_url' | 'category' | 'website' | 'location'>>
  ): Promise<UserProfile> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Ensure profile exists
      await client.query(
        `INSERT INTO profiles (user_id, username, bio, avatar_url, cover_image_url, category, website, location, is_business, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           bio = EXCLUDED.bio,
           avatar_url = EXCLUDED.avatar_url,
           cover_image_url = EXCLUDED.cover_image_url,
           category = EXCLUDED.category,
           website = EXCLUDED.website,
           location = EXCLUDED.location,
           updated_at = NOW()`,
        [
          userId,
          `user_${userId.substring(0, 8)}`,
          updates.bio ?? null,
          updates.avatar_url ?? null,
          updates.cover_image_url ?? null,
          updates.category ?? null,
          updates.website ?? null,
          updates.location ?? null,
          false
        ]
      );

      await client.query('COMMIT');
      return (await this.getProfile(userId))!;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get user statistics/analytics
   */
  async getUserStats(userId: string, days: number = 30): Promise<UserStats | null> {
    const result = await this.pool.query(
      `SELECT 
         COALESCE(SUM(view_count), 0) as total_views,
         COALESCE(SUM(like_count), 0) as total_likes,
         COALESCE(SUM(comment_count), 0) as total_comments,
         COALESCE(SUM(share_count), 0) as total_shares
       FROM post_analytics_cache
       WHERE user_id = $1 
         AND created_at > NOW() - INTERVAL '${days} days'`,
      [userId]
    );

    const stats = result.rows[0];
    if (!stats) return null;

    // Calculate engagement rate
    const totalEngagements = stats.total_likes + stats.total_comments + stats.total_shares;
    const engagementRate = stats.total_views > 0 
      ? (totalEngagements / stats.total_views) * 100 
      : 0;

    // Get top posts
    const topPostsResult = await this.pool.query(
      `SELECT post_id as id, view_count as views, like_count as likes
       FROM post_analytics_cache
       WHERE user_id = $1
       ORDER BY view_count DESC
       LIMIT 5`,
      [userId]
    );

    return {
      total_views: parseInt(stats.total_views),
      total_likes: parseInt(stats.total_likes),
      total_comments: parseInt(stats.total_comments),
      total_shares: parseInt(stats.total_shares),
      engagement_rate: parseFloat(engagementRate.toFixed(2)),
      top_posts: topPostsResult.rows.map((p: any) => ({
        id: p.id,
        views: parseInt(p.views),
        likes: parseInt(p.likes)
      }))
    };
  }

  /**
   * Get user's followers
   */
  async getFollowers(userId: string, limit: number = 20, offset: number = 0): Promise<Follower[]> {
    const result = await this.pool.query(
      `SELECT 
         u.id, p.username, u.name, p.avatar_url, u.is_verified, f.created_at as followed_at
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows as Follower[];
  }

  /**
   * Get users that this user is following
   */
  async getFollowing(userId: string, limit: number = 20, offset: number = 0): Promise<Following[]> {
    const result = await this.pool.query(
      `SELECT 
         u.id, p.username, u.name, p.avatar_url, u.is_verified, f.created_at as followed_at
       FROM follows f
       JOIN users u ON f.following_id = u.id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows as Following[];
  }

  /**
   * Follow/unfollow user
   */
  async toggleFollow(followerId: string, followingId: string): Promise<'followed' | 'unfollowed'> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if already following
      const existing = await client.query(
        'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
      );

      if (existing.rows.length > 0) {
        // Unfollow
        await client.query(
          'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
          [followerId, followingId]
        );
        await client.query('COMMIT');
        return 'unfollowed';
      } else {
        // Follow
        await client.query(
          'INSERT INTO follows (id, follower_id, following_id, created_at) VALUES ($1, $2, $3, NOW())',
          [uuidv4(), followerId, followingId]
        );
        await client.query('COMMIT');
        return 'followed';
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if user is following another user
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const result = await this.pool.query(
      'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );
    return result.rows.length > 0;
  }

  /**
   * Get suggested users to follow based on location and interests
   */
  async getSuggestedUsers(userId: string, limit: number = 10): Promise<UserProfile[]> {
    // Get user's location and category
    const userResult = await this.pool.query(
      `SELECT p.location, p.category 
       FROM profiles p 
       WHERE p.user_id = $1`,
      [userId]
    );

    const userLocation = userResult.rows[0]?.location || null;
    const userCategory = userResult.rows[0]?.category || null;

    // Find similar users or local businesses
    const result = await this.pool.query(
      `SELECT 
         u.id, u.email, u.name, p.username,
         p.bio, p.avatar_url, p.cover_image_url, p.category, p.website, p.location,
         u.is_verified, p.is_business,
         COALESCE(stats.followers_count, 0) as followers_count,
         COALESCE(stats.following_count, 0) as following_count,
         COALESCE(stats.posts_count, 0) as posts_count,
         u.created_at, u.updated_at
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN (
         SELECT 
           user_id,
           COUNT(DISTINCT CASE WHEN type = 'follower' THEN follower_id END) as followers_count,
           COUNT(DISTINCT CASE WHEN type = 'following' THEN following_id END) as following_count,
           COUNT(DISTINCT post_id) as posts_count
         FROM user_stats_cache
         GROUP BY user_id
       ) stats ON u.id = stats.user_id
       WHERE u.id != $1
         AND (p.location = $2 OR p.category = $3)
         AND NOT EXISTS (
           SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = u.id
         )
       ORDER BY stats.followers_count DESC
       LIMIT $4`,
      [userId, userLocation, userCategory, limit]
    );

    return result.rows as UserProfile[];
  }

  /**
   * Delete user profile and account
   */
  async deleteProfile(userId: string): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete follows
      await client.query('DELETE FROM follows WHERE follower_id = $1 OR following_id = $1', [userId]);
      
      // Delete profile
      await client.query('DELETE FROM profiles WHERE user_id = $1', [userId]);
      
      // Delete user (cascade will handle related data)
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// Export singleton instance
import { pool } from '../config/database.pg.js';
export const profileService = new ProfileService(pool);
