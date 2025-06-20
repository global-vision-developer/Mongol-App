
import type { LucideIcon } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

export type Language = 'mn' | 'cn';

export interface City {
  value: string; 
  label: string; 
  label_cn?: string; 
  isMajor?: boolean; 
  order?: number; 
  cityType?: 'major' | 'other' | 'all'; 
  id?: string; 
}

export interface Airport {
  value: string; 
  label: string; 
  city: string;
  iata: string;
  searchTerms: string; 
}


export type ServiceGroupId = 'flights' | 'hotels' | 'translators' | 'wechat' | 'markets' | 'factories' | 'hospitals' | 'embassies';

export interface ServiceGroup {
  id: ServiceGroupId;
  titleKey: string; 
  icon: LucideIcon;
  href: string;
}

export interface CarouselBannerItem {
  id: string; 
  imageUrl: string;
  link?: string;
  altText?: string; 
  dataAiHint?: string; 
  isActive?: boolean;
  createdAt?: Timestamp | any; 
  description?: string; 
}

export type ItemType = 'service' | 'translator' | 'hotel' | 'wechat' | 'promo' | 'market' | 'factory' | 'hospital' | 'embassy' | 'flight' | 'message' | 'order' | 'update' | 'general';

export interface ShowcaseItem {
  description: string;
  imageUrl: string;
  name?: string; 
  [key: string]: any; 
}

export interface RecommendedItem {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  gender?: 'male' | 'female' | 'other' | null; 
  city?: string; 
  testLevel?: string;
  speakingLevel?: LanguageLevel | null; 
  writingLevel?: LanguageLevel | null; 
  hasWorkedBefore?: boolean;
  possibleFields?: string[];
  availableCities?: string[] | string;
  price?: number | string | null;
  averageRating?: number | null;
  reviewCount?: number;
  totalRatingSum?: number;
  location?: string; 
  primaryLanguage?: string;
  availabilityStatus?: string;
  dataAiHint?: string;
  itemType: ItemType;
  nationality?: Nationality | null; 
  inChinaNow?: boolean | null;
  yearsInChina?: number | null;
  currentCityInChina?: string | null; 
  chineseExamTaken?: boolean | null;
  translationFields?: string | null; 
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
  dateOfBirth?: string | null; 
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
  mongolianPhoneNumber?: string | number | null; 
  chinaPhoneNumber?: string | number | null;
  wechatId?: string | number | null;
  wechatQrImageUrl?: string | null;
}


export interface SavedDocData extends RecommendedItem { 
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
  currentCityInChina?: string | null; // City ID
  chineseExamTaken?: boolean | null; 
  chineseExamDetails?: string | null; 
  speakingLevel?: LanguageLevel | null;
  writingLevel?: LanguageLevel | null;
  workedAsTranslator?: boolean | null; 
  translationFields?: string | null; 
  canWorkInOtherCities?: string | null; 
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
  wechatQrImageUrl?: string | null; 
  registeredAt?: Timestamp | Date | string; 
  isActive?: boolean;
  isProfileComplete?: boolean;
  views?: number;
  dataAiHint?: string; 
}


export interface SavedPageItem extends RecommendedItem { 
  savedAt: Timestamp | any;
  
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

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  topic: string; 
  createdAt: Timestamp;
  createdBy?: string; 
  isPredefined?: boolean; 
  updatedAt?: Timestamp; 
  order?: number; 
}

