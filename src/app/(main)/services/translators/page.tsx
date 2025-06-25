
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { CitySelector } from "@/components/CitySelector";
import { SearchBar } from "@/components/SearchBar";
import { TranslatorCard } from "@/components/services/TranslatorCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCity } from "@/contexts/CityContext";
import { collection, getDocs, query, where, type Query as FirestoreQueryType, type DocumentData } from "firebase/firestore"; 
import { db } from "@/lib/firebase";
import type { Translator, ItemType, LanguageLevel, DailyRateRange, TranslationField, Nationality } from "@/types"; 

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


export default function TranslatorsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedCity, loadingCities } = useCity(); 

  const [translators, setTranslators] = useState<Translator[]>([]); 
  const [loadingData, setLoadingData] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranslatorEntries = async () => {
      if (loadingCities || !selectedCity) {
        setLoadingData(true);
         if(!loadingCities && !selectedCity) {
            setTranslators([]);
            setLoadingData(false);
        }
        return;
      }

      setLoadingData(true);
      setError(null);
      try {
        const entriesRef = collection(db, "entries");
        const queryConstraints = [
          where("categoryName", "==", "translators"),
        ];
        
        if (selectedCity.value !== "all") {
          queryConstraints.push(where("data.city", "==", selectedCity.value)); 
        }
        
        const q: FirestoreQueryType = query(entriesRef, ...queryConstraints);
        const snapshot = await getDocs(q);
        
        const translatorsData: Translator[] = snapshot.docs
          .map((doc) => {
            const entryData = doc.data();
            const nestedData = entryData.data || {};
            // Assuming 'isActive' might not exist or is true by default for listing
            if (nestedData.isActive === false) { 
                return null;
            }

            const rawImageUrl = nestedData['cover-image']; 
            let finalImageUrl: string | undefined = undefined;
             if (rawImageUrl && typeof rawImageUrl === 'string' && rawImageUrl.trim() !== '' && !rawImageUrl.startsWith("data:image/gif;base64") && !rawImageUrl.includes('lh3.googleusercontent.com')) {
                finalImageUrl = rawImageUrl.trim();
            }


            return {
              id: doc.id,
              uid: nestedData.uid || doc.id, 
              name: nestedData.name || t('serviceUnnamed'),
              photoUrl: finalImageUrl,
              nationality: nestedData.irgenshil as Nationality || null,
              inChinaNow: typeof nestedData.inChinaNow === 'boolean' ? nestedData.inChinaNow : null,
              yearsInChina: typeof nestedData.yearsInChina === 'number' ? nestedData.yearsInChina : null,
              currentCityInChina: nestedData.city || null,
              chineseExamTaken: !!nestedData.exam,
              chineseExamDetails: nestedData.exam || null,
              speakingLevel: mapLanguageLevel(nestedData.speak),
              writingLevel: mapLanguageLevel(nestedData.write),
              workedAsTranslator: typeof nestedData.experience === 'boolean' ? nestedData.experience : null,
              translationFields: nestedData.sector || null, 
              canWorkInOtherCities: nestedData.wcities || null, 
              dailyRate: mapPriceToDailyRate(nestedData.price),
              chinaPhoneNumber: nestedData['china-number'] ? String(nestedData['china-number']) : null,
              wechatId: nestedData['we-chat-id'] ? String(nestedData['we-chat-id']) : null,
              city: nestedData.city || null, 
              averageRating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : null,
              reviewCount: typeof nestedData.reviewCount === 'number' ? nestedData.reviewCount : 0,
              totalRatingSum: typeof nestedData.totalRatingSum === 'number' ? nestedData.totalRatingSum : 0,
              description: nestedData.description || '',
              gender: mapHuisToGender(nestedData.huis),
              itemType: 'translator' as ItemType, 
              isActive: typeof nestedData.isActive === 'boolean' ? nestedData.isActive : true,
              dataAiHint: nestedData.dataAiHint || "translator person"
            } as Translator;
          })
          .filter((translator): translator is Translator => translator !== null); 
        
        setTranslators(translatorsData);
      } catch (err) {
        console.error("Error fetching translator entries:", err);
        setError(t('fetchErrorGeneric') || "Алдаа гарлаа. Түр хүлээнэ үү.");
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchTranslatorEntries();
  }, [selectedCity, loadingCities, t]);

  const isLoading = loadingCities || loadingData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background py-3 md:relative md:py-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="md:hidden">
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">{t('back')}</span>
        </Button>
        <h1 className="text-xl font-headline font-semibold text-center flex-grow text-primary md:text-3xl">
          {t('translatorsPageTitle')}
        </h1>
        <Button variant="ghost" size="icon" asChild className="text-primary">
          <Link href="/profile/register-translator" aria-label={t('addTranslator')}>
            <UserPlus className="h-6 w-6" />
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-2 px-1">
        <CitySelector />
        <div className="flex-grow">
          <SearchBar />
        </div>
      </div>

      <div className="px-1">
        <h2 className="text-2xl font-headline font-semibold mb-4">{t('translatorsSectionTitle')}</h2>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={`skeleton-${i}`} className="flex flex-col space-y-2">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" aria-hidden />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-destructive text-center py-10">{error}</p>
        ) : translators.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">{t('noRecommendations')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-3 gap-y-4">
            {translators.map((item) => (
              <TranslatorCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
