
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Heart, MapPin } from "lucide-react";
import type { RecommendedItem } from '@/types';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useCity } from '@/contexts/CityContext';
import { useRouter } from 'next/navigation';

interface ServiceCardProps {
  item: RecommendedItem;
  className?: string;
}

function ServiceCardComponent({ item, className }: ServiceCardProps) {
  const { user, isItemFavorite, addFavorite, removeFavorite } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const { availableCities } = useCity(); 
  
  const [isProcessingFavorite, setIsProcessingFavorite] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const isFavorite = user ? isItemFavorite(item.id) : false;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({ title: t('loginToProceed'), description: t('loginToSave'), variant: "destructive" });
      router.push('/auth/login');
      return;
    }
    if (!item || !item.id) {
      console.error("Item or item.id is missing in toggleFavorite.");
      return;
    }

    setIsProcessingFavorite(true);
    
    try {
      if (isFavorite) {
        await removeFavorite(item.id);
        toast({ title: t('itemRemovedFromSaved') });
      } else {
        await addFavorite(item);
        toast({ title: t('itemSaved') });
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
      toast({ title: isFavorite ? t('errorRemovingItem') : t('errorSavingItem'), variant: "destructive" });
    } finally {
      setIsProcessingFavorite(false);
    }
  };

  const cityId = item.location;
  const cityObject = cityId ? availableCities.find(c => c.value === cityId) : null;
  const displayCityName = cityObject ? (language === 'cn' && cityObject.label_cn ? cityObject.label_cn : cityObject.label) : null;

  let detailPageLink: string | undefined = undefined;

  if (item.id) {
    const basePath = '/services';
    switch (item.itemType) {
      case 'translator':
        detailPageLink = `${basePath}/translators/${item.id}`;
        break;
      case 'hotel':
        detailPageLink = `${basePath}/hotels/${item.id}`;
        break;
      case 'market':
        detailPageLink = `${basePath}/markets/${item.id}`;
        break;
      case 'factory':
        detailPageLink = `${basePath}/factories/${item.id}`;
        break;
      case 'hospital':
        detailPageLink = `${basePath}/hospitals/${item.id}`;
        break;
      case 'embassy':
        detailPageLink = `${basePath}/embassies/${item.id}`;
        break;
      case 'wechat':
        detailPageLink = `${basePath}/wechat/${item.id}`;
        break;
    }
  }

  const cardItselfIsLink = !!detailPageLink;
  const placeholderImage = `https://placehold.co/300x400.png?text=${encodeURIComponent(item.name || t('serviceUnnamed'))}`;
  const imageUrlToDisplay = item.imageUrl || placeholderImage;
  const shouldUnoptimize = item.imageUrl?.startsWith('data:') || item.imageUrl?.includes('lh3.googleusercontent.com');

  const cardContent = (
    <Card className={cn("flex flex-col overflow-hidden shadow-lg rounded-lg h-full group-hover:-translate-y-1.5 group-hover:shadow-2xl transition-all duration-300 ease-out", className)}>
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
        {isMounted && user && (
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
        <div className="space-y-0.5">
            <CardTitle className="text-md font-semibold truncate mb-1 group-hover:text-primary">{item.name || t('serviceUnnamed')}</CardTitle>
            <div className="h-4"> 
              {displayCityName && (
              <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1 shrink-0" />
                  <span className="truncate">{displayCityName}</span>
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
      <Link href={detailPageLink!} className="group block h-full focus:outline-none" aria-label={item.name || t('serviceUnnamed')}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

export const ServiceCard = React.memo(ServiceCardComponent);
