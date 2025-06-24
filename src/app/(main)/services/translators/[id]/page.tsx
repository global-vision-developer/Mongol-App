
import type { Metadata } from 'next';
import TranslatorDetailClientPage from './TranslatorDetailClientPage';
import { collection, getDocs, doc, getDoc, type DocumentData, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import type { Translator, ItemType, Nationality, LanguageLevel, DailyRateRange, TranslationField } from '@/types';

// Helper function to map language level string to LanguageLevel type
const mapLanguageLevel = (levelString?: string): LanguageLevel | null => {
  if (!levelString) return null;
  const lowerLevel = levelString.toLowerCase();
  if (lowerLevel.includes('сайн') || lowerLevel.includes('good')) return 'good';
  if (lowerLevel.includes('дунд') || lowerLevel.includes('intermediate')) return 'intermediate';
  if (lowerLevel.includes('анхан') || lowerLevel.includes('basic')) return 'basic';
  return null;
};

// Helper function to map price number to DailyRateRange type
const mapPriceToDailyRate = (price?: number): DailyRateRange | null => {
  if (price === undefined || price === null) return null;
  if (price <= 200) return '100-200'; 
  if (price <= 300) return '200-300';
  if (price <= 400) return '300-400';
  if (price <= 500) return '400-500';
  return '500+';
};

const mapHuisToGender = (huis?: string): 'male' | 'female' | 'other' | null => {
  if (!huis) return null;
  if (huis.toLowerCase() === 'эм' || huis.toLowerCase() === 'female') return 'female';
  if (huis.toLowerCase() === 'эр' || huis.toLowerCase() === 'male') return 'male';
  return null; 
};


async function getItemData(id: string): Promise<Translator | null> {
  try {
    const docRef = doc(db, "entries", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const entryData = docSnap.data();
      if (entryData.categoryName === "translators") {
        const nestedData = entryData.data || {};
        
        const registeredAtRaw = nestedData.registeredAt || nestedData.createdAt; 
        const registeredAtDate = registeredAtRaw instanceof Timestamp
                                  ? registeredAtRaw.toDate()
                                  : (registeredAtRaw && typeof registeredAtRaw === 'string' ? new Date(registeredAtRaw) : undefined);
        
        const rawPhotoUrlInput = nestedData['cover-image'] || nestedData.photoUrl;
        const serviceName = nestedData.name || 'Translator'; 
        const photoPlaceholder = `https://placehold.co/600x400.png?text=${encodeURIComponent(serviceName.charAt(0))}`;
        let photoUrlToUse: string;

        if (typeof rawPhotoUrlInput === 'string' && rawPhotoUrlInput.trim() !== '') {
          photoUrlToUse = rawPhotoUrlInput.trim();
        } else {
          photoUrlToUse = photoPlaceholder;
        }
        
        const rawWeChatQrUrl = nestedData.wechatQrImageUrl;
        let processedWeChatQrUrl: string | undefined = undefined;
        if (typeof rawWeChatQrUrl === 'string' && rawWeChatQrUrl.trim() !== '') {
           const trimmedQrUrl = rawWeChatQrUrl.trim();
           processedWeChatQrUrl = trimmedQrUrl;
        }
        
        const nationalityValue = nestedData.nationality || nestedData.irgenshil; 

        return {
          id: docSnap.id,
          uid: nestedData.uid || docSnap.id,
          name: serviceName,
          photoUrl: photoUrlToUse,
          nationality: nationalityValue as Nationality || null,
          inChinaNow: typeof nestedData.inChinaNow === 'boolean' ? nestedData.inChinaNow : (nestedData.experience === true ? true : null), 
          yearsInChina: typeof nestedData.yearsInChina === 'number' ? nestedData.yearsInChina : (typeof nestedData['jil'] === 'number' ? nestedData['jil'] : null), 
          currentCityInChina: nestedData.city || null, // City ID
          chineseExamTaken: !!nestedData.exam,
          chineseExamDetails: nestedData.exam || null,
          speakingLevel: mapLanguageLevel(nestedData['yarianii-tuwshin']),
          writingLevel: mapLanguageLevel(nestedData['bichgiin-tuwshin']),
          workedAsTranslator: typeof nestedData.experience === 'boolean' ? nestedData.experience : null,
          translationFields: nestedData.sector || null, // Store raw sector string
          canWorkInOtherCities: nestedData.wcities || null, 
          dailyRate: mapPriceToDailyRate(nestedData.price),
          chinaPhoneNumber: nestedData['china-number'] ? String(nestedData['china-number']) : (nestedData['phone-number'] ? String(nestedData['phone-number']) : null),
          wechatId: nestedData['we-chat-id'] ? String(nestedData['we-chat-id']) : null,
          wechatQrImageUrl: processedWeChatQrUrl, 
          city: nestedData.city || null, // City ID
          averageRating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : null,
          reviewCount: typeof nestedData.reviewCount === 'number' ? nestedData.reviewCount : 0,
          totalRatingSum: typeof nestedData.totalRatingSum === 'number' ? nestedData.totalRatingSum : 0,
          description: nestedData.description || '',
          gender: mapHuisToGender(nestedData.huis),
          itemType: 'translator' as ItemType,
          registeredAt: registeredAtDate,
          isActive: typeof nestedData.isActive === 'boolean' ? nestedData.isActive : true, 
          isProfileComplete: typeof nestedData.isProfileComplete === 'boolean' ? nestedData.isProfileComplete : true, 
          views: typeof nestedData.views === 'number' ? nestedData.views : 0,
          dataAiHint: nestedData.dataAiHint || "translator portrait",
        } as Translator;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching translator data for pre-rendering:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const item = await getItemData(params.id);
  return {
    title: item ? item.name : `Translator ${params.id}`,
  };
}

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const entriesRef = collection(db, "entries");
    
    const q = query(entriesRef, where("categoryName", "==", "translators"));
    const snapshot = await getDocs(q);
    const paths = snapshot.docs.map((doc) => ({
      id: doc.id,
    }));
    return paths;
  } catch (error) {
    console.error("Error fetching translator IDs for generateStaticParams:", error);
    return [];
  }
}

export default async function TranslatorDetailPageServer({ params }: { params: { id: string } }) {
  const itemData = await getItemData(params.id);
  return <TranslatorDetailClientPage itemData={itemData} params={params} itemType="translator" />;
}
