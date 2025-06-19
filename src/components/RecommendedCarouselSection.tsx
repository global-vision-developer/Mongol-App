
"use client";

import { useTranslation } from "@/hooks/useTranslation";
import type React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { cn } from "@/lib/utils"; // Import cn for class utility

interface RecommendedCarouselSectionProps<T> {
  titleKey: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  maxTotalItems?: number;
  carouselItemWidthClass?: string;
  isLoading?: boolean; // Add isLoading prop
}

export function RecommendedCarouselSection<T>({
  titleKey,
  items,
  renderItem,
  maxTotalItems = 8,
  carouselItemWidthClass = "w-40 sm:w-48 md:w-56",
  isLoading = false, // Default to false
}: RecommendedCarouselSectionProps<T>) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <section className="space-y-3 mb-6">
        <h2 className="text-xl font-headline font-semibold px-1">{t(titleKey)}</h2>
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex space-x-3 sm:space-x-4 px-1 pb-3">
            {[...Array(2)].map((_, index) => ( // Show 2 skeletons for loading state
              <div key={`skeleton-carousel-item-${index}`} className={`${carouselItemWidthClass} flex-shrink-0`}>
                <Skeleton className="h-64 w-full rounded-lg" /> {/* Adjust height as needed */}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>
    );
  }

  if (!items || items.length === 0) {
    return null; // Don't render section if no items and not loading
  }

  const actualMaxTotalItems = Math.min(items.length, maxTotalItems);
  const itemsToDisplay = items.slice(0, actualMaxTotalItems);

  return (
    <section className="space-y-3 mb-6">
      <h2 className="text-xl font-headline font-semibold px-1">{t(titleKey)}</h2>
      
      {itemsToDisplay.length > 0 && (
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          {/* Ensure this flex container takes full width to stabilize percentage-based children widths */}
          <div className={cn("flex space-x-3 sm:space-x-4 px-1 pb-3 w-full")}>
            {itemsToDisplay.map((item, index) => (
              <div key={`carousel-item-${index}`} className={`${carouselItemWidthClass} flex-shrink-0`}>
                {renderItem(item, index)}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </section>
  );
}
