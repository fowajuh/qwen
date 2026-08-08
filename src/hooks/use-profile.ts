import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

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
  created_at: string;
  updated_at: string;
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
  followed_at: string;
}

/**
 * Get current user's profile
 */
export function useMyProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const response = await api.get('/api/profile/me');
      return response.data.data as UserProfile;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get profile by user ID
 */
export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await api.get(`/api/profile/${userId}`);
      return response.data.data as UserProfile;
    },
    enabled: !!userId,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get profile by username
 */
export function useProfileByUsername(username?: string) {
  return useQuery({
    queryKey: ['profile', 'username', username],
    queryFn: async () => {
      if (!username) return null;
      const response = await api.get(`/api/profile/username/${encodeURIComponent(username)}`);
      return response.data.data as UserProfile;
    },
    enabled: !!username,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<Pick<UserProfile, 'bio' | 'avatar_url' | 'cover_image_url' | 'category' | 'website' | 'location'>>) => {
      const response = await api.put('/api/profile/me', updates);
      return response.data.data as UserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });
}

/**
 * Get user statistics/analytics
 */
export function useUserStats(userId?: string, days: number = 30) {
  return useQuery({
    queryKey: ['profile', userId, 'stats', days],
    queryFn: async () => {
      if (!userId) return null;
      const response = await api.get(`/api/profile/${userId}/stats?days=${days}`);
      return response.data.data as UserStats;
    },
    enabled: !!userId,
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get user's followers
 */
export function useFollowers(userId?: string, limit: number = 20, offset: number = 0) {
  return useQuery({
    queryKey: ['profile', userId, 'followers', limit, offset],
    queryFn: async () => {
      if (!userId) return [];
      const response = await api.get(`/api/profile/${userId}/followers?limit=${limit}&offset=${offset}`);
      return response.data.data as Follower[];
    },
    enabled: !!userId,
    retry: 2,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get users that this user is following
 */
export function useFollowing(userId?: string, limit: number = 20, offset: number = 0) {
  return useQuery({
    queryKey: ['profile', userId, 'following', limit, offset],
    queryFn: async () => {
      if (!userId) return [];
      const response = await api.get(`/api/profile/${userId}/following?limit=${limit}&offset=${offset}`);
      return response.data.data as Follower[];
    },
    enabled: !!userId,
    retry: 2,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Toggle follow/unfollow user
 */
export function useToggleFollow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.post(`/api/profile/${userId}/follow`);
      return response.data.data as { status: 'followed' | 'unfollowed' };
    },
    onSuccess: (_, userId) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['profile', userId, 'followers'] });
      queryClient.invalidateQueries({ queryKey: ['profile', userId, 'following'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'suggestions'] });
    },
  });
}

/**
 * Check if current user is following another user
 */
export function useIsFollowing(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId, 'is-following'],
    queryFn: async () => {
      if (!userId) return false;
      const response = await api.get(`/api/profile/${userId}/is-following`);
      return response.data.data.isFollowing as boolean;
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get suggested users to follow
 */
export function useSuggestedUsers(limit: number = 10) {
  return useQuery({
    queryKey: ['profile', 'suggestions', limit],
    queryFn: async () => {
      const response = await api.get(`/api/profile/suggestions?limit=${limit}`);
      return response.data.data as UserProfile[];
    },
    retry: 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Delete user account
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await api.delete('/api/profile/me');
      return response.data;
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      // Redirect to onboarding or login
      window.location.href = '/onboarding';
    },
  });
}
