
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Heart, MapPin } from "lucide-react";
import type { RecommendedItem } from '@/types';
import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { doc, setDoc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";


interface ServiceCardProps {
  item: RecommendedItem;
  className?: string;
}

function ServiceCardComponent({ item, className }: ServiceCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [isProcessingFavorite, setIsProcessingFavorite] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const checkFavoriteStatus = useCallback(async () => {
    if (!user || !item.id || !isMounted) return;
    setIsProcessingFavorite(true);
    try {
      const favDocRef = doc(db, "users", user.uid, "savedItems", item.id);
      const docSnap = await getDoc(favDocRef);
      setIsFavorite(docSnap.exists());
    } catch (error) {
      console.error("Error checking favorite status:", error);
      // Do not show toast for this type of error on load
    } finally {
      setIsProcessingFavorite(false);
    }
  }, [user, item.id, isMounted]);


  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && user && item.id) {
      checkFavoriteStatus();
    } else if (!user) {
      setIsFavorite(false); // Reset if user logs out
    }
  }, [user, item.id, checkFavoriteStatus, isMounted]);


  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({ title: t('loginToProceed'), description: t('loginToSave'), variant: "destructive" });
      return;
    }
    if (!item || !item.id) return;

    setIsProcessingFavorite(true);
    const favDocRef = doc(db, "users", user.uid, "savedItems", item.id);

    try {
      if (isFavorite) {
        await deleteDoc(favDocRef);
        setIsFavorite(false);
        toast({ title: t('itemRemovedFromSaved') });
      } else {
        // Ensure all necessary fields from RecommendedItem are saved
        const itemToSave: any = { ...item };
        delete itemToSave.id; // Don't save the ID as a field in the document if it's the doc ID
        
        await setDoc(favDocRef, {
          ...itemToSave,
          savedAt: serverTimestamp(),
          itemType: item.itemType, // Ensure itemType is explicitly saved
        });
        setIsFavorite(true);
        toast({ title: t('itemSaved') });
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
      toast({ title: isFavorite ? t('errorRemovingItem') : t('errorSavingItem'), variant: "destructive" });
    } finally {
      setIsProcessingFavorite(false);
    }
  };

  const ratingNumber = typeof item.rating === "number" ? item.rating : null;

  let detailPageLink: string | undefined = undefined;

  if (item.id) {
    switch (item.itemType) {
      case 'translator':
        detailPageLink = `/services/translators/${item.id}`;
        break;
      case 'hotel':
        detailPageLink = `/services/hotels/${item.id}`;
        break;
      case 'market':
        detailPageLink = `/services/markets/${item.id}`;
        break;
      case 'factory':
        detailPageLink = `/services/factories/${item.id}`;
        break;
      case 'hospital':
        detailPageLink = `/services/hospitals/${item.id}`;
        break;
      case 'embassy':
        detailPageLink = `/services/embassies/${item.id}`;
        break;
      case 'wechat':
        detailPageLink = `/services/wechat/${item.id}`;
        break;
      // Add other cases as needed for new service types
    }
  }

  const cardItselfIsLink = !!detailPageLink;
  const placeholderImage = `https://placehold.co/400x300.png?text=${encodeURIComponent(item.name || t('serviceUnnamed'))}`;
  const imageUrlToDisplay = item.imageUrl || placeholderImage;
  const shouldUnoptimize = item.imageUrl?.startsWith('data:') || item.imageUrl?.includes('lh3.googleusercontent.com');


  const cardContent = (
    <Card className={cn("flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg h-full group", className)}>
      <CardHeader className="p-0 relative">
        <div className="relative aspect-[3/4] w-full">
            <Image
                src={imageUrlToDisplay}
                alt={item.name || t('serviceImageDefaultAlt')}
                fill
                className="object-cover"
                data-ai-hint={item.dataAiHint || "item image"}
                unoptimized={shouldUnoptimize}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" // Example sizes, adjust as needed
            />
        </div>
        {isMounted && (
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute top-2 right-2 h-8 w-8 rounded-full bg-background/70 hover:bg-background z-10",
              isFavorite ? "text-destructive" : "text-muted-foreground"
            )}
            onClick={toggleFavorite}
            aria-label={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
            disabled={isProcessingFavorite}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-destructive")} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-3 flex-grow flex flex-col justify-between">
        <div>
            {/* Changed title to text-md, truncate and font-semibold to match TranslatorCard style */}
            <CardTitle className="text-md font-semibold truncate mb-1 group-hover:text-primary">{item.name || t('serviceUnnamed')}</CardTitle>
            {item.location && (
            <div className="flex items-center text-xs text-muted-foreground mb-1">
                <MapPin className="h-3 w-3 mr-1 shrink-0" />
                <span className="truncate">{item.location}</span> {/* Changed to truncate */}
            </div>
            )}
            {/* Changed description to truncate and mb-1 */}
            <CardDescription className="text-xs truncate mb-1">{item.description || ''}</CardDescription>
        </div>
        
        <div className="flex justify-between items-center mt-2">
            {ratingNumber !== null && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-4 w-4 text-accent fill-accent" />
                <span>{ratingNumber.toFixed(1)}</span>
            </div>
            )}
            {ratingNumber === null && <div className="flex-grow"></div>}

            {cardItselfIsLink ? (
            <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-2.5">
                {t('viewDetails')}
            </span>
            ) : (
            <Button
                variant="outline"
                size="sm"
                disabled={true}
                className="opacity-50 cursor-not-allowed h-8 px-2.5 text-xs"
            >
                {t('viewDetails')}
            </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );

  if (cardItselfIsLink) {
    return (
      <Link href={detailPageLink!} className="block h-full focus:outline-none" aria-label={item.name || t('serviceUnnamed')}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

export const ServiceCard = React.memo(ServiceCardComponent);

