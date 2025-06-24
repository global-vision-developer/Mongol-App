
"use client";
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Trash2 } from 'lucide-react'; 
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, DocumentData, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { SavedItemCard } from '@/components/SavedTranslatorListItem'; 
import type { SavedPageItem, ItemType, SavedItemCategoryFilter, ServiceGroupId } from '@/types'; 
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { SERVICE_GROUPS } from '@/lib/constants';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';


// Helper function to map plural service group ID to singular ItemType
const mapServiceGroupIdToItemType = (serviceGroupId: ServiceGroupId): ItemType => {
  switch (serviceGroupId) {
    case 'flights': return 'flight'; // Though flights might not be typically saved items
    case 'hotels': return 'hotel';
    case 'translators': return 'translator';
    case 'wechat': return 'wechat';
    case 'markets': return 'market';
    case 'factories': return 'factory';
    case 'hospitals': return 'hospital';
    case 'embassies': return 'embassy';
    default: 
      // This case should ideally not be reached if ServiceGroupId is exhaustive
      // and all cases are handled. We'll assert ItemType for safety.
      return serviceGroupId as ItemType; 
  }
};

export default function SavedPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [savedItems, setSavedItems] = useState<SavedPageItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [activeFilter, setActiveFilter] = useState<SavedItemCategoryFilter>('all');
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedItemIdForDeletion, setSelectedItemIdForDeletion] = useState<string | null>(null);


  const filterCategories = useMemo(() => {
    return SERVICE_GROUPS
      .filter(sg => sg.id !== 'flights') // Exclude flights from saved item categories if not applicable
      .map(sg => ({
        id: mapServiceGroupIdToItemType(sg.id), 
        titleKey: sg.titleKey,
      }));
  }, []); // Removed t from dependencies as titleKey is used later for translation

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
            'wechatQrImageUrl', 'rooms', 'showcaseItems', 'isMainSection', 'taniltsuulga', 'savedAt', 'subcategory', 'link'
          ];
          
          recommendedItemKeys.forEach(key => {
            if (key === 'gender') {
              (cleanedData as any)[key] = gender;
            } else {
              (cleanedData as any)[key] = data[key] === undefined ? null : data[key];
            }
          });

          return {
            id: data.originalItemId || doc.id, 
            ...cleanedData,
            name: data.name || t('serviceUnnamed'),
            itemType: itemType, // This itemType is crucial for filtering
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

  const handleUnsaveRequest = (itemId: string) => {
    setSelectedItemIdForDeletion(itemId);
    setIsAlertOpen(true);
  };

  const handleUnsaveConfirm = async () => {
    if (!user || !selectedItemIdForDeletion) {
      toast({
        title: t('error'),
        description: t('unsaveErrorGeneric'),
        variant: "destructive",
      });
      return;
    }

    try {
      const itemDocRef = doc(db, "users", user.uid, "savedItems", selectedItemIdForDeletion);
      await deleteDoc(itemDocRef);
      toast({
        title: t('unsaveSuccessTitle'),
        description: t('unsaveSuccessDesc'),
      });
    } catch (error) {
      console.error("Error unsaving item: ", error);
      toast({
        title: t('error'),
        description: t('unsaveErrorGeneric'),
        variant: "destructive",
      });
    } finally {
      setSelectedItemIdForDeletion(null);
      setIsAlertOpen(false);
    }
  };


  if (authLoading || (!user && !authLoading) || (user && loadingItems && filteredSavedItems.length === 0)) {
     return (
        <div className="space-y-6">
            <h1 className="text-2xl font-headline font-semibold text-center">{t('saved')}</h1>
            <Skeleton className="h-10 w-full rounded-md my-4 px-1" /> {/* Filter buttons skeleton */}
            <div className="space-y-1 px-1"> {/* space-y-1 for tighter list items */}
                {[...Array(3)].map((_, i) => ( 
                   <div key={`skeleton-saved-item-${i}`} className="p-3 flex items-center gap-4 border-b last:border-b-0"> {/* List item skeleton */}
                      <Skeleton className="h-16 w-16 rounded-md shrink-0" />
                      <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
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
            <p className="text-muted-foreground">{activeFilter === 'all' ? t('noSavedItemsPlaceholder') : t('noSavedItemsPlaceholder') + " " + t(filterCategories.find(fc => fc.id === activeFilter)?.titleKey || '').toLowerCase()}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-0 px-1 md:px-0"> 
          {/* {activeFilter !== 'all' && ( // This title might be redundant if filter buttons are clear
             <h2 className="text-lg font-semibold mt-4 mb-2 px-3">{t(filterCategories.find(fc => fc.id === activeFilter)?.titleKey || '')}</h2>
          )} */}
          {filteredSavedItems.map(item => (
            <SavedItemCard key={item.id + (item.itemType || '')} item={item} onUnsaveRequest={handleUnsaveRequest}/>
          ))}
        </div>
      )}

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('unsaveItemTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('unsaveItemConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnsaveConfirm}>
              {t('unsaveButtonLabel')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
