
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CarouselBanner } from "@/components/CarouselBanner";
import { ServiceGroupGrid } from "@/components/ServiceGroupGrid";
import { RecommendedCarouselSection } from "@/components/RecommendedCarouselSection";
import { ServiceCard } from "@/components/ServiceCard";
import { useTranslation } from "@/hooks/useTranslation";
import { collection, getDocs, limit, query, where, type Query, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { RecommendedItem, ItemType } from "@/types";
import { useCity } from "@/contexts/CityContext";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

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

  useEffect(() => {
    const fetchCollection = async (collectionName: string, itemType: ItemType, count: number, cityValue?: string): Promise<RecommendedItem[]> => {
      const collectionRef = collection(db, collectionName);
      let firestoreQuery: Query<DocumentData>;

      if (cityValue && cityValue !== "all") {
        firestoreQuery = query(collectionRef, where("city", "==", cityValue), limit(count));
      } else {
        firestoreQuery = query(collectionRef, limit(count));
      }
      const snapshot = await getDocs(firestoreQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), itemType } as RecommendedItem));
    };

    const fetchData = async () => {
      if (!selectedCity) {
        setDataLoading(false);
        // Clear data if no city is selected (or handle as per your app's logic)
        setTranslators([]);
        setHotels([]);
        setMarkets([]);
        setFactories([]);
        setHospitals([]);
        setEmbassies([]);
        setWeChatItems([]);
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
          fetchCollection("translators", 'translator', 8, selectedCity?.value),
          fetchCollection("hotels", 'hotel', 8, selectedCity?.value),
          fetchCollection("markets", 'market', 8, selectedCity?.value),
          fetchCollection("factories", 'factory', 8, selectedCity?.value),
          fetchCollection("hospitals", 'hospital', 8, selectedCity?.value),
          fetchCollection("embassies", 'embassy', 8, selectedCity?.value),
          fetchCollection("wechatItems", 'wechat', 8, selectedCity?.value),
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
      } finally {
        setDataLoading(false);
      }
    };

    if (user) { // Only fetch if user is logged in
      fetchData();
    } else if (!authLoading && !user) { // If not loading and no user, stop data loading
      setDataLoading(false);
      setTranslators([]);
      setHotels([]);
      setMarkets([]);
      setFactories([]);
      setHospitals([]);
      setEmbassies([]);
      setWeChatItems([]);
    }
  }, [user, selectedCity, authLoading]); // Added authLoading to dependencies

  const renderServiceItem = (item: RecommendedItem) => <ServiceCard item={item} />;
  const narrowerCarouselItemWidthClass = "w-[calc(46%-0.375rem)] sm:w-[calc(46%-0.5rem)]";

  // Revised loading condition
  const showFullPageLoader = authLoading || 
                             (!user && !authLoading) || 
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
        isLoading={dataLoading && translators.length === 0}
      />

      <RecommendedCarouselSection
        titleKey="recommended_hotels"
        items={hotels}
        renderItem={renderServiceItem}
        maxTotalItems={8} 
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && hotels.length === 0}
      />
      
      <RecommendedCarouselSection
        titleKey="recommendedWeChatServices"
        items={weChatItems}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && weChatItems.length === 0}
      />

      <RecommendedCarouselSection
        titleKey="recommended_markets"
        items={markets}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && markets.length === 0}
      />

      <RecommendedCarouselSection
        titleKey="recommended_factories"
        items={factories}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && factories.length === 0}
      />

      <RecommendedCarouselSection
        titleKey="recommended_hospitals"
        items={hospitals}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && hospitals.length === 0}
      />

      <RecommendedCarouselSection
        titleKey="recommended_embassies"
        items={embassies}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
        isLoading={dataLoading && embassies.length === 0}
      />
    </div>
  );
}
