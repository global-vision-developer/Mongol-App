
import type { LucideIcon } from 'lucide-react';

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

export interface RecommendedItem {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  gender?: string;
  city?: string; // This might represent the primary city of the service/item itself
  testLevel?: string;
  speakingLevel?: string;
  writingLevel?: string;
  hasWorkedBefore?: boolean;
  possibleFields?: string[];
  availableCities?: string[] | string; // For translators, can be array or string
  price?: number | string; // Price can be a number or a descriptive string (e.g. "100-200元/日")
  rating?: number;
  location?: string;
  primaryLanguage?: string;
  availabilityStatus?: string;
  dataAiHint?: string;
  itemType?: 'service' | 'translator' | 'hotel' | 'wechat' | 'promo' | 'market' | 'factory' | 'hospital' | 'embassy';
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
}

export interface Order {
  id: string;
  serviceName: string;
  date: string; // ISO string
  status: 'pending' | 'confirmed' | 'cancelled';
  // Add other order details
}

// This type will represent the data structure stored in Firestore for a saved item
// and used for the state in the /saved page.
export interface SavedDocData extends RecommendedItem {
  savedAt: any; // For Firestore Timestamp (e.g., FieldValue from 'firebase/firestore')
}


export interface NotificationItem {
  id:string;
  titleKey: string;
  descriptionKey: string;
  date: string; // ISO string
  read: boolean;
  imageUrl?: string;
  dataAiHint?: string;
  link?: string;
}

export interface HospitalCategory {
  id: string;
  titleKey: string;
  imageUrl?: string; // For most categories
  Icon?: LucideIcon; // For special categories like "All"
  dataAiHint?: string;
  href: string;
  isSpecial?: boolean; // To differentiate styling for "All Categories"
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
  iconNameOrUrl: string; // Lucide icon name or image URL
  dataAiHint?: string;
  href: string;
}

// For Translator Registration Form
export type Nationality = 'mongolian' | 'chinese' | 'inner_mongolian' | '';
export type LanguageLevel = 'good' | 'intermediate' | 'basic' | '';
export type DailyRateRange = '100-200' | '200-300' | '300-400' | '400-500' | '500+' | '';

// This type is defined in constants.ts now
export type TranslationField = 'tourism' | 'medical' | 'equipment' | 'exhibition' | 'official_documents' | 'official_speech' | 'machinery';


export interface Translator {
  id: string; // user.uid will be used as the document ID in 'translators' collection
  uid: string;
  name: string; // From UserProfile.displayName initially
  photoUrl?: string; // From UserProfile.photoURL initially
  
  nationality?: Nationality;
  inChinaNow?: boolean | undefined; // Added undefined
  yearsInChina?: number | null; // Only if inChinaNow is false
  currentCityInChina?: string | null; // Only if inChinaNow is true, CITIES value
  chineseExamTaken?: boolean | undefined; // Added undefined
  speakingLevel?: LanguageLevel;
  writingLevel?: LanguageLevel;
  workedAsTranslator?: boolean | undefined; // Added undefined
  translationFields?: TranslationField[];
  canWorkInOtherCities?: string[]; // Array of CITIES values
  dailyRate?: DailyRateRange; // In Yuan
  chinaPhoneNumber?: string | null;
  wechatId?: string | null;

  // These were from the old simple form, might deprecate or merge
  city?: string; // Main city of operation - replaced by currentCityInChina or inferred
  examLevel?: string; // More generic, replaced by chineseExamTaken + details if any
  // speakingLevel & writingLevel kept but with new types
  // workedBefore renamed to workedAsTranslator
  // availableFields renamed to translationFields
  // availableCities renamed to canWorkInOtherCities
  price?: number | string; // Replaced by dailyRate
  rating?: number; 
  
  // Image URLs from Firebase Storage (to be implemented in a future step)
  idCardFrontImageUrl?: string;
  idCardBackImageUrl?: string;
  selfieImageUrl?: string;
  wechatQrImageUrl?: string;

  registeredAt?: any; 
  isActive?: boolean; 
  isProfileComplete?: boolean; // For multi-step registration
}


// This type is for the state in `SavedPage` after fetching from Firestore
// and ensuring it has all necessary fields for ServiceCard plus `savedAt`.
// The document ID in Firestore will be the original item's ID.
// So, `id` property of SavedPageItem will be the original item's ID.
export interface SavedPageItem extends RecommendedItem {
  savedAt: any; // Firestore Timestamp
}
