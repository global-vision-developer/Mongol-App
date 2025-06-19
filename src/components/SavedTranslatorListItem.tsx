
"use client";

import Image from 'next/image';
import Link from 'next/link';
// Card, CardContent, CardHeader, CardTitle зэрэг нь одоо ашиглагдахгүй байж магадгүй тул шаардлагагүй бол устгаж болно.
// Гэхдээ дотоод зохион байгуулалтад хэрэглэж болно.
import { MapPin } from "lucide-react";
import type { SavedPageItem } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useCity } from '@/contexts/CityContext'; // Import useCity

// Helper function to get detail page link
const getDetailPageLink = (item: SavedPageItem): string => {
  switch (item.itemType) {
    case 'translator':
      return `/services/translators/${item.id}`;
    case 'hotel':
      return `/services/hotels/${item.id}`;
    case 'market':
      return `/services/markets/${item.id}`;
    case 'factory':
      return `/services/factories/${item.id}`;
    case 'hospital':
      return `/services/hospitals/${item.id}`;
    case 'embassy':
      return `/services/embassies/${item.id}`;
    case 'wechat':
      return `/services/wechat/${item.id}`;
    case 'service': // Generic service
    case 'promo':   // Promo items might have a direct link or no detail page
      return item.link || `/services`; // Fallback to a generic page or item's own link if available
    default:
      // console.warn(`Unknown itemType for detail link: ${item.itemType}`);
      return `/services`; // A generic fallback
  }
};

interface SavedItemCardProps { // Нэрийг SavedItemCardProps болгов
  item: SavedPageItem;
}

// Экспортолж буй компонентын нэрийг SavedItemCard болгов
export const SavedItemCard: React.FC<SavedItemCardProps> = ({ item }) => {
  const { t, language } = useTranslation();
  const { availableCities } = useCity(); // Get available cities from context

  const cityValue = item.currentCityInChina || item.city || item.location;
  const cityObject = cityValue ? (availableCities.find(c => c.value === cityValue) || {label: cityValue, label_cn: cityValue}) : null;
  const displayCity = cityObject ? (language === 'cn' && cityObject.label_cn ? cityObject.label_cn : cityObject.label) : null;

  let genderDisplay = '';
  if (item.itemType === 'translator' && item.gender) {
    if (item.gender === 'female') {
      genderDisplay = t('genderFemale');
    } else if (item.gender === 'male') {
      genderDisplay = t('genderMale');
    } else if (item.gender === 'other') {
      genderDisplay = t('genderOther');
    }
  }

  const imageShouldUnoptimize = item.imageUrl?.startsWith('data:') || item.imageUrl?.includes('lh3.googleusercontent.com');
  const placeholderImageText = item.name ? item.name.charAt(0).toUpperCase() : (item.itemType ? item.itemType.charAt(0).toUpperCase() : 'I');
  const placeholderImage = `https://placehold.co/64x64.png?text=${encodeURIComponent(placeholderImageText)}`;

  const detailPageLink = getDetailPageLink(item);

  return (
    <Link href={detailPageLink} className="block hover:bg-muted/50 transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <div className="p-3 flex items-center gap-4 border-b last:border-b-0">
        <div className="relative h-16 w-16 shrink-0">
           <Image
            src={item.imageUrl || placeholderImage}
            alt={item.name || t('serviceUnnamed')}
            width={64}
            height={64}
            className="rounded-md object-cover bg-muted"
            data-ai-hint={item.dataAiHint || `${item.itemType || 'item'} image`}
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

