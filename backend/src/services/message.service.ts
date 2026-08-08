import { db } from '../config/database.js';
import type { Message, Conversation, User } from '../models/types.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Contact derived from Business (for messaging businesses discovered by scouts)
 */
export interface BusinessContact {
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
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

/**
 * Message Service - handles conversations, messages, and contacts
 * Integrates with scouting system to auto-populate business contacts
 */
export class MessageService {
  /**
   * Get all conversations for a user (includes personal + business)
   */
  getConversations(userId: string): (Conversation & { 
    other_user?: User;
    business?: BusinessContact;
    last_message?: Message;
  })[] {
    const stmt = db.prepare(`
      SELECT c.*, 
        CASE WHEN c.participant_1_id = ? THEN c.participant_2_id ELSE c.participant_1_id END as other_user_id,
        m.content as last_message_content,
        m.created_at as last_message_time,
        m.sender_id as last_message_sender_id
      FROM conversations c
      LEFT JOIN messages m ON c.id = m.conversation_id AND m.created_at = (
        SELECT MAX(created_at) FROM messages WHERE conversation_id = c.id
      )
      WHERE c.participant_1_id = ? OR c.participant_2_id = ?
      ORDER BY m.created_at DESC
    `);
    
    const rows = stmt.all(userId, userId, userId) as unknown as any[];
    
    return rows.map(row => ({
      ...row,
      other_user: row.other_user_id ? this.getUserById(row.other_user_id) : undefined,
      business: row.business_id ? this.getBusinessContact(row.business_id) : undefined,
      last_message: row.last_message_content ? {
        id: uuidv4(),
        conversation_id: row.id,
        sender_id: row.last_message_sender_id,
        recipient_id: userId,
        content: row.last_message_content,
        message_type: 'text' as const,
        is_read: false,
        created_at: row.last_message_time,
      } : undefined,
    }));
  }

  /**
   * Get business contact from scouting data
   */
  getBusinessContact(businessId: string): BusinessContact | undefined {
    const stmt = db.prepare('SELECT * FROM businesses WHERE id = ?');
    const business = stmt.get(businessId) as any;
    
    if (!business) return undefined;
    
    return {
      id: `biz_${business.id}`,
      business_id: business.id,
      name: business.name,
      category: business.category,
      phone: business.phone,
      email: business.email,
      address: business.address,
      city: business.city,
      latitude: business.latitude,
      longitude: business.longitude,
      logo_url: business.logo_url,
      is_verified: business.is_verified,
      rating: business.rating,
      unread_count: 0,
    };
  }

  /**
   * Get all business contacts from scouting system for a user's area
   */
  getBusinessContactsForArea(_userId: string, latitude: number, longitude: number, radiusKm: number = 10): BusinessContact[] {
    const stmt = db.prepare(`
      SELECT *, 
        (6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(latitude))
        )) AS distance
      FROM businesses 
      WHERE is_approved = 1 AND is_verified = 1
      HAVING distance <= ?
      ORDER BY distance ASC, rating DESC
      LIMIT 50
    `);
    
    const rows = stmt.all(latitude, longitude, latitude, radiusKm) as unknown as any[];
    
    return rows.map(business => ({
      id: `biz_${business.id}`,
      business_id: business.id,
      name: business.name,
      category: business.category,
      phone: business.phone,
      email: business.email,
      address: business.address,
      city: business.city,
      latitude: business.latitude,
      longitude: business.longitude,
      logo_url: business.logo_url,
      is_verified: business.is_verified,
      rating: business.rating,
      unread_count: 0,
    }));
  }

  /**
   * Get or create conversation between two users/businesses
   */
  getOrCreateConversation(
    participant1Id: string,
    participant2Id: string,
    businessId?: string,
    listingId?: string
  ): Conversation {
    // Check if conversation exists
    const existingStmt = db.prepare(`
      SELECT * FROM conversations 
      WHERE ((participant_1_id = ? AND participant_2_id = ?) 
         OR (participant_1_id = ? AND participant_2_id = ?))
        AND is_archived = 0
    `);
    
    let existing = existingStmt.get(participant1Id, participant2Id, participant2Id, participant1Id) as any;
    
    if (existing) {
      return existing as Conversation;
    }
    
    // Create new conversation
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const insertStmt = db.prepare(`
      INSERT INTO conversations (id, participant_1_id, participant_2_id, business_id, listing_id, last_message_at, is_archived, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `);
    
    insertStmt.run(id, participant1Id, participant2Id, businessId || null, listingId || null, now, now);
    
    return {
      id,
      participant_1_id: participant1Id,
      participant_2_id: participant2Id,
      business_id: businessId,
      listing_id: listingId,
      last_message_at: now,
      is_archived: false,
      created_at: now,
    };
  }

  /**
   * Send a message
   */
  sendMessage(data: {
    conversation_id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    message_type?: 'text' | 'image' | 'booking_request' | 'booking_confirmation';
  }): Message {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO messages (id, conversation_id, sender_id, recipient_id, content, message_type, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `);
    
    stmt.run(id, data.conversation_id, data.sender_id, data.recipient_id, data.content, data.message_type || 'text', now);
    
    // Update conversation last_message_at
    const updateStmt = db.prepare('UPDATE conversations SET last_message_at = ? WHERE id = ?');
    updateStmt.run(now, data.conversation_id);
    
    return {
      id,
      conversation_id: data.conversation_id,
      sender_id: data.sender_id,
      recipient_id: data.recipient_id,
      content: data.content,
      message_type: data.message_type || 'text',
      is_read: false,
      created_at: now,
    };
  }

  /**
   * Get messages in a conversation
   */
  getMessages(conversationId: string, limit: number = 50, offset: number = 0): Message[] {
    const stmt = db.prepare(`
      SELECT * FROM messages 
      WHERE conversation_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    
    const rows = stmt.all(conversationId, limit, offset) as unknown as any[];
    
    return rows.map(row => ({
      ...row,
      is_read: !!row.is_read,
    })).reverse(); // Return in chronological order
  }

  /**
   * Mark messages as read
   */
  markAsRead(conversationId: string, userId: string): void {
    const stmt = db.prepare(`
      UPDATE messages 
      SET is_read = 1, read_at = CURRENT_TIMESTAMP 
      WHERE conversation_id = ? AND recipient_id = ? AND is_read = 0
    `);
    
    stmt.run(conversationId, userId);
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(userId) as unknown as User | undefined;
  }

  /**
   * Get unread count for a user
   */
  getUnreadCount(userId: string): number {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM messages 
      WHERE recipient_id = ? AND is_read = 0
    `);
    
    const result = stmt.get(userId) as { count: number };
    return result.count;
  }

  /**
   * Search contacts (users + businesses)
   */
  searchContacts(query: string, userId: string): (User | BusinessContact)[] {
    const searchTerm = `%${query}%`;
    
    // Search users
    const userStmt = db.prepare(`
      SELECT id, email as name, avatar_url, is_verified 
      FROM users 
      WHERE (email LIKE ? OR full_name LIKE ?) AND id != ?
      LIMIT 20
    `);
    
    const users = userStmt.all(searchTerm, searchTerm, userId) as unknown as User[];
    
    // Search businesses
    const businessStmt = db.prepare(`
      SELECT * FROM businesses 
      WHERE (name LIKE ? OR category LIKE ?) AND is_approved = 1
      LIMIT 20
    `);
    
    const businesses = businessStmt.all(searchTerm, searchTerm) as unknown as any[];
    
    const businessContacts: BusinessContact[] = businesses.map(b => ({
      id: `biz_${b.id}`,
      business_id: b.id,
      name: b.name,
      category: b.category,
      phone: b.phone,
      email: b.email,
      address: b.address,
      city: b.city,
      latitude: b.latitude,
      longitude: b.longitude,
      logo_url: b.logo_url,
      is_verified: b.is_verified,
      rating: b.rating,
      unread_count: 0,
    }));
    
    return [...users, ...businessContacts];
  }
}

export const messageService = new MessageService();
