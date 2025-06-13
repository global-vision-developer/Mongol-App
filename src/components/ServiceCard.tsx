
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Heart, MapPin } from "lucide-react";
import type { RecommendedItem } from '@/types';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface ServiceCardProps {
  item: RecommendedItem;
  className?: string;
}

export function ServiceCard({ item, className }: ServiceCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // In a real app, check favorite status from user data
  }, []);


  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // API call to update favorite status
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

  const cardContent = (
    <Card className={cn("flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg h-full group", className)}>
      <CardHeader className="p-0 relative">
        <Image
          src={item.imageUrl || `https://placehold.co/400x250.png?text=${encodeURIComponent(item.name || t('serviceUnnamed'))}`}
          alt={item.name || t('serviceImageDefaultAlt')}
          width={400}
          height={250}
          className="w-full h-48 object-cover"
          data-ai-hint={item.dataAiHint || "item image"}
          unoptimized={item.imageUrl?.includes('lh3.googleusercontent.com')} 
        />
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
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-destructive")} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-headline mb-1 line-clamp-2 group-hover:text-primary">{item.name || t('serviceUnnamed')}</CardTitle>
        {item.location && (
          <div className="flex items-center text-xs text-muted-foreground mb-1">
            <MapPin className="h-3 w-3 mr-1 shrink-0" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
        )}
        <CardDescription className="text-sm line-clamp-3 mb-2">{item.description || ''}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        {ratingNumber !== null && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-accent fill-accent" />
            <span>{ratingNumber.toFixed(1)}</span>
          </div>
        )}
        {/* Ensure the button is part of the link if detailPageLink exists, or disabled if not */}
        {cardItselfIsLink ? (
          <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
            {t('viewDetails')}
          </span>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            disabled={true}
            className="opacity-50 cursor-not-allowed"
          >
            {t('viewDetails')}
          </Button>
        )}
      </CardFooter>
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
