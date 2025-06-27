
// Энэ файл нь апп-ын бүх хэсэгт ашиглагдах TypeScript-ийн custom төрлүүдийг
// нэг дор тодорхойлсон файл юм. Энэ нь кодын уншигдах байдал,
// засварлахад хялбар байдлыг хангаж, төрлийн алдаанаас сэргийлдэг.

import type { LucideIcon } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

// Апп-ын хэлний төрөл
export type Language = 'mn' | 'cn';

// Хотын мэдээллийн төрөл
export interface City {
  value: string;
  label: string;
  label_cn?: string;
  isMajor?: boolean;
  order?: number;
  cityType?: 'major' | 'other' | 'all';
  id?: string;
}

// Нисэх онгоцны буудлын мэдээллийн төрөл
export interface Airport {
  value:string;
  label: string;
  city: string;
  iata: string;
  searchTerms: string;
}

// Үйлчилгээний группийн ID төрөл
export type ServiceGroupId = 'flights' | 'hotels' | 'translators' | 'wechat' | 'markets' | 'factories' | 'hospitals' | 'embassies';

// Үйлчилгээний группийн бүтцийн төрөл
export interface ServiceGroup {
  id: ServiceGroupId;
  titleKey: string;
  icon: LucideIcon;
  href: string;
}

// Нүүр хуудасны баннер зургийн төрөл
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

// Апп-ын ерөнхий item-ийн төрөл
export type ItemType = 'service' | 'translator' | 'hotel' | 'wechat' | 'promo' | 'market' | 'factory' | 'hospital' | 'embassy' | 'flight' | 'message' | 'order' | 'update' | 'general';

// Дэлгэрэнгүй хуудсанд харагдах зургийн слайдын төрөл
export interface ShowcaseItem {
  description: string;
  imageUrl: string;
  name?: string;
  dataAiHint?: string;
  [key: string]: any;
}

// Санал болгох үйлчилгээ, барааны ерөнхий бүтцийн төрөл
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
  availableCities?: string | null;
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
  mongolianPhoneNumber?: string | null;
  chinaPhoneNumber?: string | null;
  wechatId?: string | null;
  wechatQrImageUrl?: string | null;
  rooms?: Array<{
    description: string;
    imageUrl: string;
    name?: string;
    dataAiHint?: string;
    [key: string]: any;
  }>;
  showcaseItems?: ShowcaseItem[];
  subcategory?: string | null;
  link?: string;
}

// Хэрэглэгчийн профайлын бүтцийн төрөл
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
  fcmToken?: string | null;
  lastTokenUpdate?: Timestamp;
  points?: number;
}

// Захиалгын мэдээллийн төрөл
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
  mongolianPhoneNumber?: string | number | null | undefined;
  chinaPhoneNumber?: string | number | null | undefined;
  wechatId?: string | number | null | undefined;
  wechatQrImageUrl?: string | null | undefined;
}

// AuthContext-ийн төрөл
export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePhoneNumber: (phoneNumber: string) => Promise<void>;
  updateUserPassword: (currentPass: string, newPass: string) => Promise<void>;
  updatePersonalInformation: (data: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'dateOfBirth' | 'gender' | 'homeAddress'>>) => Promise<void>;
  updateProfilePicture: (photoURL: string) => Promise<void>;
  sendVerificationEmailForUnverifiedUser: (email: string, pass: string) => Promise<void>;
  savedItemIds: Set<string>;
  isItemFavorite: (itemId: string) => boolean;
  addFavorite: (item: RecommendedItem) => Promise<void>;
  removeFavorite: (itemId: string) => Promise<void>;
}

// Хадгалсан зүйлийн документ-ийн төрөл (Firestore)
export interface SavedDocData extends RecommendedItem {
  savedAt: Timestamp | any;
}

// Мэдэгдлийн мэдээллийн төрөл
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

// Эмнэлгийн ангиллын төрөл
export interface HospitalCategory {
  id: string;
  titleKey: string;
  imageUrl?: string;
  Icon?: LucideIcon;
  dataAiHint?: string;
  href: string;
  isSpecial?: boolean;
}

// Элчин сайдын яамны ангиллын төрөл
export interface EmbassyCategoryItem {
  id: string;
  titleKey: string;
  imageUrl: string;
  dataAiHint: string;
  href: string;
}

// WeChat үйлчилгээний ангиллын төрөл
export interface WeChatCategoryItem {
  id: string;
  titleKey: string;
  iconType: 'lucide' | 'image';
  iconNameOrUrl: string;
  dataAiHint?: string;
  href: string;
}

// Орчуулагчтай холбоотой төрлүүд
export type Nationality = 'mongolian' | 'chinese' | 'inner_mongolian' | '';
export type LanguageLevel = 'good' | 'intermediate' | 'basic' | '';
export type DailyRateRange = '100-200' | '200-300' | '300-400' | '400-500' | '500+' | '';
export type TranslationField = 'tourism' | 'medical' | 'equipment' | 'exhibition' | 'official_documents' | 'official_speech' | 'machinery';

// Орчуулагчийн дэлгэрэнгүй мэдээллийн төрөл
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
  chineseExamDetails?: string | null;
  speakingLevel?: LanguageLevel | null;
  writingLevel?: LanguageLevel | null;
  workedAsTranslator?: boolean | null;
  translationFields?: string | null; 
  canWorkInOtherCities?: string | null; 
  dailyRate?: DailyRateRange | null;
  mongolianPhoneNumber?: string | null;
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

// Хадгалсан хуудасны item-ийн төрөл
export interface SavedPageItem extends RecommendedItem {
  savedAt: Timestamp | any;
}

// Сэтгэгдлийн мэдээллийн төрөл
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

// Хадгалсан хуудасны шүүлтүүрийн төрөл
export type SavedItemCategoryFilter = ItemType | 'all';

// Түгээмэл асуулт, хариултын төрөл
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

// Апп-ын хувилбарын мэдээллийн төрөл
export interface AppVersion {
  version: string;
  isForceUpdate: boolean;
  updateMessage: {
    mn: string;
    cn: string;
  };
}
