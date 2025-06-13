
"use client";

import { useTranslation } from "@/hooks/useTranslation";
import type React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface RecommendedCarouselSectionProps<T> {
  titleKey: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode; // Removed isCarouselItem
  maxTotalItems?: number;
  carouselItemWidthClass?: string; // e.g., "w-1/2" or "w-[calc(50%-theme(spacing.2))]"
}

export function RecommendedCarouselSection<T>({
  titleKey,
  items,
  renderItem,
  maxTotalItems = 8,
  carouselItemWidthClass = "w-40 sm:w-48 md:w-56", // Default, can be overridden for 2 items
}: RecommendedCarouselSectionProps<T>) {
  const { t } = useTranslation();

  if (!items || items.length === 0) {
    return null;
  }

  const actualMaxTotalItems = Math.min(items.length, maxTotalItems);
  const itemsToDisplay = items.slice(0, actualMaxTotalItems);

  return (
    <section className="space-y-3 mb-6">
      <h2 className="text-xl font-headline font-semibold px-1">{t(titleKey)}</h2>
      
      {itemsToDisplay.length > 0 && (
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex space-x-3 sm:space-x-4 px-1 pb-3"> {/* Ensure space between items */}
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
