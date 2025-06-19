
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, getDocs, Timestamp, type DocumentData } from "firebase/firestore";
import { db } from '@/lib/firebase';
import type { CarouselBannerItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export function CarouselBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bannerItems, setBannerItems] = useState<CarouselBannerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      setLoading(true);
      try {
        const bannersRef = collection(db, "banners");
        const q = query(bannersRef, where("isActive", "==", true), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const items: CarouselBannerItem[] = querySnapshot.docs.map((doc) => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            imageUrl: data.imageUrl,
            link: data.link,
            altText: data.description || `Banner ${doc.id}`, // Use description for alt, or a generic one
            dataAiHint: data.dataAiHint || "promotional banner", // Use hint from DB or generic
            isActive: data.isActive,
            createdAt: data.createdAt,
            description: data.description,
          } as CarouselBannerItem;
        });
        setBannerItems(items);
      } catch (error) {
        console.error("Error fetching banners:", error);
        setBannerItems([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const nextSlide = useCallback(() => {
    if (bannerItems.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerItems.length);
  }, [bannerItems.length]);

  const prevSlide = () => {
    if (bannerItems.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + bannerItems.length) % bannerItems.length);
  };

  useEffect(() => {
    if (bannerItems.length > 1) { // Only auto-scroll if more than one item
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [nextSlide, bannerItems.length]);

  if (loading) {
    return (
      <Skeleton className="w-full h-48 md:h-64 lg:h-80 rounded-lg" />
    );
  }

  if (!bannerItems.length) {
    return null; // Don't render if no active banners
  }

  return (
    <Card className="w-full shadow-lg rounded-lg overflow-hidden">
      <CardContent className="p-0 relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {bannerItems.map((item, idx) => (
              <div key={item.id} className="w-full flex-shrink-0">
                {item.link ? (
                  <Link href={item.link} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={item.imageUrl}
                      alt={item.altText || `Banner ${idx + 1}`}
                      width={1200}
                      height={400}
                      className="w-full h-48 md:h-64 lg:h-80 object-cover"
                      priority={idx === 0}
                      fetchPriority={idx === 0 ? "high" : undefined}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      data-ai-hint={item.dataAiHint || "promotional banner"}
                      unoptimized={item.imageUrl?.startsWith('data:') || item.imageUrl?.includes('lh3.googleusercontent.com')}
                    />
                  </Link>
                ) : (
                  <Image
                    src={item.imageUrl}
                    alt={item.altText || `Banner ${idx + 1}`}
                    width={1200}
                    height={400}
                    className="w-full h-48 md:h-64 lg:h-80 object-cover"
                    priority={idx === 0}
                    fetchPriority={idx === 0 ? "high" : undefined}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    data-ai-hint={item.dataAiHint || "promotional banner"}
                    unoptimized={item.imageUrl?.startsWith('data:') || item.imageUrl?.includes('lh3.googleusercontent.com')}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {bannerItems.length > 1 && (
          <>
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
              {bannerItems.map((_, index) => (
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
          </>
        )}
      </CardContent>
    </Card>
  );
}

