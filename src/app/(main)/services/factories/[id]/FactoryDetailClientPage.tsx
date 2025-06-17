
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { doc, getDoc, addDoc, collection as firestoreCollection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import type { RecommendedItem, Order as AppOrder, NotificationItem, ItemType, ShowcaseItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Star, MapPin, AlertTriangle, Info, ShoppingBag, PackageSearch } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DetailItem: React.FC<{ labelKey: string; value?: string | string[] | null | number; icon?: React.ElementType; }> = ({ labelKey, value, icon: Icon }) => {
  const { t } = useTranslation();
  let displayValue = t('notProvided');
  if (value !== undefined && value !== null && value !== '') {
    if (Array.isArray(value)) {
      displayValue = value.join(', ');
    } else if (labelKey === 'ratingLabel' && typeof value === 'number') {
      displayValue = `${value.toFixed(1)} / 5`; // Assuming 0-5 scale, adjust if 0-10
    } else {
      displayValue = value.toString();
    }
  }
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

interface FactoryDetailClientPageProps {
  params: { id: string };
  itemType: 'factory';
  itemData: RecommendedItem | null;
}

export default function FactoryDetailClientPage({ params, itemType, itemData }: FactoryDetailClientPageProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [item, setItem] = useState<RecommendedItem | null>(itemData);
  const [loadingInitial, setLoadingInitial] = useState(!itemData && !!params.id);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (itemData) {
      setItem(itemData);
      setLoadingInitial(false);
    } else if (params.id && !itemData) {
      const fetchItem = async () => {
        setLoadingInitial(true);
        try {
          const docRef = doc(db, "entries", params.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const entryData = docSnap.data();
            if (entryData.categoryName === "factories") { // Ensure it's a factory
              const nestedData = entryData.data || {};
              const rawImageUrl = nestedData['nuur-zurag-url'];
              let finalImageUrl: string | undefined = undefined;
              if (typeof rawImageUrl === 'string' && rawImageUrl.trim() !== '') {
                finalImageUrl = rawImageUrl.trim();
              }
              const showcaseItems: ShowcaseItem[] = (nestedData.delgerengui || []).map((detail: any) => ({
                description: detail.description || '',
                imageUrl: detail.imageUrl || '',
                name: detail.name || undefined,
              }));

              setItem({
                id: docSnap.id,
                name: nestedData.name || nestedData.title || t('serviceUnnamed'),
                imageUrl: finalImageUrl,
                description: nestedData.taniltsuulga || nestedData.setgegdel || '',
                location: nestedData.khot || undefined,
                rating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : null,
                price: nestedData.price === undefined ? null : nestedData.price,
                itemType: 'factory',
                dataAiHint: nestedData.dataAiHint || "factory item",
                showcaseItems: showcaseItems,
                isMainSection: typeof nestedData.golheseg === 'boolean' ? nestedData.golheseg : undefined,
                taniltsuulga: nestedData.taniltsuulga || undefined,
              } as RecommendedItem);
            } else {
              setItem(null);
            }
          } else {
            setItem(null);
          }
        } catch (error) {
          console.error("Error fetching factory entry client-side:", error);
          setItem(null);
        } finally {
          setLoadingInitial(false);
        }
      };
      fetchItem();
    }
  }, [itemData, params.id, t]);

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
        status: 'pending_confirmation', // Or 'confirmed' depending on flow
        imageUrl: item.imageUrl || null,
        dataAiHint: item.dataAiHint || "factory exterior machinery",
        amount: item.price === undefined ? null : item.price,
      };
      await addDoc(firestoreCollection(db, "orders"), orderData);

      const notificationData: Omit<NotificationItem, 'id'> = {
        titleKey: 'orderSuccessNotificationTitle',
        descriptionKey: 'orderSuccessNotificationDescription',
        descriptionPlaceholders: { serviceName: item.name || t('serviceUnnamed') },
        date: serverTimestamp(),
        read: false,
        itemType: itemType,
        link: `/orders`,
        imageUrl: item.imageUrl || null,
        dataAiHint: item.dataAiHint || "factory exterior machinery",
      };
      if (user?.uid) {
        await addDoc(firestoreCollection(db, "users", user.uid, "notifications"), notificationData);
      }

      toast({ title: t('orderSuccessNotificationTitle'), description: t('orderSuccessNotificationDescription', { serviceName: item.name || t('serviceUnnamed') }) });
    } catch (error) {
      console.error("Error ordering from Factory:", error);
      toast({ title: t('orderFailedNotificationTitle'), description: t('orderFailedNotificationDescription', { serviceName: item.name || t('serviceUnnamed') }), variant: "destructive" });
    } finally {
      setIsBooking(false);
    }
  };

  const mainImageShouldUnoptimize = item?.imageUrl?.startsWith('data:') || item?.imageUrl?.includes('lh3.googleusercontent.com');

  if (loadingInitial) {
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
            {item?.name || t('factoryDetailTitle')}
          </h1>
          <div className="w-10"> {/* Spacer */}</div>
        </div>
      </div>

      <div className="container mx-auto py-2 md:py-6 px-2">
        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="p-0 relative aspect-[16/10] md:aspect-[16/7]">
            <Image
              src={item.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(item.name || 'Factory')}`}
              alt={item.name || t('factoryDetailTitle')}
              layout="fill"
              objectFit="cover"
              className="bg-muted"
              data-ai-hint={item.dataAiHint || "factory exterior machinery"}
              unoptimized={mainImageShouldUnoptimize}
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
              <DetailItem labelKey="ratingLabel" value={item.rating} icon={Star} />
            </div>

            {item.showcaseItems && item.showcaseItems.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-xl font-semibold text-foreground flex items-center">
                  <PackageSearch className="h-6 w-6 mr-2 text-primary"/> {/* Using PackageSearch as a generic icon */}
                  {t('productShowcaseTitle') || "Бүтээгдэхүүний танилцуулга"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {item.showcaseItems.map((showcaseItem, index) => (
                    <Card key={index} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      <div className="relative aspect-video">
                        <Image
                          src={showcaseItem.imageUrl || `https://placehold.co/400x300.png?text=${encodeURIComponent(showcaseItem.description || 'Product')}`}
                          alt={showcaseItem.description || t('productImageAlt') || 'Product image'}
                          layout="fill"
                          objectFit="cover"
                          className="bg-muted"
                          data-ai-hint={showcaseItem.description ? showcaseItem.description.substring(0,20) : "product item"}
                          unoptimized={showcaseItem.imageUrl?.startsWith('data:') || showcaseItem.imageUrl?.includes('lh3.googleusercontent.com')}
                        />
                      </div>
                      <CardContent className="p-3">
                        {showcaseItem.name && <CardTitle className="text-sm font-semibold mb-1 line-clamp-1">{showcaseItem.name}</CardTitle>}
                        <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                          {showcaseItem.description || t('noProductDescription') || 'No description available.'}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

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
