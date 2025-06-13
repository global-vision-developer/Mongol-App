
"use client";

import { EMBASSY_SERVICE_CATEGORIES } from '@/lib/constants';
import { EmbassyCategoryCard } from './EmbassyCategoryCard';

export function EmbassyTopCategoriesGrid() {
  if (!EMBASSY_SERVICE_CATEGORIES || EMBASSY_SERVICE_CATEGORIES.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {EMBASSY_SERVICE_CATEGORIES.map((category) => (
          <EmbassyCategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
