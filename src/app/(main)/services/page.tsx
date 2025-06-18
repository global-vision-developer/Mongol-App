
"use client";

import { useEffect, useState, useMemo } from "react";
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
import { useSearch } from "@/contexts/SearchContext"; // Import useSearch
import { Skeleton } from "@/components/ui/skeleton";

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
    default: return (lowerCategoryName || 'service') as ItemType;
  }
};

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { selectedCity } = useCity();
  const { searchTerm } = useSearch(); // Get searchTerm from context

  const [allTranslators, setAllTranslators] = useState<RecommendedItem[]>([]);
  const [allHotels, setAllHotels] = useState<RecommendedItem[]>([]);
  const [allWeChatItems, setAllWeChatItems] = useState<RecommendedItem[]>([]);
  const [allMarkets, setAllMarkets] = useState<RecommendedItem[]>([]);
  const [allFactories, setAllFactories] = useState<RecommendedItem[]>([]);
  const [allHospitals, setAllHospitals] = useState<RecommendedItem[]>([]);
  const [allEmbassies, setAllEmbassies] = useState<RecommendedItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

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
          name: nestedData.name || nestedData.title || t('serviceUnnamed'), // Added nestedData.title as fallback
          imageUrl: finalImageUrl,
          description: nestedData.taniltsuulga || nestedData.setgegdel || '',
          location: nestedData.khot || undefined, // Ensure location is present for filtering
          city: nestedData.khot || undefined, // Alias for location if needed
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
      if (!user) { 
        setDataLoading(false);
        setAllTranslators([]); setAllHotels([]); setAllWeChatItems([]); setAllMarkets([]);
        setAllFactories([]); setAllHospitals([]); setAllEmbassies([]);
        return;
      }
      if (!selectedCity) { 
        setDataLoading(false); 
        return;
      }

      setDataLoading(true);
      try {
        const [
          translatorsData, hotelsData, marketsData, factoriesData,
          hospitalsData, embassiesData, wechatData,
        ] = await Promise.all([
          fetchEntriesByCategory("translators", 20, selectedCity.value), // Fetch more for better search results
          fetchEntriesByCategory("hotels", 20, selectedCity.value),
          fetchEntriesByCategory("markets", 20, selectedCity.value),
          fetchEntriesByCategory("factories", 20, selectedCity.value),
          fetchEntriesByCategory("hospitals", 20, selectedCity.value),
          fetchEntriesByCategory("embassies", 20, selectedCity.value),
          fetchEntriesByCategory("wechat", 20, selectedCity.value),
        ]);
        
        setAllTranslators(translatorsData); setAllHotels(hotelsData); setAllMarkets(marketsData);
        setAllFactories(factoriesData); setAllHospitals(hospitalsData); setAllEmbassies(embassiesData);
        setAllWeChatItems(wechatData);

      } catch (error) {
        console.error("Error fetching recommended items:", error);
        setAllTranslators([]); setAllHotels([]); setAllWeChatItems([]); setAllMarkets([]);
        setAllFactories([]); setAllHospitals([]); setAllEmbassies([]);
      } finally {
        setDataLoading(false);
      }
    };

    loadDataForPage();
  }, [user, selectedCity, t]);

  const filterItems = (items: RecommendedItem[], term: string): RecommendedItem[] => {
    if (!term.trim()) {
      return items.slice(0, 8); // Return original first 8 if no search term
    }
    const lowerSearchTerm = term.toLowerCase();
    return items.filter(item => {
      const nameMatch = item.name?.toLowerCase().includes(lowerSearchTerm);
      const locationMatch = item.location?.toLowerCase().includes(lowerSearchTerm);
      const cityMatch = item.city?.toLowerCase().includes(lowerSearchTerm); // Added for flexibility if 'city' field is used
      return nameMatch || locationMatch || cityMatch;
    }).slice(0, 8); // Limit to 8 after filtering for display in carousel
  };

  const filteredTranslators = useMemo(() => filterItems(allTranslators, searchTerm), [allTranslators, searchTerm]);
  const filteredHotels = useMemo(() => filterItems(allHotels, searchTerm), [allHotels, searchTerm]);
  const filteredWeChatItems = useMemo(() => filterItems(allWeChatItems, searchTerm), [allWeChatItems, searchTerm]);
  const filteredMarkets = useMemo(() => filterItems(allMarkets, searchTerm), [allMarkets, searchTerm]);
  const filteredFactories = useMemo(() => filterItems(allFactories, searchTerm), [allFactories, searchTerm]);
  const filteredHospitals = useMemo(() => filterItems(allHospitals, searchTerm), [allHospitals, searchTerm]);
  const filteredEmbassies = useMemo(() => filterItems(allEmbassies, searchTerm), [allEmbassies, searchTerm]);

  const renderServiceItem = (item: RecommendedItem) => <ServiceCard item={item} />;
  const narrowerCarouselItemWidthClass = "w-[calc(46%-0.375rem)] sm:w-[calc(46%-0.5rem)]";

  const showFullPageLoader = authLoading || 
                             (user && dataLoading && 
                               !allTranslators.length && !allHotels.length && !allMarkets.length && 
                               !allFactories.length && !allHospitals.length && !allEmbassies.length && !allWeChatItems.length);

  if (showFullPageLoader) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-48 md:h-64 lg:h-80 w-full" />
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
        items={filteredTranslators}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && filteredTranslators.length === 0 && !!user && !searchTerm} // Only show skeleton if initial load and no search
      />
      <RecommendedCarouselSection
        titleKey="recommended_hotels"
        items={filteredHotels}
        renderItem={renderServiceItem}
        maxTotalItems={8} 
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && filteredHotels.length === 0 && !!user && !searchTerm}
      />
      <RecommendedCarouselSection
        titleKey="recommendedWeChatServices"
        items={filteredWeChatItems}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && filteredWeChatItems.length === 0 && !!user && !searchTerm}
      />
      <RecommendedCarouselSection
        titleKey="recommended_markets"
        items={filteredMarkets}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && filteredMarkets.length === 0 && !!user && !searchTerm}
      />
      <RecommendedCarouselSection
        titleKey="recommended_factories"
        items={filteredFactories}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && filteredFactories.length === 0 && !!user && !searchTerm}
      />
      <RecommendedCarouselSection
        titleKey="recommended_hospitals"
        items={filteredHospitals}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && filteredHospitals.length === 0 && !!user && !searchTerm}
      />
      <RecommendedCarouselSection
        titleKey="recommended_embassies"
        items={filteredEmbassies}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && filteredEmbassies.length === 0 && !!user && !searchTerm}
      />
    </div>
  );
}
