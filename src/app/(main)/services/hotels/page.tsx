
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { CitySelector } from "@/components/CitySelector";
import { SearchBar } from "@/components/SearchBar";
import { ServiceCard } from "@/components/ServiceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCity } from "@/contexts/CityContext";

import { collection, getDocs, query, where, type Query as FirestoreQueryType, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";

import type { RecommendedItem, ItemType } from "@/types";

// Helper function to map Firestore categoryName to singular ItemType for ServiceCard
const mapCategoryToSingularItemType = (categoryName: string): ItemType => {
  const lowerCategoryName = categoryName?.toLowerCase();
  switch (lowerCategoryName) {
    case 'hotels': return 'hotel';
    // Add other mappings if necessary
    default: return lowerCategoryName as ItemType; // Fallback
  }
};

export default function HotelsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedCity, loadingCities } = useCity(); 

  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
  const [loadingData, setLoadingData] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotelEntries = async () => {
      if (loadingCities || !selectedCity) { 
        setLoadingData(true); 
        if(!loadingCities && !selectedCity) { 
            setRecommendations([]);
            setLoadingData(false);
        }
        return;
      }
      
      setLoadingData(true);
      setError(null);

      try {
        const entriesRef = collection(db, "entries");
        const queryConstraints = [where("categoryName", "==", "hotels")]; 
        
        // Filter by data.khot (city ID) using selectedCity.value (which is the city ID)
        if (selectedCity.value !== "all") {
          queryConstraints.push(where("data.khot", "==", selectedCity.value));
        }

        const q: FirestoreQueryType = query(entriesRef, ...queryConstraints);
        
        const snapshot = await getDocs(q);
        const items: RecommendedItem[] = snapshot.docs.map(doc => {
          const entryData = doc.data();
          const nestedData = entryData.data || {};
          
          let finalImageUrl: string | undefined = undefined;
          const rawImageUrl = nestedData['nuur-zurag-url'];
          if (rawImageUrl && typeof rawImageUrl === 'string' && rawImageUrl.trim() !== '' && !rawImageUrl.startsWith("data:image/gif;base64") && !rawImageUrl.includes('lh3.googleusercontent.com')) {
            finalImageUrl = rawImageUrl.trim();
          }

          return {
            id: doc.id,
            name: nestedData.name || t('serviceUnnamed'),
            imageUrl: finalImageUrl,
            description: nestedData.setgegdel || '',
            location: nestedData.khot || undefined, // This is the city ID from entries.data.khot
            averageRating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : null,
            reviewCount: typeof nestedData.reviewCount === 'number' ? nestedData.reviewCount : 0,
            totalRatingSum: typeof nestedData.totalRatingSum === 'number' ? nestedData.totalRatingSum : 0,
            price: nestedData.price === undefined ? null : nestedData.price,
            itemType: mapCategoryToSingularItemType(entryData.categoryName),
            dataAiHint: nestedData.dataAiHint || "hotel item",
            rooms: nestedData.uruunuud || [], 
          } as RecommendedItem;
        });

        setRecommendations(items);
      } catch (err: any) {
        console.error("Error fetching hotel entries:", err);
        setError(
          typeof err === "string"
            ? err
            : err?.message || t('fetchHotelsError') || "Өгөгдөл татахад алдаа гарлаа"
        );
      } finally {
        setLoadingData(false);
      }
    };

    fetchHotelEntries();
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
          {t('hotelsPageTitle')}
        </h1>
        <div className="w-10 md:hidden" />
      </div>

      <div className="flex flex-col md:flex-row gap-2 px-1">
        <CitySelector />
        <div className="flex-grow">
          <SearchBar />
        </div>
      </div>

      <div className="px-1">
        <h2 className="text-2xl font-headline font-semibold mb-4">{t('allSectionTitle')}</h2>

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(4)].map((_, idx) => ( 
               <div key={`skeleton-hotel-${idx}`} className="flex flex-col space-y-3">
                <Skeleton className="h-[180px] w-full rounded-xl aspect-[3/4]" />
                <div className="space-y-2 p-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <p className="text-red-600 font-semibold">{error}</p>
        )}

        {!isLoading && !error && recommendations.length === 0 && (
          <p>{t('noHotelsFound') || "Мэдээлэл олдсонгүй"}</p>
        )}

        {!isLoading && !error && recommendations.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recommendations.map((item) => (
              <ServiceCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
