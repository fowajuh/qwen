export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'user' | 'business_owner' | 'host' | 'admin';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string;
  google_place_id?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  logo_url?: string;
  cover_image_url?: string;
  images: string[];
  rating: number;
  review_count: number;
  price_level: 1 | 2 | 3 | 4;
  is_verified: boolean;
  is_approved: boolean;
  trust_score: number;
  response_time_minutes: number;
  jobs_completed: number;
  retention_rate: number;
  tags: string[];
  opening_hours?: OpeningHours;
  amenities: string[];
  created_at: string;
  updated_at: string;
}

export interface OpeningHours {
  monday?: { open: string; close: string; is_closed: boolean };
  tuesday?: { open: string; close: string; is_closed: boolean };
  wednesday?: { open: string; close: string; is_closed: boolean };
  thursday?: { open: string; close: string; is_closed: boolean };
  friday?: { open: string; close: string; is_closed: boolean };
  saturday?: { open: string; close: string; is_closed: boolean };
  sunday?: { open: string; close: string; is_closed: boolean };
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price: number;
  price_display: string;
  duration_minutes: number;
  category: string;
  is_available: boolean;
  requires_booking: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  business_id: string;
  service_id?: string;
  listing_id?: string;
  booking_type: 'service' | 'housing' | 'experience';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  total_price: number;
  guest_count: number;
  special_requests?: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_intent_id?: string;
  confirmed_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface HousingListing {
  id: string;
  host_id: string;
  title: string;
  description: string;
  property_type: 'apartment' | 'house' | 'room' | 'hotel' | 'boutique' | 'luxe';
  room_type: 'entire_place' | 'private_room' | 'shared_room';
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  price_per_night: number;
  minimum_nights: number;
  maximum_nights: number;
  cleaning_fee: number;
  security_deposit: number;
  rating: number;
  review_count: number;
  is_superhost: boolean;
  is_guest_favorite: boolean;
  is_instant_book: boolean;
  self_check_in: boolean;
  images: string[];
  amenities: string[];
  house_rules: string[];
  cancellation_policy: 'flexible' | 'moderate' | 'strict' | 'super_strict';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  business_id?: string;
  listing_id?: string;
  booking_id?: string;
  rating: number;
  title?: string;
  comment: string;
  response?: string;
  response_at?: string;
  is_verified_stay: boolean;
  helpful_count: number;
  created_at: string;
}

export interface Message {
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

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  business_id?: string;
  listing_id?: string;
  last_message_at: string;
  is_archived: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'booking_request' | 'booking_confirmed' | 'review_received' | 'message' | 'payment' | 'promotion';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  booking_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'card' | 'bank_transfer' | 'wallet';
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  refund_reason?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  business_id?: string;
  listing_id?: string;
  added_at: string;
}

export interface Experience {
  id: string;
  host_id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  location: string;
  latitude: number;
  longitude: number;
  duration_minutes: number;
  price_per_person: number;
  min_participants: number;
  max_participants: number;
  images: string[];
  what_included: string[];
  requirements: string[];
  rating: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
