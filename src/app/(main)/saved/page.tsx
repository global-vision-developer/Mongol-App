
"use client";
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, DocumentData } from 'firebase/firestore';
import { ServiceCard } from '@/components/ServiceCard';
import type { SavedPageItem, ItemType } from '@/types'; // Using the new SavedPageItem
import { Skeleton } from '@/components/ui/skeleton';

const VALID_ITEM_TYPES: ItemType[] = ['service', 'translator', 'hotel', 'wechat', 'promo', 'market', 'factory', 'hospital', 'embassy'];

export default function SavedPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedPageItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoadingItems(true);
      return;
    }
    if (!user) {
      setLoadingItems(false);
      setSavedItems([]); // Clear items if user logs out
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

          // Ensure all fields expected by RecommendedItem are present, defaulting to null/undefined if not
          const cleanedData: Partial<SavedPageItem> = {};
          const recommendedItemKeys: (keyof SavedPageItem)[] = [
            'name', 'imageUrl', 'description', 'gender', 'city', 'testLevel', 
            'speakingLevel', 'writingLevel', 'hasWorkedBefore', 'possibleFields', 
            'availableCities', 'price', 'rating', 'location', 'primaryLanguage', 
            'availabilityStatus', 'dataAiHint', 'itemType', 'nationality', 
            'inChinaNow', 'yearsInChina', 'currentCityInChina', 'chineseExamTaken', 
            'translationFields', 'dailyRate', 'chinaPhoneNumber', 'wechatId', 
            'wechatQrImageUrl', 'rooms', 'showcaseItems', 'isMainSection', 'taniltsuulga', 'savedAt'
          ];
          
          recommendedItemKeys.forEach(key => {
            (cleanedData as any)[key] = data[key] === undefined ? null : data[key];
          });


          return {
            id: doc.id, // The original item's ID is the document ID here
            ...cleanedData, // Spread the cleaned data
            name: data.name || t('serviceUnnamed'), // Ensure name has a fallback
            itemType: itemType, // Ensure itemType is correctly set
          } as SavedPageItem;
        })
        .filter((item): item is SavedPageItem => item !== null); // Filter out null items

      setSavedItems(items);
      setLoadingItems(false);
    }, (error) => {
      console.error("Error fetching saved items:", error);
      setLoadingItems(false);
      // Optionally show a toast for error fetching saved items
    });

    return () => unsubscribe(); // Cleanup listener on component unmount

  }, [user, authLoading, t]);

  if (authLoading || (!user && !authLoading) || (user && loadingItems)) {
     return (
        <div className="space-y-6">
            <h1 className="text-2xl font-headline font-semibold text-center">{t('saved')}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4"> {/* Updated grid for skeleton */}
                {[...Array(4)].map((_, i) => ( // Show 4 skeletons for 2x2 mobile grid
                    <div key={`skeleton-saved-${i}`} className="flex flex-col space-y-3">
                        <Skeleton className="h-[180px] w-full rounded-xl aspect-[3/4]" /> {/* Use aspect ratio */}
                        <div className="space-y-2 p-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
     );
  }


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-headline font-semibold text-center">{t('saved')}</h1>
      {savedItems.length === 0 ? (
         <Card className="shadow-lg">
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4"> {/* Updated grid for items */}
          {savedItems.map(item => (
            <ServiceCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

