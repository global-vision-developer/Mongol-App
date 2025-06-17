
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CarouselBanner } from "@/components/CarouselBanner";
import { ServiceGroupGrid } from "@/components/ServiceGroupGrid";
import { RecommendedCarouselSection } from "@/components/RecommendedCarouselSection";
import { ServiceCard } from "@/components/ServiceCard";
import { useTranslation } from "@/hooks/useTranslation";
import { collection, getDocs, limit, query, where, type Query as FirestoreQueryType, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { RecommendedItem, ItemType } from "@/types";
import { useCity } from "@/contexts/CityContext";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to map Firestore categoryName to singular ItemType for ServiceCard
// Made robust for potentially undefined categoryName
const mapCategoryToSingularItemType = (categoryName?: string): ItemType => {
  const lowerCategoryName = categoryName?.toLowerCase();
  switch (lowerCategoryName) {
    case 'hotels': return 'hotel';
    case 'translators': return 'translator';
    case 'markets': return 'market';
    case 'factories': return 'factory';
    case 'hospitals': return 'hospital';
    case 'embassies': return 'embassy';
    case 'wechat': return 'wechat';
    default: return (lowerCategoryName || 'service') as ItemType; // Fallback to 'service'
  }
};

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { selectedCity } = useCity();

  const [translators, setTranslators] = useState<RecommendedItem[]>([]);
  const [hotels, setHotels] = useState<RecommendedItem[]>([]);
  const [weChatItems, setWeChatItems] = useState<RecommendedItem[]>([]);
  const [markets, setMarkets] = useState<RecommendedItem[]>([]);
  const [factories, setFactories] = useState<RecommendedItem[]>([]);
  const [hospitals, setHospitals] = useState<RecommendedItem[]>([]);
  const [embassies, setEmbassies] = useState<RecommendedItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  // Data fetching useEffect
  useEffect(() => {
    const fetchEntriesByCategory = async (
      categoryNameFilter: string,
      count: number,
      cityValue?: string
    ): Promise<RecommendedItem[]> => {
      const entriesRef = collection(db, "entries");
      const queryConstraints = [where("categoryName", "==", categoryNameFilter)];
      if (cityValue && cityValue !== "all") {
        queryConstraints.push(where("data.khot", "==", cityValue));
      }
      queryConstraints.push(limit(count));

      const firestoreQuery: FirestoreQueryType<DocumentData> = query(entriesRef, ...queryConstraints);
      
      const snapshot = await getDocs(firestoreQuery);
      return snapshot.docs.map(doc => {
        const entryData = doc.data();
        const nestedData = entryData.data || {};
        const categoryNameFromDoc = entryData.categoryName;
        
        let finalImageUrl: string | undefined = undefined;
        const rawImageUrl = nestedData['nuur-zurag-url'];
        if (rawImageUrl && typeof rawImageUrl === 'string' && rawImageUrl.trim() !== '' && !rawImageUrl.startsWith("data:image/gif;base64") && !rawImageUrl.includes('lh3.googleusercontent.com')) {
          finalImageUrl = rawImageUrl.trim();
        }

        return { 
          id: doc.id, 
          name: nestedData.name || t('serviceUnnamed'),
          imageUrl: finalImageUrl,
          description: nestedData.taniltsuulga || nestedData.setgegdel || '',
          location: nestedData.khot || undefined,
          rating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : (nestedData.unelgee === null ? undefined : nestedData.unelgee),
          price: nestedData.price === undefined ? null : nestedData.price, 
          itemType: mapCategoryToSingularItemType(categoryNameFromDoc),
          dataAiHint: nestedData.dataAiHint || `${categoryNameFromDoc || 'item'} item`,
          ...(categoryNameFromDoc === 'translators' && {
            nationality: nestedData.nationality,
            speakingLevel: nestedData.speakingLevel,
            writingLevel: nestedData.writingLevel,
            dailyRate: nestedData.dailyRate,
          }),
          rooms: nestedData.uruunuud || [],
          showcaseItems: nestedData.delgerengui || [],
          isMainSection: typeof nestedData.golheseg === 'boolean' ? nestedData.golheseg : undefined,
        } as RecommendedItem;
      });
    };

    const loadDataForPage = async () => {
      if (!user) { // If no user, ensure loading is false and clear data
        setDataLoading(false);
        setTranslators([]);
        setHotels([]);
        setWeChatItems([]);
        setMarkets([]);
        setFactories([]);
        setHospitals([]);
        setEmbassies([]);
        return;
      }

      if (!selectedCity) { // If no city selected (should be initialized by context)
        setDataLoading(false); // Still set loading to false
        return;
      }

      setDataLoading(true);
      try {
        const [
          translatorsData,
          hotelsData,
          marketsData,
          factoriesData,
          hospitalsData,
          embassiesData,
          wechatData,
        ] = await Promise.all([
          fetchEntriesByCategory("translators", 8, selectedCity.value),
          fetchEntriesByCategory("hotels", 8, selectedCity.value),
          fetchEntriesByCategory("markets", 8, selectedCity.value),
          fetchEntriesByCategory("factories", 8, selectedCity.value),
          fetchEntriesByCategory("hospitals", 8, selectedCity.value),
          fetchEntriesByCategory("embassies", 8, selectedCity.value),
          fetchEntriesByCategory("wechat", 8, selectedCity.value),
        ]);
        
        setTranslators(translatorsData);
        setHotels(hotelsData);
        setMarkets(marketsData);
        setFactories(factoriesData);
        setHospitals(hospitalsData);
        setEmbassies(embassiesData);
        setWeChatItems(wechatData);

      } catch (error) {
        console.error("Error fetching recommended items:", error);
        // Clear arrays on error to avoid showing stale data
        setTranslators([]);
        setHotels([]);
        setWeChatItems([]);
        setMarkets([]);
        setFactories([]);
        setHospitals([]);
        setEmbassies([]);
      } finally {
        setDataLoading(false);
      }
    };

    loadDataForPage();

  }, [user, selectedCity, t]); // `t` is kept as translation keys are used in data mapping

  const renderServiceItem = (item: RecommendedItem) => <ServiceCard item={item} />;
  const narrowerCarouselItemWidthClass = "w-[calc(46%-0.375rem)] sm:w-[calc(46%-0.5rem)]";

  const showFullPageLoader = authLoading || 
                             (user && dataLoading && 
                               !translators.length && 
                               !hotels.length && 
                               !markets.length && 
                               !factories.length && 
                               !hospitals.length && 
                               !embassies.length && 
                               !weChatItems.length);

  if (showFullPageLoader) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" /> {/* Placeholder for ServiceGroupGrid */}
        <Skeleton className="h-48 md:h-64 lg:h-80 w-full" /> {/* Placeholder for CarouselBanner */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3 mb-6">
            <Skeleton className="h-6 w-1/2 px-1" />
            <div className="flex space-x-3 sm:space-x-4 px-1 pb-3">
              {[...Array(2)].map((_, j) => (
                <div key={j} className={`${narrowerCarouselItemWidthClass} flex-shrink-0`}>
                  <Skeleton className="h-64 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <ServiceGroupGrid />
      <CarouselBanner />

      <RecommendedCarouselSection
        titleKey="recommended_translators"
        items={translators}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && translators.length === 0 && !!user}
      />

      <RecommendedCarouselSection
        titleKey="recommended_hotels"
        items={hotels}
        renderItem={renderServiceItem}
        maxTotalItems={8} 
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && hotels.length === 0 && !!user}
      />
      
      <RecommendedCarouselSection
        titleKey="recommendedWeChatServices"
        items={weChatItems}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && weChatItems.length === 0 && !!user}
      />

      <RecommendedCarouselSection
        titleKey="recommended_markets"
        items={markets}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && markets.length === 0 && !!user}
      />

      <RecommendedCarouselSection
        titleKey="recommended_factories"
        items={factories}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && factories.length === 0 && !!user}
      />

      <RecommendedCarouselSection
        titleKey="recommended_hospitals"
        items={hospitals}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && hospitals.length === 0 && !!user}
      />

      <RecommendedCarouselSection
        titleKey="recommended_embassies"
        items={embassies}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && embassies.length === 0 && !!user}
      />
    </div>
  );
}

