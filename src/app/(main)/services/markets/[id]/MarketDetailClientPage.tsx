
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { doc, getDoc, addDoc, collection as firestoreCollection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import type { RecommendedItem, Order as AppOrder, NotificationItem, ItemType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Star, MapPin, AlertTriangle, Info, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const DetailItem: React.FC<{ labelKey: string; value?: string | string[] | null | number; icon?: React.ElementType; }> = ({ labelKey, value, icon: Icon }) => {
  const { t } = useTranslation();
  const displayValue = value !== undefined && value !== null && value !== '' ? Array.isArray(value) ? value.join(', ') : value.toString() : t('notProvided');
  return (
    <div className="flex items-start text-sm">
      {Icon && <Icon className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 shrink-0" />}
      <div>
        <p className="font-medium text-muted-foreground">{t(labelKey)}</p>
        <p className="text-foreground">{displayValue}</p>
      </div>
    </div>
  );
};

interface MarketDetailClientPageProps {
  params: { id: string };
  itemType: 'market';
}

export default function MarketDetailClientPage({ params, itemType }: MarketDetailClientPageProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, addPointsToUser } = useAuth();
  const { toast } = useToast();

  const [item, setItem] = useState<RecommendedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const itemId = params.id;

  useEffect(() => {
    if (itemId) {
      const fetchItem = async () => {
        setLoading(true);
        try {
          const docRef = doc(db, "entries", itemId); 
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const entryData = docSnap.data();
            if (entryData.categoryName === itemType) {
              const nestedData = entryData.data || {};
              setItem({ 
                id: docSnap.id, 
                name: nestedData.title || t('serviceUnnamed'),
                imageUrl: nestedData['nuur-zurag-url'] || undefined,
                description: nestedData.setgegdel || '',
                location: nestedData.khot || undefined,
                rating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : undefined,
                price: nestedData.price,
                itemType: entryData.categoryName as ItemType,
                dataAiHint: nestedData.dataAiHint || "market item",
              } as RecommendedItem);
            } else {
              setItem(null);
            }
          } else {
            setItem(null);
          }
        } catch (error) {
          console.error("Error fetching market entry:", error);
          setItem(null);
        } finally {
          setLoading(false);
        }
      };
      fetchItem();
    }
  }, [itemId, itemType, t]);

  const handleBookNow = async () => {
    if (!user) {
      toast({ title: t('loginToProceed'), description: t('loginToBookService'), variant: "destructive" });
      router.push('/auth/login');
      return;
    }
    if (!item) return;

    setIsBooking(true);
    try {
      const orderData: Omit<AppOrder, 'id'> = {
        userId: user.uid,
        serviceType: itemType,
        serviceId: item.id,
        serviceName: item.name || t('serviceUnnamed'),
        orderDate: serverTimestamp(),
        status: 'confirmed', 
        imageUrl: item.imageUrl || null,
        dataAiHint: item.dataAiHint || "market stall produce",
        amount: item.price === undefined ? null : item.price,
      };
      const orderRef = await addDoc(firestoreCollection(db, "orders"), orderData);
      
      await addPointsToUser(15);

      const notificationData: Omit<NotificationItem, 'id'> = {
        titleKey: 'orderSuccessNotificationTitle',
        descriptionKey: 'orderSuccessNotificationDescription',
        descriptionPlaceholders: { serviceName: item.name || t('serviceUnnamed') },
        date: serverTimestamp(),
        read: false,
        itemType: itemType,
        link: `/orders`,
        imageUrl: item.imageUrl || null,
        dataAiHint: item.dataAiHint || "market stall produce",
      };
      await addDoc(firestoreCollection(db, "users", user.uid, "notifications"), notificationData);

      toast({ title: t('orderSuccessNotificationTitle'), description: t('orderSuccessNotificationDescription', { serviceName: item.name || t('serviceUnnamed') }) });
    } catch (error) {
      console.error("Error ordering from Market:", error);
      toast({ title: t('orderFailedNotificationTitle'), description: t('orderFailedNotificationDescription', {serviceName: item.name || t('serviceUnnamed') }), variant: "destructive" });
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
     return (
      <div className="space-y-4 p-4">
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-4 px-4">
            <div className="container mx-auto flex items-center justify-between h-16">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-6 w-1/2" />
                <div className="w-10"></div>
            </div>
        </div>
        <Skeleton className="w-full h-64 rounded-lg" />
        <Skeleton className="h-8 w-3/4 mt-4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3 mt-2" />
        <Skeleton className="h-4 w-1/2 mt-2" />
        <Skeleton className="h-12 w-full rounded-lg mt-6" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto py-8 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">{t('itemNotFound')}</h1>
        <Button onClick={() => router.back()}>{t('back')}</Button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between h-16">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold text-primary truncate px-2">
            {item?.name || t('marketDetailTitle')}
          </h1>
          <div className="w-10"> {/* Spacer */}</div>
        </div>
      </div>

      <div className="container mx-auto py-2 md:py-6 px-2">
        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="p-0 relative aspect-[16/10] md:aspect-[16/7]">
            <Image
              src={item.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(item.name || 'Market')}`}
              alt={item.name || t('marketDetailTitle')}
              layout="fill"
              objectFit="cover"
              className="bg-muted"
              data-ai-hint={item.dataAiHint || "market stall produce"}
            />
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-6">
            <CardTitle className="text-2xl md:text-3xl font-headline">{item.name}</CardTitle>

            {item.description && (
              <div className="space-y-2">
                <h3 className="text-md font-semibold text-foreground flex items-center"><Info className="h-5 w-5 mr-2 text-primary"/>{t('descriptionLabel')}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{item.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {item.location && <DetailItem labelKey="locationLabel" value={item.location} icon={MapPin} />}
              {typeof item.rating === 'number' && <DetailItem labelKey="ratingLabel" value={item.rating.toFixed(1)} icon={Star} />}
            </div>
          </CardContent>
           <CardFooter className="p-4 md:p-6 border-t">
            <Button
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 text-base h-12"
              onClick={handleBookNow}
              disabled={isBooking}
            >
              {isBooking ? t('loading') : (
                 <>
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {t('orderNowButton')}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
