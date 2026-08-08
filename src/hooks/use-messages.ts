import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  is_verified: boolean;
}

interface BusinessContact {
  id: string;
  business_id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  logo_url?: string;
  is_verified: boolean;
  rating: number;
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'text' | 'image' | 'booking_request' | 'booking_confirmation';
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  business_id?: string;
  listing_id?: string;
  last_message_at: string;
  is_archived: boolean;
  created_at: string;
  other_user?: User;
  business?: BusinessContact;
  last_message?: Message;
}

const API_BASE = '/api/messages';

/**
 * Hook to get all conversations for the authenticated user
 */
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/conversations`);
      if (!res.ok) throw new Error('Failed to fetch conversations');
      const data = await res.json();
      return data.data as Conversation[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to get contacts (users + businesses from scouting system)
 */
export function useContacts(location?: { lat: number; lng: number; radius?: number }) {
  const queryKey = location 
    ? ['contacts', location.lat, location.lng, location.radius]
    : ['contacts'];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (location?.lat) params.append('lat', location.lat.toString());
      if (location?.lng) params.append('lng', location.lng.toString());
      if (location?.radius) params.append('radius', location.radius.toString());
      
      const url = `${API_BASE}/contacts${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const data = await res.json();
      return data.data as BusinessContact[];
    },
    enabled: !!location, // Only fetch if location is provided
  });
}

/**
 * Hook to search contacts
 */
export function useContactSearch(query: string) {
  return useQuery({
    queryKey: ['contact-search', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to search contacts');
      const data = await res.json();
      return data.data as (User | BusinessContact)[];
    },
    enabled: query.trim().length > 0,
    debounceTime: 300,
  });
}

/**
 * Hook to get messages in a conversation
 */
export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const res = await fetch(`${API_BASE}/${conversationId}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      return data.data as Message[];
    },
    enabled: !!conversationId,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
  });
}

/**
 * Hook to send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ conversationId, content, messageType = 'text' }: {
      conversationId: string;
      content: string;
      messageType?: 'text' | 'image' | 'booking_request' | 'booking_confirmation';
    }) => {
      const res = await fetch(`${API_BASE}/${conversationId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, messageType }),
      });
      
      if (!res.ok) throw new Error('Failed to send message');
      const data = await res.json();
      return data.data as Message;
    },
    onSuccess: (_, variables) => {
      // Invalidate both the specific conversation and the conversations list
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

/**
 * Hook to mark messages as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await fetch(`${API_BASE}/${conversationId}/read`, {
        method: 'POST',
      });
      
      if (!res.ok) throw new Error('Failed to mark messages as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread'] });
    },
  });
}

/**
 * Hook to get or create a conversation
 */
export function useGetOrCreateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ participantId, businessId, listingId }: {
      participantId: string;
      businessId?: string;
      listingId?: string;
    }) => {
      const res = await fetch(`${API_BASE}/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, businessId, listingId }),
      });
      
      if (!res.ok) throw new Error('Failed to create conversation');
      const data = await res.json();
      return data.data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

/**
 * Hook to get unread message count
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['unread'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/unread/count`);
      if (!res.ok) throw new Error('Failed to fetch unread count');
      const data = await res.json();
      return data.data.count as number;
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

/**
 * Combined hook for managing a chat session
 */
export function useChat(conversationId: string | null) {
  const [newMessage, setNewMessage] = useState('');
  const messagesQuery = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  
  // Mark as read when opening conversation
  useEffect(() => {
    if (conversationId) {
      markAsRead.mutate(conversationId);
    }
  }, [conversationId]);
  
  const handleSend = async () => {
    if (!conversationId || !newMessage.trim() || sendMessage.isPending) return;
    
    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: newMessage.trim(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    isError: messagesQuery.isError,
    newMessage,
    setNewMessage,
    handleSend,
    isSending: sendMessage.isPending,
  };
}
