
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Star, MapPin, AlertTriangle, Info, ShoppingBag, BedDouble } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ServiceReviewForm } from "@/components/ServiceReviewForm"; // Import the new review form

const DetailItem: React.FC<{ labelKey: string; value?: string | string[] | null | number; icon?: React.ElementType; }> = ({ labelKey, value, icon: Icon }) => {
  const { t } = useTranslation();
  let displayValue = t('notProvided');
  if (value !== undefined && value !== null && value !== '') {
    if (Array.isArray(value)) {
      displayValue = value.join(', ');
    } else if (labelKey === 'ratingLabel' && typeof value === 'number') {
      // This part might need adjustment based on how averageRating and reviewCount are displayed
      displayValue = `${value.toFixed(1)} / 10`; // Assuming 1-10 scale for display if needed
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

interface HotelDetailClientPageProps {
  params: { id: string };
  itemType: 'hotel';
  itemData: RecommendedItem | null;
}

export default function HotelDetailClientPage({ params, itemType, itemData }: HotelDetailClientPageProps) {
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
            if (entryData.categoryName === "hotels") {
              const nestedData = entryData.data || {};
              const rawImageUrl = nestedData['nuur-zurag-url'];
              let finalImageUrl: string | undefined = undefined;
              if (typeof rawImageUrl === 'string' && rawImageUrl.trim() !== '' && !rawImageUrl.startsWith("data:image/gif;base64") && !rawImageUrl.includes('lh3.googleusercontent.com')) {
                finalImageUrl = rawImageUrl.trim();
              }
              setItem({
                id: docSnap.id,
                name: nestedData.name || t('serviceUnnamed'),
                imageUrl: finalImageUrl,
                description: nestedData.setgegdel || '',
                location: nestedData.khot || undefined,
                averageRating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : null,
                reviewCount: typeof nestedData.reviewCount === 'number' ? nestedData.reviewCount : 0,
                totalRatingSum: typeof nestedData.totalRatingSum === 'number' ? nestedData.totalRatingSum : 0,
                price: nestedData.price === undefined ? null : nestedData.price,
                itemType: 'hotel',
                dataAiHint: nestedData.dataAiHint || "hotel item",
                rooms: (nestedData.uruunuud || []).map((room: any) => ({
                  description: room.description || t('noRoomDescription'),
                  imageUrl: room.imageUrl || `https://placehold.co/400x300.png?text=${encodeURIComponent(room.description || 'Room')}`,
                  name: room.name || undefined,
                })),
              } as RecommendedItem);
            } else {
              setItem(null);
            }
          } else {
            setItem(null);
          }
        } catch (error) {
          console.error("Error fetching hotel entry client-side:", error);
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
        serviceType: "hotel",
        serviceId: item.id,
        serviceName: item.name || t('serviceUnnamed'),
        orderDate: serverTimestamp(),
        status: 'pending_confirmation',
        amount: item.price === undefined ? null : item.price,
        imageUrl: item.imageUrl || null,
        dataAiHint: item.dataAiHint || "hotel building",
      };
      await addDoc(firestoreCollection(db, "orders"), orderData);

      const notificationData: Omit<NotificationItem, 'id'> = {
        titleKey: 'orderSuccessNotificationTitle',
        descriptionKey: 'orderSuccessNotificationDescription',
        descriptionPlaceholders: { serviceName: item.name || t('serviceUnnamed') },
        date: serverTimestamp(),
        read: false,
        itemType: "hotel",
        link: `/orders`,
        imageUrl: item.imageUrl || null,
        dataAiHint: item.dataAiHint || "hotel building",
      };
      if (user?.uid) {
        await addDoc(firestoreCollection(db, "users", user.uid, "notifications"), notificationData);
      }

      toast({ title: t('orderSuccessNotificationTitle'), description: t('orderSuccessNotificationDescription', { serviceName: item.name || t('serviceUnnamed') }) });
    } catch (error) {
      console.error("Error booking hotel:", error);
      toast({ title: t('orderFailedNotificationTitle'), description: t('orderFailedNotificationDescription', { serviceName: item.name || t('serviceUnnamed') }), variant: "destructive" });
    } finally {
      setIsBooking(false);
    }
  };
  
  const onReviewSubmitted = (newAverageRating: number, newReviewCount: number, newTotalRatingSum: number) => {
    if (item) {
      setItem(prevItem => prevItem ? ({
        ...prevItem,
        averageRating: newAverageRating,
        reviewCount: newReviewCount,
        totalRatingSum: newTotalRatingSum,
      }) : null);
    }
  };

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
  const mainImageShouldUnoptimize = item.imageUrl?.startsWith('data:') || item.imageUrl?.includes('lh3.googleusercontent.com');

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between h-16">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold text-primary truncate px-2">
            {item?.name || t('hotelDetailTitle')}
          </h1>
          <div className="w-10"> {/* Spacer */}</div>
        </div>
      </div>

      <div className="container mx-auto py-2 md:py-6 px-2">
        <Card className="overflow-hidden shadow-xl mb-6">
          <CardHeader className="p-0 relative aspect-[16/10] md:aspect-[16/7]">
            <Image
              src={item.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(item.name || 'Hotel')}`}
              alt={item.name || t('hotelDetailTitle')}
              layout="fill"
              objectFit="cover"
              className="bg-muted"
              data-ai-hint={item.dataAiHint || "hotel building"}
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
              {/* Updated Rating Display */}
              <div className="flex items-start text-sm">
                <Star className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 shrink-0" />
                <div>
                    <p className="font-medium text-muted-foreground">{t('ratingLabel')}</p>
                    {item.averageRating !== null && item.averageRating !== undefined && item.reviewCount !== undefined ? (
                        <p className="text-foreground">{t('averageRatingDisplay', { averageRating: item.averageRating.toFixed(1), reviewCount: item.reviewCount })}</p>
                    ) : (
                        <p className="text-foreground">{t('noReviewsYet')}</p>
                    )}
                </div>
              </div>
            </div>

            {item.rooms && item.rooms.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-xl font-semibold text-foreground flex items-center">
                  <BedDouble className="h-6 w-6 mr-2 text-primary"/>{t('roomsTitle') || "Өрөөнүүд"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {item.rooms.map((room, index) => (
                    <Card key={index} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      <div className="relative aspect-video">
                        <Image
                          src={room.imageUrl || `https://placehold.co/400x300.png?text=${encodeURIComponent(room.description || 'Room')}`}
                          alt={room.description || t('roomImageAlt') || 'Room image'}
                          layout="fill"
                          objectFit="cover"
                          className="bg-muted"
                          data-ai-hint={room.description ? room.description.substring(0,15) : "hotel room"}
                          unoptimized={room.imageUrl?.startsWith('data:') || room.imageUrl?.includes('lh3.googleusercontent.com')}
                        />
                      </div>
                      <CardContent className="p-3">
                        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                          {room.description || t('noRoomDescription') || 'No description available.'}
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
                  {t('bookNowButton')}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Review Form Section */}
        <ServiceReviewForm
          itemId={item.id}
          itemType={item.itemType}
          currentAverageRating={item.averageRating ?? 0}
          currentReviewCount={item.reviewCount ?? 0}
          currentTotalRatingSum={item.totalRatingSum ?? 0}
          onReviewSubmitted={onReviewSubmitted}
        />
        {/* TODO: Add ReviewList component here later */}
      </div>
    </div>
  );
}

    