
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import type { RecommendedItem, ItemType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Star, MapPin, AlertTriangle, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const DetailItem: React.FC<{ labelKey: string; value?: string | string[] | null | number; icon?: React.ElementType; }> = ({ labelKey, value, icon: Icon }) => {
  const { t } = useTranslation();
  let displayValue = t('notProvided');
  if (value !== undefined && value !== null && value !== '') {
    if (Array.isArray(value)) {
      displayValue = value.join(', ');
    } else if (labelKey === 'ratingLabel' && typeof value === 'number') {
      displayValue = `${value.toFixed(1)} / 5`;
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

interface EmbassyDetailClientPageProps {
  params: { id: string };
  itemType: 'embassy';
  itemData: RecommendedItem | null;
}

export default function EmbassyDetailClientPage({ params, itemType, itemData }: EmbassyDetailClientPageProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth(); // Keep useAuth if needed for other purposes

  const [item, setItem] = useState<RecommendedItem | null>(itemData);
  const [loadingInitial, setLoadingInitial] = useState(!itemData && !!params.id);

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
            // Ensure itemType matches categoryName; for embassies it might be "embassies"
            if (entryData.categoryName === "embassies") { 
              const nestedData = entryData.data || {};
              const rawImageUrl = nestedData['nuur-zurag-url'];
              let finalImageUrl: string | undefined = undefined;
              if (typeof rawImageUrl === 'string' && rawImageUrl.trim() !== '') {
                finalImageUrl = rawImageUrl.trim();
              }
              setItem({
                id: docSnap.id,
                name: nestedData.name || t('serviceUnnamed'),
                imageUrl: finalImageUrl,
                description: nestedData.setgegdel || '',
                location: nestedData.khot || undefined,
                rating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : undefined,
                price: nestedData.price === undefined ? null : nestedData.price,
                itemType: entryData.categoryName as ItemType, // Use actual categoryName
                dataAiHint: nestedData.dataAiHint || "embassy item",
              } as RecommendedItem);
            } else {
              setItem(null);
            }
          } else {
            setItem(null);
          }
        } catch (error) {
          console.error("Error fetching embassy entry client-side:", error);
          setItem(null);
        } finally {
          setLoadingInitial(false);
        }
      };
      fetchItem();
    }
  }, [itemData, params.id, itemType, t]);

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
            {item?.name || t('embassyDetailTitle')}
          </h1>
          <div className="w-10"> {/* Spacer */}</div>
        </div>
      </div>

      <div className="container mx-auto py-2 md:py-6 px-2">
        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="p-0 relative aspect-[16/10] md:aspect-[16/7]">
            <Image
              src={item.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(item.name || 'Embassy')}`}
              alt={item.name || t('embassyDetailTitle')}
              layout="fill"
              objectFit="cover"
              className="bg-muted"
              data-ai-hint={item.dataAiHint || "embassy building flag"}
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
              <DetailItem labelKey="ratingLabel" value={typeof item.rating === 'number' ? item.rating : undefined} icon={Star} />
            </div>
          </CardContent>
           {/* CardFooter with order button removed */}
        </Card>
      </div>
    </div>
  );
}
