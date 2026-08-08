import { Router } from 'express';
import { messageService } from '../services/message.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { db } from '../config/database.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/messages/conversations
 * Get all conversations for authenticated user
 */
router.get('/conversations', (req, res) => {
  try {
    const userId = req.user!.id;
    const conversations = messageService.getConversations(userId);
    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ success: false, error: 'Failed to get conversations' });
  }
});

/**
 * GET /api/messages/contacts
 * Get all contacts (users + businesses from scouting system)
 */
router.get('/contacts', (req, res) => {
  try {
    const userId = req.user!.id;
    const { lat, lng, radius } = req.query;
    
    let contacts: any[] = [];
    
    // If location provided, get nearby business contacts from scouting system
    if (lat && lng) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const radiusKm = radius ? parseFloat(radius as string) : 10;
      
      const businessContacts = messageService.getBusinessContactsForArea(
        userId,
        latitude,
        longitude,
        radiusKm
      );
      
      contacts = [...contacts, ...businessContacts];
    }
    
    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({ success: false, error: 'Failed to get contacts' });
  }
});

/**
 * GET /api/messages/search
 * Search contacts
 */
router.get('/search', (req, res) => {
  try {
    const userId = req.user!.id;
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ success: false, error: 'Search query required' });
    }
    
    const results = messageService.searchContacts(q, userId);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error searching contacts:', error);
    res.status(500).json({ success: false, error: 'Failed to search contacts' });
  }
});

/**
 * POST /api/messages/conversation
 * Get or create a conversation
 */
router.post('/conversation', (req, res) => {
  try {
    const userId = req.user!.id;
    const { participantId, businessId, listingId } = req.body;
    
    if (!participantId) {
      return res.status(400).json({ success: false, error: 'Participant ID required' });
    }
    
    const conversation = messageService.getOrCreateConversation(
      userId,
      participantId,
      businessId,
      listingId
    );
    
    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ success: false, error: 'Failed to create conversation' });
  }
});

/**
 * GET /api/messages/:conversationId
 * Get messages in a conversation
 */
router.get('/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const messages = messageService.getMessages(
      conversationId,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ success: false, error: 'Failed to get messages' });
  }
});

/**
 * POST /api/messages/:conversationId/send
 * Send a message
 */
router.post('/:conversationId/send', (req, res) => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const { content, messageType = 'text' } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Message content required' });
    }
    
    // FIX: this used to run `require('better-sqlite3')()` — opening a
    // brand new, completely empty, unnamed SQLite database from scratch on
    // every single message send, instead of using the app's real
    // database connection. That database never contained a
    // `conversations` table, so this line either threw
    // "no such table: conversations" or silently talked to a database
    // nobody could ever read from again. It now uses the same shared
    // connection as the rest of the app.
    const convStmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
    const conversation = convStmt.get(conversationId) as any;
    
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    
    const recipientId = conversation.participant_1_id === userId 
      ? conversation.participant_2_id 
      : conversation.participant_1_id;
    
    const message = messageService.sendMessage({
      conversation_id: conversationId,
      sender_id: userId,
      recipient_id: recipientId,
      content: content.trim(),
      message_type: messageType,
    });
    
    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

/**
 * POST /api/messages/:conversationId/read
 * Mark messages as read
 */
router.post('/:conversationId/read', (req, res) => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    
    messageService.markAsRead(conversationId, userId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark messages as read' });
  }
});

/**
 * GET /api/messages/unread/count
 * Get unread message count
 */
router.get('/unread/count', (req, res) => {
  try {
    const userId = req.user!.id;
    const count = messageService.getUnreadCount(userId);
    
    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ success: false, error: 'Failed to get unread count' });
  }
});

export default router;
