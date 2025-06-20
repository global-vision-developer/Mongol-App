
"use client";

import { EMBASSY_SERVICE_CATEGORIES } from '@/lib/constants';
import { EmbassyCategoryCard } from './EmbassyCategoryCard';

export function EmbassyTopCategoriesGrid() {
  const filteredCategories = EMBASSY_SERVICE_CATEGORIES.filter(category => category.id !== 'mfa');

  if (!filteredCategories || filteredCategories.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {filteredCategories.map((category) => (
          <EmbassyCategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}

