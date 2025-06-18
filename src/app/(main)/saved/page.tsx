
"use client";
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MapPin } from 'lucide-react'; // Added MapPin
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { ServiceCard } from '@/components/ServiceCard';
import type { SavedPageItem, ItemType, SavedItemCategoryFilter } from '@/types'; 
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { SERVICE_GROUPS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { CITIES } from '@/lib/constants';

const VALID_ITEM_TYPES: ItemType[] = ['service', 'translator', 'hotel', 'wechat', 'promo', 'market', 'factory', 'hospital', 'embassy'];

const SavedTranslatorListItem: React.FC<{ item: SavedPageItem }> = ({ item }) => {
  const { t, language } = useTranslation();
  
  const city = item.currentCityInChina || item.city || item.location;
  const cityLabel = city ? (CITIES.find(c => c.value === city) || {label: city, label_cn: city}) : null;
  const displayCity = cityLabel ? (language === 'cn' && cityLabel.label_cn ? cityLabel.label_cn : cityLabel.label) : null;

  const genderDisplay = item.gender ? t(`gender${item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}`) : '';

  const imageShouldUnoptimize = item.imageUrl?.startsWith('data:') || item.imageUrl?.includes('lh3.googleusercontent.com');

  return (
    <Link href={`/services/translators/${item.id}`} className="block hover:bg-muted/50 transition-colors rounded-lg">
      <Card className="shadow-none border-0 rounded-lg p-4 flex items-center gap-4 bg-transparent">
        <div className="relative h-16 w-16 shrink-0">
           <Image
            src={item.imageUrl || `https://placehold.co/100x100.png?text=${item.name?.charAt(0) || 'T'}`}
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
            <h3 className="text-md font-semibold truncate">{item.name}</h3>
            {item.gender && (
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
      </Card>
    </Link>
  );
};


export default function SavedPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedPageItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [activeFilter, setActiveFilter] = useState<SavedItemCategoryFilter>('all');

  const filterCategories = useMemo(() => {
    return SERVICE_GROUPS.filter(sg => sg.id !== 'flights').map(sg => ({
      id: sg.id as ItemType,
      titleKey: sg.titleKey,
    }));
  }, []);

  useEffect(() => {
    if (authLoading) {
      setLoadingItems(true);
      return;
    }
    if (!user) {
      setLoadingItems(false);
      setSavedItems([]); 
      return;
    }

    setLoadingItems(true);
    const savedItemsCol = collection(db, "users", user.uid, "savedItems");
    const q = query(savedItemsCol, orderBy("savedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: SavedPageItem[] = snapshot.docs
        .map(doc => {
          const data = doc.data() as DocumentData;
          const itemType = data.itemType as ItemType;

          if (!itemType || !VALID_ITEM_TYPES.includes(itemType)) {
            console.warn(`Saved item ${doc.id} has missing or invalid itemType: ${itemType}. Skipping.`);
            return null;
          }
          
          // Map Firestore 'sex' to 'gender'
          let gender: 'male' | 'female' | 'other' | null = null;
          if (data.sex === 'Эр' || data.gender === 'male') gender = 'male';
          else if (data.sex === 'Эм' || data.gender === 'female') gender = 'female';
          else if (data.gender === 'other') gender = 'other';

          const cleanedData: Partial<SavedPageItem> = {};
          const recommendedItemKeys: (keyof SavedPageItem)[] = [
            'name', 'imageUrl', 'description', 'gender', 'city', 'testLevel', 
            'speakingLevel', 'writingLevel', 'hasWorkedBefore', 'possibleFields', 
            'availableCities', 'price', 'averageRating', 'reviewCount', 'totalRatingSum', 'location', 'primaryLanguage', 
            'availabilityStatus', 'dataAiHint', 'itemType', 'nationality', 
            'inChinaNow', 'yearsInChina', 'currentCityInChina', 'chineseExamTaken', 
            'translationFields', 'dailyRate', 'chinaPhoneNumber', 'wechatId', 
            'wechatQrImageUrl', 'rooms', 'showcaseItems', 'isMainSection', 'taniltsuulga', 'savedAt', 'subcategory'
          ];
          
          recommendedItemKeys.forEach(key => {
            if (key === 'gender') {
              (cleanedData as any)[key] = gender;
            } else {
              (cleanedData as any)[key] = data[key] === undefined ? null : data[key];
            }
          });

          return {
            id: data.originalItemId || doc.id, // Use originalItemId if present (from old save structure), else doc.id
            ...cleanedData,
            name: data.name || t('serviceUnnamed'),
            itemType: itemType,
          } as SavedPageItem;
        })
        .filter((item): item is SavedPageItem => item !== null); 

      setSavedItems(items);
      setLoadingItems(false);
    }, (error) => {
      console.error("Error fetching saved items:", error);
      setLoadingItems(false);
    });

    return () => unsubscribe(); 

  }, [user, authLoading, t]);

  const filteredSavedItems = useMemo(() => {
    if (activeFilter === 'all') {
      return savedItems;
    }
    return savedItems.filter(item => item.itemType === activeFilter);
  }, [savedItems, activeFilter]);


  if (authLoading || (!user && !authLoading) || (user && loadingItems && filteredSavedItems.length === 0)) {
     return (
        <div className="space-y-6">
            <h1 className="text-2xl font-headline font-semibold text-center">{t('saved')}</h1>
            <Skeleton className="h-10 w-full rounded-md my-4 px-1" /> {/* Filter buttons skeleton */}
            <div className="space-y-4 px-1">
                {[...Array(3)].map((_, i) => ( // Skeletons for list items
                   <Card key={`skeleton-saved-item-${i}`} className="p-4 flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-md" />
                      <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                      </div>
                    </Card>
                ))}
            </div>
        </div>
     );
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-2xl font-headline font-semibold text-center sticky top-0 bg-background py-3 z-10 md:relative md:py-0">
        {t('saved')}
      </h1>

      <ScrollArea className="w-full whitespace-nowrap px-1 md:px-0">
        <div className="flex space-x-2 pb-2">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('all')}
            className="rounded-full h-8 text-sm"
          >
            {t('allCategoriesFilter')}
          </Button>
          {filterCategories.map(category => (
            <Button
              key={category.id}
              variant={activeFilter === category.id ? 'default' : 'outline'}
              onClick={() => setActiveFilter(category.id)}
              className="rounded-full h-8 text-sm"
            >
              {t(category.titleKey)}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      {filteredSavedItems.length === 0 && !loadingItems ? (
         <Card className="shadow-lg mx-1 md:mx-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              {t('saved')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('noSavedItemsPlaceholder')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1 px-1 md:px-0">
          {activeFilter !== 'all' && (
             <h2 className="text-lg font-semibold mb-2 px-3">{t(filterCategories.find(fc => fc.id === activeFilter)?.titleKey || '')}</h2>
          )}
          {filteredSavedItems.map(item => {
            if (item.itemType === 'translator') {
              return <SavedTranslatorListItem key={item.id} item={item} />;
            }
            // For other types, display in a single column using ServiceCard
            return (
              <div key={item.id} className="mb-3"> 
                <ServiceCard item={item} className="w-full" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
