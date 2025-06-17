
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
      setIsFavorite(false); 
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
        // Prepare item data for saving, exclude 'id' if it's the doc key itself
        const { id, ...itemDataToSave } = item; 
        
        await setDoc(favDocRef, {
          ...itemDataToSave,
          // Ensure all fields from RecommendedItem that are needed on saved page are here
          // For example, if ServiceCard on saved page relies on item.name, item.imageUrl, etc.
          // they must be present in itemDataToSave.
          // Also, explicitly add itemType and originalId if needed.
          originalItemId: id, // Store original item id if doc id is different or for reference
          itemType: item.itemType, // Crucial for routing from saved page
          savedAt: serverTimestamp(),
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
      // Add other cases if needed
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
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
        <div className="space-y-0.5"> {/* Ensures consistent spacing for text block */}
            <CardTitle className="text-md font-semibold truncate mb-1 group-hover:text-primary">{item.name || t('serviceUnnamed')}</CardTitle>
            
            {/* Reserve space for location line, even if item.location is not present */}
            <div className="h-4"> {/* h-4 is approx 1rem, typical height for text-xs line */}
              {item.location && (
              <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1 shrink-0" />
                  <span className="truncate">{item.location}</span>
              </div>
              )}
            </div>
        </div>
        
        <div className="flex justify-end items-center mt-2">
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
