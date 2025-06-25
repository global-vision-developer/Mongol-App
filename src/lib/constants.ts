
import type { ServiceGroup, HospitalCategory, EmbassyCategoryItem, WeChatCategoryItem, RecommendedItem, Airport, TranslationField } from '@/types';
import { Plane, BedDouble, Users, Smartphone, ShoppingCart, FactoryIcon, HospitalIcon, Landmark, Grid3x3, BusFront, CarTaxiFront, Copy } from 'lucide-react';

export const AIRPORTS: Airport[] = [
  { value: "UBN", label: "Ulaanbaatar / Улаанбаатар (UBN)", city: "Улаанбаатар", iata: "UBN", searchTerms: "Ulaanbaatar Улаанбаатар UBN ULN CIN" },
  { value: "ERL", label: "Ereen / Эрээн хот (ERL)", city: "Эрээн хот", iata: "ERL", searchTerms: "Ereen Эрээн хот ERL" },
  { value: "HET", label: "Hohhot / Хөххот (HET)", city: "Хөххот", iata: "HET", searchTerms: "Hohhot Хөххот HET" },
  { value: "BJS", label: "Beijing / Бээжин (BJS)", city: "Бээжин", iata: "BJS", searchTerms: "Beijing Бээжин BJS PEK PKX" },
  { value: "CAN", label: "Guangzhou / Гуанжоу (CAN)", city: "Гуанжоу", iata: "CAN", searchTerms: "Guangzhou Гуанжоу CAN" },
  { value: "SHA", label: "Shanghai / Шанхай (SHA)", city: "Шанхай", iata: "SHA", searchTerms: "Shanghai Шанхай SHA PVG" },
  { value: "SZX", label: "Shenzhen / Шэнжэнь (SZX)", city: "Шэнжэнь", iata: "SZX", searchTerms: "Shenzhen Шэнжэнь SZX" },
  { value: "DLC", label: "Dalian / Далиан (DLC)", city: "Далиан", iata: "DLC", searchTerms: "Dalian Далиан DLC" },
  { value: "XIL", label: "Xilinhot / Шилийн хот (XIL)", city: "Шилийн хот", iata: "XIL", searchTerms: "Xilinhot Шилийн хот XIL" },
  { value: "CTU", label: "Chengdu / Чэндү (CTU)", city: "Чэндү", iata: "CTU", searchTerms: "Chengdu Чэндү CTU TFU" },
  { value: "YIW", label: "Yiwu / Ивү (YIW)", city: "Ивү", iata: "YIW", searchTerms: "Yiwu Ивү YIW" },
];


export const SERVICE_GROUPS: ServiceGroup[] = [
  { id: 'flights', titleKey: 'flights', icon: Plane, href: '/services/flights' },
  { id: 'hotels', titleKey: 'hotels', icon: BedDouble, href: '/services/hotels' },
  { id: 'translators', titleKey: 'translators', icon: Users, href: '/services/translators '},
  { id: 'wechat', titleKey: 'wechat', icon: Smartphone, href: '/services/wechat' },
  { id: 'markets', titleKey: 'markets', icon: ShoppingCart, href: '/services/markets' },
  { id: 'factories', titleKey: 'factories', icon: FactoryIcon, href: '/services/factories' },
  { id: 'hospitals', titleKey: 'hospitals', icon: HospitalIcon, href: '/services/hospitals' },
  { id: 'embassies', titleKey: 'embassies', icon: Landmark, href: '/services/embassies' },
];


export const HOSPITAL_CATEGORIES: HospitalCategory[] = [
  { id: 'traditional', titleKey: 'hospitalCategoryTraditional', imageUrl: 'https://placehold.co/100x100.png', dataAiHint: 'doctors patient', href: '#' },
  { id: 'innermongolia', titleKey: 'hospitalCategoryInnerMongolia', imageUrl: 'https://placehold.co/100x100.png', dataAiHint: 'hospital building', href: '#' },
  { id: 'guangzhou', titleKey: 'hospitalCategoryGuangzhou', imageUrl: 'https://placehold.co/100x100.png', dataAiHint: 'modern hospital', href: '#' },
  { id: 'shanghai', titleKey: 'hospitalCategoryShanghai', imageUrl: 'https://placehold.co/100x100.png', dataAiHint: 'hospital facade', href: '#' },
  { id: 'beijing', titleKey: 'hospitalCategoryBeijing', imageUrl: 'https://placehold.co/100x100.png', dataAiHint: 'large hospital', href: '#' },
  { id: 'all', titleKey: 'allCategories', Icon: Grid3x3, href: '#' , isSpecial: true},
];

export const EMBASSY_SERVICE_CATEGORIES: EmbassyCategoryItem[] = [
  { id: 'mfa', titleKey: 'embassyMFA', imageUrl: 'https://placehold.co/150x100.png', dataAiHint: 'government building emblem', href: '#' },
  { id: 'consulate', titleKey: 'embassyConsulate', imageUrl: 'https://placehold.co/150x100.png', dataAiHint: 'official building emblem', href: '#' },
];

export const WECHAT_CATEGORIES: WeChatCategoryItem[] = [
  { id: 'bus', titleKey: 'wechatBus', iconType: 'lucide', iconNameOrUrl: 'BusFront', href: '#' },
  { id: 'taxi', titleKey: 'wechatTaxi', iconType: 'lucide', iconNameOrUrl: 'CarTaxiFront',  href: '#' },
  { id: 'kidsFashion', titleKey: 'wechatKidsFashion', iconType: 'image', iconNameOrUrl: 'https://placehold.co/100x100.png',dataAiHint:"kids fashion", href: '#' },
  { id: 'beautyProducts', titleKey: 'wechatBeautyProducts', iconType: 'image', iconNameOrUrl: 'https://placehold.co/100x100.png',dataAiHint:"beauty products",  href: '#' },
  { id: 'abCopy', titleKey: 'wechatABCopy', iconType: 'lucide', iconNameOrUrl: 'Copy',  href: '#' },
  { id: 'allCategories', titleKey: 'wechatAllCategories', iconType: 'lucide', iconNameOrUrl: 'Grid3x3', href: '#' },
];

export const WECHAT_PLACEHOLDER_ITEMS: RecommendedItem[] = [
  { id: 'lejuSandal', name: 'LEJU Сандал', imageUrl: 'https://placehold.co/400x250.png', dataAiHint: 'sandal furniture', location: 'Foshan / Фошан' },
  { id: 'boshengTavilga', name: 'Bosheng тавилга', imageUrl: 'https://placehold.co/400x250.png', dataAiHint: 'furniture home',  location: 'Foshan / Фошан' },
  { id: 'linda', name: 'Linda', imageUrl: 'https://placehold.co/400x250.png', dataAiHint: 'fashion accessory',  location: 'Guangzhou / Гуанж...' },
  { id: 'shurSuvdanGoyol', name: 'Шүр сувдан гоёл', imageUrl: 'https://placehold.co/400x250.png', dataAiHint: 'jewelry pearl',  location: 'Guangzhou / Гуанж...' },
];

export const NAV_ITEMS = [
  { href: "/", labelKey: "home", icon: Landmark }, 
  { href: "/orders", labelKey: "orders", icon: ShoppingCart },
  { href: "/saved", labelKey: "saved", icon: Users }, 
  { href: "/notifications", labelKey: "notifications", icon: Plane }, 
  { href: "/profile", labelKey: "user", icon: Users } 
];

export const TranslationFields: TranslationField[] = [
  'tourism', 'medical', 'equipment', 'exhibition', 
  'official_documents', 'official_speech', 'machinery'
];
