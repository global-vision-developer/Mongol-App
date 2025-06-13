
"use client";
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, DocumentData } from 'firebase/firestore';
import { ServiceCard } from '@/components/ServiceCard';
import type { SavedPageItem } from '@/types'; // Using the new SavedPageItem
import { Skeleton } from '@/components/ui/skeleton';

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
      const items: SavedPageItem[] = snapshot.docs.map(doc => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id, // The original item's ID is the document ID here
          name: data.name || t('serviceUnnamed'),
          imageUrl: data.imageUrl,
          description: data.description,
          rating: data.rating,
          location: data.location,
          itemType: data.itemType,
          dataAiHint: data.dataAiHint,
          // Include any other fields from RecommendedItem that ServiceCard might use
          // and ensure 'savedAt' is present for ordering or display if needed
          savedAt: data.savedAt,
        } as SavedPageItem;
      });
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
            <h1 className="text-3xl font-headline font-semibold">{t('mySavedItems')}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={`skeleton-saved-${i}`} className="flex flex-col space-y-3">
                        <Skeleton className="h-[180px] w-full rounded-xl aspect-video" />
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
      <h1 className="text-3xl font-headline font-semibold">{t('mySavedItems')}</h1>
      {savedItems.length === 0 ? (
         <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              {t('mySavedItems')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('noSavedItemsPlaceholder')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {savedItems.map(item => (
            // Ensure the item passed to ServiceCard conforms to RecommendedItem
            // The 'id' of the item for ServiceCard should be the original item's ID
            <ServiceCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
