
import type { Metadata } from 'next';
import TranslatorDetailClientPage from './TranslatorDetailClientPage';
import { collection, getDocs, doc, getDoc, type DocumentData, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import type { Translator, ItemType, Nationality, LanguageLevel, DailyRateRange, TranslationField } from '@/types';

async function getItemData(id: string): Promise<Translator | null> {
  try {
    const docRef = doc(db, "entries", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const entryData = docSnap.data();
      if (entryData.categoryName === "translators") {
        const nestedData = entryData.data || {};
        const registeredAtRaw = nestedData.registeredAt;
        const registeredAtDate = registeredAtRaw instanceof Timestamp
                                  ? registeredAtRaw.toDate()
                                  : (registeredAtRaw && typeof registeredAtRaw === 'string' ? new Date(registeredAtRaw) : undefined);
        
        const rawPhotoUrl = nestedData['nuur-zurag-url'] || nestedData.photoUrl;
        let processedPhotoUrl: string | undefined = undefined;
        if (typeof rawPhotoUrl === 'string' && rawPhotoUrl.trim() !== '') {
          const trimmedUrl = rawPhotoUrl.trim();
          if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
            processedPhotoUrl = trimmedUrl;
          }
        }
        const serviceName = nestedData.name || 'Translator';
        const photoPlaceholder = `https://placehold.co/600x400.png?text=${encodeURIComponent(serviceName)}`;
        
        const rawWeChatQrUrl = nestedData.wechatQrImageUrl;
        let processedWeChatQrUrl: string | undefined = undefined;
        if (typeof rawWeChatQrUrl === 'string' && rawWeChatQrUrl.trim() !== '') {
           const trimmedQrUrl = rawWeChatQrUrl.trim();
           if (trimmedQrUrl.startsWith('http://') || trimmedQrUrl.startsWith('https://')) {
            processedWeChatQrUrl = trimmedQrUrl;
          }
        }

        return {
          id: docSnap.id,
          uid: nestedData.uid || docSnap.id,
          name: serviceName,
          photoUrl: processedPhotoUrl || photoPlaceholder,
          nationality: nestedData.nationality as Nationality,
          inChinaNow: nestedData.inChinaNow,
          yearsInChina: nestedData.yearsInChina,
          currentCityInChina: nestedData.currentCityInChina,
          chineseExamTaken: nestedData.chineseExamTaken,
          speakingLevel: nestedData.speakingLevel as LanguageLevel,
          writingLevel: nestedData.writingLevel as LanguageLevel,
          workedAsTranslator: nestedData.workedAsTranslator,
          translationFields: nestedData.translationFields as TranslationField[],
          canWorkInOtherCities: nestedData.canWorkInOtherCities,
          dailyRate: nestedData.dailyRate as DailyRateRange,
          chinaPhoneNumber: nestedData.chinaPhoneNumber,
          wechatId: nestedData.wechatId,
          wechatQrImageUrl: processedWeChatQrUrl, 
          city: nestedData.khot || nestedData.currentCityInChina,
          averageRating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : null,
          reviewCount: typeof nestedData.reviewCount === 'number' ? nestedData.reviewCount : 0,
          totalRatingSum: typeof nestedData.totalRatingSum === 'number' ? nestedData.totalRatingSum : 0,
          description: nestedData.setgegdel || nestedData.description || '',
          itemType: 'translator' as ItemType,
          registeredAt: registeredAtDate,
          isActive: nestedData.isActive,
          isProfileComplete: nestedData.isProfileComplete,
          views: nestedData.views,
          dataAiHint: nestedData.dataAiHint || "translator portrait", // Added dataAiHint
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
