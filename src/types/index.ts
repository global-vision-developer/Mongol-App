
import type { LucideIcon } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

export type Language = 'mn' | 'cn';

export interface City {
  value: string;
  label: string;
  label_cn?: string;
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
  id: string;
  imageUrl: string;
  altTextKey: string; // translation key
  dataAiHint: string;
  link?: string;
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
  gender?: string;
  city?: string;
  testLevel?: string;
  speakingLevel?: string;
  writingLevel?: string;
  hasWorkedBefore?: boolean;
  possibleFields?: string[];
  availableCities?: string[] | string;
  price?: number | string | null; // Can be a string like "100-200" or a number, allow null
  rating?: number | null; // Allow null
  location?: string;
  primaryLanguage?: string;
  availabilityStatus?: string;
  dataAiHint?: string;
  itemType: ItemType; // Made mandatory
  // Fields from Translator type that might appear in RecommendedItem if it's a translator
  nationality?: Nationality;
  inChinaNow?: boolean | null;
  yearsInChina?: number | null;
  currentCityInChina?: string | null;
  chineseExamTaken?: boolean | null;
  translationFields?: TranslationField[];
  dailyRate?: DailyRateRange | null; // Allow null
  chinaPhoneNumber?: string | null; // Keep for type consistency, but control visibility
  wechatId?: string | null; // Keep for type consistency, but control visibility
  // For WeChat items
  wechatQrImageUrl?: string;
  // For Hotel items / Factory items with multiple showcases
  rooms?: Array<{ // For Hotels
    description: string;
    imageUrl: string;
    name?: string;
    [key: string]: any;
  }>;
  showcaseItems?: ShowcaseItem[]; // For Factories or other items with detailed showcases
  isMainSection?: boolean; // from data.golheseg for factories for example
  taniltsuulga?: string; // Introduction field specifically for factories if needed
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
  fcmTokens?: string[]; // Store FCM tokens for the user
  lastTokenUpdate?: Timestamp; // When the token list was last updated
  points?: number;
}

export interface Order {
  id: string; // Firestore document ID
  userId: string; // User who made the order
  serviceType: ItemType; // Type of service, matches ItemType
  serviceId: string; // ID of the translator, flight, etc.
  serviceName: string; // Name of the service/translator
  orderDate: Timestamp | any; // Firestore Timestamp for when the order was placed
  status: 'pending_payment' | 'pending_confirmation' | 'confirmed' | 'cancelled' | 'completed' | 'contact_revealed';
  amount?: number | string | null; // Amount paid or price range
  paymentDetails?: any; // Details about the payment
  contactInfoRevealed?: boolean; // Specifically for translator orders
  imageUrl?: string | null; // Image of the service/item ordered
  dataAiHint?: string | null; // AI hint for the image
}


export interface SavedDocData extends RecommendedItem {
  savedAt: Timestamp | any;
}


export interface NotificationItem {
  id: string; // Firestore document ID
  titleKey: string; // Can be a direct title string or a translation key
  descriptionKey: string; // Can be a direct description string or a translation key
  descriptionPlaceholders?: Record<string, string | number>; // For dynamic text like {{serviceName}}
  date: Timestamp | any; // Firestore Timestamp
  read: boolean;
  imageUrl?: string | null; // Optional image for the notification
  dataAiHint?: string | null; // Optional AI hint for the image
  link?: string | null; // Optional link to navigate to when clicked
  itemType: ItemType; // Type of item this notification relates to (e.g., 'order', 'promo')
  isGlobal?: boolean; // True if it's a global notification, false/undefined for user-specific
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

// For Translator Registration Form
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
  chinaPhoneNumber?: string | null; // Sensitive
  wechatId?: string | null; // Sensitive

  // Generic fields that might overlap with RecommendedItem, ensure consistency
  city?: string; // This is 'currentCityInChina' if in China, or primary operating city
  rating?: number | null;
  description?: string; // Could be a short bio
  gender?: 'male' | 'female' | 'other' | null; // From user profile eventually
  itemType: ItemType;

  idCardFrontImageUrl?: string;
  idCardBackImageUrl?: string;
  selfieImageUrl?: string;
  wechatQrImageUrl?: string;

  registeredAt?: Timestamp | any;
  isActive?: boolean;
  isProfileComplete?: boolean;
  reviewCount?: number;
  views?: number; // For display like "10/10 (436 views)"
}


export interface SavedPageItem extends RecommendedItem {
  savedAt: Timestamp | any;
}
