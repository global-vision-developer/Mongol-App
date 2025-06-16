
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { CAROUSEL_BANNER_ITEMS } from '@/lib/constants';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

export function CarouselBanner() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % CAROUSEL_BANNER_ITEMS.length);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + CAROUSEL_BANNER_ITEMS.length) % CAROUSEL_BANNER_ITEMS.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000); // Auto-scroll every 5 seconds
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (!CAROUSEL_BANNER_ITEMS.length) return null;

  return (
    <Card className="w-full shadow-lg rounded-lg overflow-hidden">
      <CardContent className="p-0 relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {CAROUSEL_BANNER_ITEMS.map((item, idx) => (
              <div key={item.id} className="w-full flex-shrink-0">
                {item.link ? (
                  <Link href={item.link}>
                    <Image
                      src={item.imageUrl}
                      alt={t(item.altTextKey)}
                      width={1200}
                      height={400}
                      className="w-full h-48 md:h-64 lg:h-80 object-cover"
                      priority={idx === 0}
                      fetchPriority={idx === 0 ? "high" : undefined}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      data-ai-hint={item.dataAiHint}
                    />
                  </Link>
                ) : (
                  <Image
                    src={item.imageUrl}
                    alt={t(item.altTextKey)}
                    width={1200}
                    height={400}
                    className="w-full h-48 md:h-64 lg:h-80 object-cover"
                    priority={idx === 0}
                    fetchPriority={idx === 0 ? "high" : undefined}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    data-ai-hint={item.dataAiHint}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {CAROUSEL_BANNER_ITEMS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                currentIndex === index ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
