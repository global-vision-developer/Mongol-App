
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CarouselBanner } from "@/components/CarouselBanner";
import { ServiceGroupGrid } from "@/components/ServiceGroupGrid";
import { RecommendedCarouselSection } from "@/components/RecommendedCarouselSection";
import { ServiceCard } from "@/components/ServiceCard";
import { useTranslation } from "@/hooks/useTranslation";
import type { RecommendedItem } from "@/types";
import { useCity } from "@/contexts/CityContext";
import { useSearch } from "@/contexts/SearchContext"; 
import { Skeleton } from "@/components/ui/skeleton";

interface ServicesPageClientProps {
  initialData: {
    allTranslators: RecommendedItem[];
    allHotels: RecommendedItem[];
    allWeChatItems: RecommendedItem[];
    allMarkets: RecommendedItem[];
    allFactories: RecommendedItem[];
    allHospitals: RecommendedItem[];
    allEmbassies: RecommendedItem[];
  }
}

export function ServicesPageClient({ initialData }: ServicesPageClientProps) {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const { selectedCity, loadingCities } = useCity(); 
  const { searchTerm } = useSearch(); 

  const filterItems = (items: RecommendedItem[]): RecommendedItem[] => {
    let cityFiltered = items;
    if (selectedCity && selectedCity.value !== 'all') {
        cityFiltered = items.filter(item => item.location === selectedCity.value);
    }
    
    if (!searchTerm.trim()) {
      return cityFiltered.slice(0, 8); 
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return cityFiltered.filter(item => {
      const nameMatch = item.name?.toLowerCase().includes(lowerSearchTerm);
      const descriptionMatch = item.description?.toLowerCase().includes(lowerSearchTerm);
      return nameMatch || descriptionMatch;
    }).slice(0, 8); 
  };

  const filteredTranslators = useMemo(() => filterItems(initialData.allTranslators), [initialData.allTranslators, searchTerm, selectedCity]);
  const filteredHotels = useMemo(() => filterItems(initialData.allHotels), [initialData.allHotels, searchTerm, selectedCity]);
  const filteredWeChatItems = useMemo(() => filterItems(initialData.allWeChatItems), [initialData.allWeChatItems, searchTerm, selectedCity]);
  const filteredMarkets = useMemo(() => filterItems(initialData.allMarkets), [initialData.allMarkets, searchTerm, selectedCity]);
  const filteredFactories = useMemo(() => filterItems(initialData.allFactories), [initialData.allFactories, searchTerm, selectedCity]);
  const filteredHospitals = useMemo(() => filterItems(initialData.allHospitals), [initialData.allHospitals, searchTerm, selectedCity]);
  const filteredEmbassies = useMemo(() => filterItems(initialData.allEmbassies), [initialData.allEmbassies, searchTerm, selectedCity]);

  const renderServiceItem = (item: RecommendedItem) => <ServiceCard item={item} />;

  const isLoading = authLoading || loadingCities;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-48 md:h-64 lg:h-80 w-full" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3 mb-6">
            <Skeleton className="h-6 w-1/2 px-1" />
            <div className="flex space-x-3 sm:space-x-4 px-1 pb-3">
              {[...Array(2)].map((_, j) => (
                <div key={j} className="w-40 sm:w-48 md:w-56 flex-shrink-0"> 
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
        isLoading={false} 
      />
      <RecommendedCarouselSection
        titleKey="recommended_hotels"
        items={filteredHotels}
        renderItem={renderServiceItem}
        maxTotalItems={8} 
        isLoading={false}
      />
      <RecommendedCarouselSection
        titleKey="recommendedWeChatServices"
        items={filteredWeChatItems}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        isLoading={false}
      />
      <RecommendedCarouselSection
        titleKey="recommended_markets"
        items={filteredMarkets}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        isLoading={false}
      />
      <RecommendedCarouselSection
        titleKey="recommended_factories"
        items={filteredFactories}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        isLoading={false}
      />
      <RecommendedCarouselSection
        titleKey="recommended_hospitals"
        items={filteredHospitals}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        isLoading={false}
      />
      <RecommendedCarouselSection
        titleKey="recommended_embassies"
        items={filteredEmbassies}
        renderItem={renderServiceItem}
        maxTotalItems={8}
        isLoading={false}
      />
    </div>
  );
}
