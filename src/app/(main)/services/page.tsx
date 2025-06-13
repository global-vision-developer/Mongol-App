
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
import type { RecommendedItem } from "@/types";
import { useCity } from "@/contexts/CityContext";

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
    const fetchCollection = async (collectionName: string, count: number, cityValue?: string): Promise<RecommendedItem[]> => {
      const collectionRef = collection(db, collectionName);
      let firestoreQuery: Query<DocumentData>;

      if (cityValue && cityValue !== "all") {
        firestoreQuery = query(collectionRef, where("city", "==", cityValue), limit(count));
      } else {
        firestoreQuery = query(collectionRef, limit(count));
      }
      const snapshot = await getDocs(firestoreQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecommendedItem));
    };

    const fetchData = async () => {
      if (!selectedCity) {
        setDataLoading(false);
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
          fetchCollection("translators", 8, selectedCity?.value),
          fetchCollection("hotels", 8, selectedCity?.value),
          fetchCollection("markets", 8, selectedCity?.value),
          fetchCollection("factories", 8, selectedCity?.value),
          fetchCollection("hospitals", 8, selectedCity?.value),
          fetchCollection("embassies", 8, selectedCity?.value),
          fetchCollection("wechatItems", 8, selectedCity?.value),
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

    if (user) {
      fetchData();
    } else {
      setDataLoading(false);
      setTranslators([]);
      setHotels([]);
      setMarkets([]);
      setFactories([]);
      setHospitals([]);
      setEmbassies([]);
      setWeChatItems([]);
    }
  }, [user, selectedCity]);

  const renderServiceItem = (item: RecommendedItem) => <ServiceCard item={item} />;
  const narrowerCarouselItemWidthClass = "w-[calc(46%-0.375rem)] sm:w-[calc(46%-0.5rem)]";


  if (authLoading || (!user && !authLoading) || (user && dataLoading) ) {
    return <p className="text-center py-10">{t('loading')}...</p>; 
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
      />

      <RecommendedCarouselSection
        titleKey="recommended_hotels"
        items={hotels}
        renderItem={renderServiceItem}
        maxTotalItems={8} 
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
      />
      
      <RecommendedCarouselSection
        titleKey="recommendedWeChatServices"
        items={weChatItems}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
      />

      <RecommendedCarouselSection
        titleKey="recommended_markets"
        items={markets}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
      />

      <RecommendedCarouselSection
        titleKey="recommended_factories"
        items={factories}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
      />

      <RecommendedCarouselSection
        titleKey="recommended_hospitals"
        items={hospitals}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
      />

      <RecommendedCarouselSection
        titleKey="recommended_embassies"
        items={embassies}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        carouselItemWidthClass={narrowerCarouselItemWidthClass}
      />
    </div>
  );
}
