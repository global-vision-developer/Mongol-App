
"use client";

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Heart, MapPin } from "lucide-react";
import type { RecommendedItem } from '@/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface ServiceCardProps {
  item: RecommendedItem;
  className?: string;
}

export function ServiceCard({ item, className }: ServiceCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { t } = useTranslation();

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // API дуудлага хийх боломжтой
  };

  // rating тоог шалгаж, тоо биш бол дамжуулахгүй байх
  const ratingNumber = typeof item.rating === "number" ? item.rating : null;

  return (
    <Card className={cn("flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg", className)}>
      <CardHeader className="p-0 relative">
        <Image
          src={item.imageUrl || `https://placehold.co/400x250.png?text=${encodeURIComponent(item.name)}`}
          alt={item.name}
          width={400}
          height={250}
          className="w-full h-48 object-cover"
          data-ai-hint={item.dataAiHint || "item image"}
          unoptimized={false} // шаардлагатай бол true болгож болно
        />
        <Button 
          size="icon" 
          variant="ghost" 
          className={cn(
            "absolute top-2 right-2 h-8 w-8 rounded-full bg-background/70 hover:bg-background",
            isFavorite ? "text-destructive" : "text-muted-foreground"
          )}
          onClick={toggleFavorite}
          aria-label={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
        >
          <Heart className={cn("h-5 w-5", isFavorite && "fill-destructive")} />
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-headline mb-1 line-clamp-2">{item.name}</CardTitle>
        {item.location && (
          <div className="flex items-center text-xs text-muted-foreground mb-1">
            <MapPin className="h-3 w-3 mr-1 shrink-0" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
        )}
        <CardDescription className="text-sm line-clamp-3 mb-2">{item.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        {ratingNumber !== null && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-accent fill-accent" />
            <span>{ratingNumber.toFixed(1)}</span>
          </div>
        )}
        <Button variant="outline" size="sm">{t('viewDetails')}</Button>
      </CardFooter>
    </Card>
  );
}

