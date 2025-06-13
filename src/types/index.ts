
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
  city?: string; 
  testLevel?: string;
  speakingLevel?: string;
  writingLevel?: string;
  hasWorkedBefore?: boolean;
  possibleFields?: string[];
  availableCities?: string[] | string; 
  price?: number | string; 
  rating?: number;
  location?: string;
  primaryLanguage?: string;
  availabilityStatus?: string;
  dataAiHint?: string;
  itemType?: 'service' | 'translator' | 'hotel' | 'wechat' | 'promo' | 'market' | 'factory' | 'hospital' | 'embassy';
  // Fields from Translator type that might appear in RecommendedItem if it's a translator
  nationality?: Nationality;
  inChinaNow?: boolean;
  yearsInChina?: number | null;
  currentCityInChina?: string | null;
  chineseExamTaken?: boolean;
  translationFields?: TranslationField[];
  dailyRate?: DailyRateRange;
  chinaPhoneNumber?: string | null; // Keep for type consistency, but control visibility
  wechatId?: string | null; // Keep for type consistency, but control visibility
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
  id: string; // Auto-generated
  userId: string; // User who made the order
  serviceType: 'translator' | 'flight' | 'hotel' | string; // Type of service
  serviceId: string; // ID of the translator, flight, etc.
  serviceName: string; // Name of the service/translator
  orderDate: any; // Firestore Timestamp for when the order was placed
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'completed';
  amount?: number; // Amount paid
  paymentDetails?: any; // Details about the payment
  contactInfoRevealed?: boolean; // Specifically for translator orders
  // Add other order details as needed
}


export interface SavedDocData extends RecommendedItem {
  savedAt: any; 
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
  photoUrl?: string; 
  
  nationality?: Nationality;
  inChinaNow?: boolean | undefined; 
  yearsInChina?: number | null; 
  currentCityInChina?: string | null; 
  chineseExamTaken?: boolean | undefined; 
  speakingLevel?: LanguageLevel;
  writingLevel?: LanguageLevel;
  workedAsTranslator?: boolean | undefined; 
  translationFields?: TranslationField[];
  canWorkInOtherCities?: string[]; 
  dailyRate?: DailyRateRange; 
  chinaPhoneNumber?: string | null; // Sensitive
  wechatId?: string | null; // Sensitive

  // Generic fields that might overlap with RecommendedItem, ensure consistency
  city?: string; // This is 'currentCityInChina' if in China, or primary operating city
  rating?: number; 
  description?: string; // Could be a short bio
  gender?: 'male' | 'female' | 'other' | null; // From user profile eventually
  
  idCardFrontImageUrl?: string;
  idCardBackImageUrl?: string;
  selfieImageUrl?: string;
  wechatQrImageUrl?: string;

  registeredAt?: any; 
  isActive?: boolean; 
  isProfileComplete?: boolean; 
  reviewCount?: number;
  views?: number; // For display like "10/10 (436 views)"
}


export interface SavedPageItem extends RecommendedItem {
  savedAt: any; 
}
