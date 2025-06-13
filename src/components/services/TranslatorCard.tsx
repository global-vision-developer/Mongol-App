"use client";

import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Star } from "lucide-react";
import type { RecommendedItem } from '@/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface TranslatorCardProps {
  item: RecommendedItem;
  className?: string;
}

export function TranslatorCard({ item, className }: TranslatorCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { t } = useTranslation();

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Send to backend
  };

  return (
    <Card className={cn("flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg group", className)}>
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={item.imageUrl || `https://placehold.co/300x400.png?text=${encodeURIComponent(item.name)}`}
          alt={item.name}
          fill
          className="object-cover rounded-t-lg"
        />
        {item.primaryLanguage && (
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {t(item.primaryLanguage.toLowerCase())}
          </div>
        )}
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "absolute bottom-2 right-2 h-8 w-8 rounded-full bg-background/70 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity",
            isFavorite ? "text-destructive" : "text-muted-foreground"
          )}
          onClick={toggleFavorite}
          aria-label={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
        >
          <Heart className={cn("h-5 w-5", isFavorite && "fill-destructive")} />
        </Button>
      </div>

      <CardContent className="p-3 space-y-1 text-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-md font-semibold truncate">{item.name}</h3>
            {item.gender && (
              <p className="text-muted-foreground text-xs">{item.gender}</p>
            )}
          </div>
          {item.rating && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-4 w-4 fill-yellow-400" />
              <span className="text-xs font-semibold">{item.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {item.city && (
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            {item.city}
          </div>
        )}

        {item.testLevel && (
          <p className="text-xs text-muted-foreground">
            📘 {t('testLevel')}: {item.testLevel}
          </p>
        )}

        {item.speakingLevel && item.writingLevel && (
          <p className="text-xs text-muted-foreground">
            🗣️ {t('speaking')}: {item.speakingLevel}, ✍️ {t('writing')}: {item.writingLevel}
          </p>
        )}

        {item.hasWorkedBefore !== undefined && (
          <p className="text-xs text-muted-foreground">
            🧑‍💼 {t('workedBefore')}: {item.hasWorkedBefore ? t('yes') : t('no')}
          </p>
        )}

        {item.possibleFields && (
          <p className="text-xs text-muted-foreground">
            🏢 {t('fields')}: {item.possibleFields.join(', ')}
          </p>
        )}

{item.availableCities && (
  <p className="text-xs text-muted-foreground">
    🌍 {t('availableCities')}: {
      Array.isArray(item.availableCities)
        ? item.availableCities.join(', ')
        : item.availableCities
    }
  </p>
)}

        {item.price && (
          <p className="text-xs text-muted-foreground">
            💰 {t('price')}: {item.price}₮
          </p>
        )}
      </CardContent>
    </Card>
  );
}
