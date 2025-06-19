
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Star, LanguagesIcon } from "lucide-react";
import type { Translator } from '@/types';
import React, { useState, useEffect } from 'react'; 
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
// CITIES import is removed as city data will be handled differently or passed directly

interface TranslatorCardProps {
  item: Translator;
  className?: string;
}

function TranslatorCardComponent({ item, className }: TranslatorCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { t, language } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Favorite status check logic (if any) would go here
  }, []);


  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Send to backend (add/remove from user's saved translators)
  };

  // Use the city name directly from the item, if available
  const cityLabel = item.currentCityInChina || item.city;
  // For Chinese label, you might need a mapping if item doesn't directly provide it
  // or adjust how city labels are handled in CityContext / fetched data
  const displayCity = cityLabel || t('n_a'); 
  
  const placeholderImage = `https://placehold.co/300x400.png?text=${encodeURIComponent(item.name || 'T')}`;
  const imageUrlToDisplay = item.photoUrl || placeholderImage;
  const shouldUnoptimize = item.photoUrl?.startsWith('data:') || item.photoUrl?.includes('lh3.googleusercontent.com');


  if (!isMounted) {
    return null;
  }

  return (
    <Link href={`/services/translators/${item.id}`} className="block group h-full">
      <Card className={cn("flex flex-col overflow-hidden shadow-lg rounded-lg h-full group-hover:-translate-y-1.5 group-hover:shadow-2xl transition-all duration-300 ease-out", className)}>
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={imageUrlToDisplay}
            alt={item.name || t('serviceUnnamed')}
            fill
            className="object-cover rounded-t-lg"
            data-ai-hint="translator person"
            unoptimized={shouldUnoptimize}
          />
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute top-2 right-2 h-8 w-8 rounded-full bg-background/70 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity z-10",
              isFavorite ? "text-destructive" : "text-muted-foreground"
            )}
            onClick={toggleFavorite}
            aria-label={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-destructive")} />
          </Button>
        </div>

        <CardContent className="p-3 space-y-1 text-sm flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-md font-semibold truncate group-hover:text-primary">{item.name || t('serviceUnnamed')}</h3>

            {item.averageRating !== undefined && item.averageRating !== null && (
              <div className="flex items-center gap-1 text-xs text-amber-500 mt-0.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                <span>{item.averageRating.toFixed(1)}</span>
                {item.reviewCount !== undefined && <span className="text-muted-foreground">({item.reviewCount})</span>}
              </div>
            )}

            {displayCity !== t('n_a') && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
                <span className="truncate">{displayCity}</span>
              </div>
            )}

            {(item.speakingLevel || item.writingLevel) && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <LanguagesIcon className="h-3.5 w-3.5 mr-1 shrink-0" />
                <span className="truncate">
                  {item.speakingLevel && `${t('speaking')}: ${t(`languageLevel${item.speakingLevel.charAt(0).toUpperCase() + item.speakingLevel.slice(1)}`)}`}
                  {item.speakingLevel && item.writingLevel && ", "}
                  {item.writingLevel && `${t('writing')}: ${t(`languageLevel${item.writingLevel.charAt(0).toUpperCase() + item.writingLevel.slice(1)}`)}`}
                </span>
              </div>
            )}
          </div>

          {item.dailyRate && (
            <p className="text-sm font-semibold text-primary mt-2 self-end">
              {t(`rate${item.dailyRate.replace('-', 'to').replace('+', 'plus')}`)}/{t('day')}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export const TranslatorCard = React.memo(TranslatorCardComponent);

```