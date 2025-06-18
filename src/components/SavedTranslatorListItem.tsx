
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Card related imports might not be needed if just a div
import { MapPin } from "lucide-react";
import type { SavedPageItem } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { CITIES } from '@/lib/constants'; // For city label translation

interface SavedTranslatorListItemProps {
  item: SavedPageItem;
}

export const SavedTranslatorListItem: React.FC<SavedTranslatorListItemProps> = ({ item }) => {
  const { t, language } = useTranslation();
  
  const cityValue = item.currentCityInChina || item.city || item.location;
  const cityObject = cityValue ? (CITIES.find(c => c.value === cityValue) || {label: cityValue, label_cn: cityValue}) : null;
  const displayCity = cityObject ? (language === 'cn' && cityObject.label_cn ? cityObject.label_cn : cityObject.label) : null;

  let genderDisplay = '';
  if (item.gender === 'female') {
    genderDisplay = t('genderFemale');
  } else if (item.gender === 'male') {
    genderDisplay = t('genderMale');
  } else if (item.gender === 'other') {
    genderDisplay = t('genderOther');
  }
  
  const imageShouldUnoptimize = item.imageUrl?.startsWith('data:') || item.imageUrl?.includes('lh3.googleusercontent.com');
  const placeholderImage = `https://placehold.co/64x64.png?text=${item.name?.charAt(0) || 'T'}`;


  return (
    <Link href={`/services/translators/${item.id}`} className="block hover:bg-muted/50 transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <div className="p-3 flex items-center gap-4 border-b last:border-b-0">
        <div className="relative h-16 w-16 shrink-0">
           <Image
            src={item.imageUrl || placeholderImage}
            alt={item.name || t('serviceUnnamed')}
            width={64}
            height={64}
            className="rounded-md object-cover"
            data-ai-hint={item.dataAiHint || "translator person"}
            unoptimized={imageShouldUnoptimize}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="text-md font-semibold truncate text-foreground">{item.name || t('serviceUnnamed')}</h3>
            {genderDisplay && (
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">/{genderDisplay}/</span>
            )}
          </div>
          {displayCity && (
            <div className="flex items-center text-xs text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3 mr-1 shrink-0" />
              <span className="truncate">{displayCity}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
