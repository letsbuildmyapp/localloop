export type Role = "buyer" | "seller" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: Role;
  city?: string;
  bio?: string;
  suspended?: boolean;
  createdAt: number;
}

export type Category =
  | "cleaning"
  | "handyman"
  | "dog-walking"
  | "lawn-care"
  | "moving-help"
  | "tutoring";

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhoto?: string;
  title: string;
  description: string;
  category: Category;
  city: string;
  priceCents: number; // per hour or per service
  unit: "hour" | "visit" | "project";
  images: string[];
  rating: number; // average rating
  reviewCount: number;
  active: boolean;
  suspended?: boolean;
  createdAt: number;
}

export type BookingStatus =
  | "requested"
  | "accepted"
  | "declined"
  | "paid"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  scheduledFor: number; // ms epoch
  hours: number;
  totalCents: number;
  status: BookingStatus;
  notes?: string;
  paidAt?: number;
  createdAt: number;
}

export interface Conversation {
  id: string;
  participants: string[]; // [buyerId, sellerId]
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string | undefined>;
  listingId?: string;
  listingTitle?: string;
  lastMessage?: string;
  lastMessageAt?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: number;
}

export interface Review {
  id: string;
  listingId: string;
  bookingId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  rating: number; // 1-5
  text: string;
  createdAt: number;
}
