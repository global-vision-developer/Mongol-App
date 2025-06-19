
import type { LucideIcon } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

export type Language = 'mn' | 'cn';

export interface City {
  value: string;
  label: string;
  label_cn?: string;
  isMajor?: boolean; // Added for categorizing cities
}

export interface Airport {
  value: string; // IATA code
  label: string; // Display label, e.g., City / City_MN (IATA)
  city: string;
  iata: string;
  searchTerms: string; // Concatenated string of name, mongolian name, city, iata for searching
}


export type ServiceGroupId = 'flights' | 'hotels' | 'translators' | 'wechat' | 'markets' | 'factories' | 'hospitals' | 'embassies';

export interface ServiceGroup {
  id: ServiceGroupId;
  titleKey: string; // translation key
  icon: LucideIcon;
  href: string;
}

export interface CarouselBannerItem {
  id: string; // Firestore document ID
  imageUrl: string;
  link?: string;
  altText?: string; // Use Firestore description or a generic alt text
  dataAiHint?: string; // Generic hint if not in Firestore data
  isActive?: boolean;
  createdAt?: Timestamp | any; // For ordering
  description?: string; // Original description from Firestore, can be used for altText
}

export type ItemType = 'service' | 'translator' | 'hotel' | 'wechat' | 'promo' | 'market' | 'factory' | 'hospital' | 'embassy' | 'flight' | 'message' | 'order' | 'update';

export interface ShowcaseItem {
  description: string;
  imageUrl: string;
  name?: string; // Optional name for the showcase item
  [key: string]: any; // Allow other potential item-specific fields
}

export interface RecommendedItem {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  gender?: 'male' | 'female' | 'other' | null; // Ensure gender is part of RecommendedItem
  city?: string; // General city/location if applicable
  testLevel?: string;
  speakingLevel?: string;
  writingLevel?: string;
  hasWorkedBefore?: boolean;
  possibleFields?: string[];
  availableCities?: string[] | string;
  price?: number | string | null;
  averageRating?: number | null;
  reviewCount?: number;
  totalRatingSum?: number;
  location?: string; // More specific location if different from city
  primaryLanguage?: string;
  availabilityStatus?: string;
  dataAiHint?: string;
  itemType: ItemType;
  nationality?: Nationality;
  inChinaNow?: boolean | null;
  yearsInChina?: number | null;
  currentCityInChina?: string | null; // Specifically for translators if needed
  chineseExamTaken?: boolean | null;
  translationFields?: TranslationField[];
  dailyRate?: DailyRateRange | null;
  chinaPhoneNumber?: string | null;
  wechatId?: string | null;
  wechatQrImageUrl?: string;
  rooms?: Array<{
    description: string;
    imageUrl: string;
    name?: string;
    [key: string]: any;
  }>;
  showcaseItems?: ShowcaseItem[];
  isMainSection?: boolean;
  taniltsuulga?: string;
  subcategory?: string | null; 
}

export interface UserProfile {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  lastName?: string | null;
  firstName?: string | null;
  dateOfBirth?: string | null; // Store as ISO string (YYYY-MM-DD)
  gender?: 'male' | 'female' | 'other' | null;
  homeAddress?: string | null;
  fcmTokens?: string[];
  lastTokenUpdate?: Timestamp;
  points?: number;
}

export interface Order {
  id: string;
  userId: string;
  serviceType: ItemType;
  serviceId: string;
  serviceName: string;
  orderDate: Timestamp | any;
  status: 'pending_payment' | 'pending_confirmation' | 'confirmed' | 'cancelled' | 'completed' | 'contact_revealed';
  amount?: number | string | null;
  paymentDetails?: any;
  contactInfoRevealed?: boolean;
  imageUrl?: string | null;
  dataAiHint?: string | null;
  chinaPhoneNumber?: string | null;
  wechatId?: string | null;
  wechatQrImageUrl?: string | null;
}


export interface SavedDocData extends RecommendedItem { // SavedDocData inherits RecommendedItem, so gender will be there
  savedAt: Timestamp | any;
}


export interface NotificationItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  descriptionPlaceholders?: Record<string, string | number | null | undefined>; 
  date: Timestamp | any;
  read: boolean;
  imageUrl?: string | null;
  dataAiHint?: string | null;
  link?: string | null;
  itemType: ItemType;
  isGlobal?: boolean;
}

export interface HospitalCategory {
  id: string;
  titleKey: string;
  imageUrl?: string;
  Icon?: LucideIcon;
  dataAiHint?: string;
  href: string;
  isSpecial?: boolean;
}

export interface EmbassyCategoryItem {
  id: string;
  titleKey: string;
  imageUrl: string;
  dataAiHint: string;
  href: string;
}

export interface WeChatCategoryItem {
  id: string;
  titleKey: string;
  iconType: 'lucide' | 'image';
  iconNameOrUrl: string;
  dataAiHint?: string;
  href: string;
}

export type Nationality = 'mongolian' | 'chinese' | 'inner_mongolian' | '';
export type LanguageLevel = 'good' | 'intermediate' | 'basic' | '';
export type DailyRateRange = '100-200' | '200-300' | '300-400' | '400-500' | '500+' | '';
export type TranslationField = 'tourism' | 'medical' | 'equipment' | 'exhibition' | 'official_documents' | 'official_speech' | 'machinery';


export interface Translator {
  id: string;
  uid: string;
  name: string;
  photoUrl?: string | null;
  nationality?: Nationality | null;
  inChinaNow?: boolean | null;
  yearsInChina?: number | null;
  currentCityInChina?: string | null;
  chineseExamTaken?: boolean | null;
  speakingLevel?: LanguageLevel | null;
  writingLevel?: LanguageLevel | null;
  workedAsTranslator?: boolean | null;
  translationFields?: TranslationField[] | null;
  canWorkInOtherCities?: string[] | null;
  dailyRate?: DailyRateRange | null;
  chinaPhoneNumber?: string | null;
  wechatId?: string | null;
  city?: string;
  averageRating?: number | null;
  reviewCount?: number;
  totalRatingSum?: number;
  description?: string;
  gender?: 'male' | 'female' | 'other' | null;
  itemType: ItemType;
  idCardFrontImageUrl?: string;
  idCardBackImageUrl?: string;
  selfieImageUrl?: string;
  wechatQrImageUrl?: string;
  registeredAt?: Timestamp | Date | string; // Allow Date or string for flexibility
  isActive?: boolean;
  isProfileComplete?: boolean;
  views?: number;
}


export interface SavedPageItem extends RecommendedItem { // SavedPageItem inherits RecommendedItem
  savedAt: Timestamp | any;
  // Ensure fields like gender, currentCityInChina are available from RecommendedItem
}

export interface Review {
  id: string; 
  itemId: string;
  itemType: ItemType;
  userId: string;
  userName?: string | null;
  userPhotoUrl?: string | null;
  rating: number; 
  comment?: string;
  createdAt: Timestamp | any;
  updatedAt?: Timestamp | any;
}

export type SavedItemCategoryFilter = ItemType | 'all';
