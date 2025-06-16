
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { CitySelector } from "@/components/CitySelector";
import { SearchBar } from "@/components/SearchBar";
import { ServiceCard } from "@/components/ServiceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCity } from "@/contexts/CityContext";

import { collection, getDocs, query, where, type Query as FirestoreQueryType, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";

import type { RecommendedItem, ItemType } from "@/types";

export default function HotelsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedCity } = useCity();

  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotelEntries = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!selectedCity) { 
          setRecommendations([]);
          setLoading(false);
          return;
        }

        const entriesRef = collection(db, "entries");
        const queryConstraints = [where("categoryName", "==", "hotels")];
        
        if (selectedCity.value !== "all") {
          queryConstraints.push(where("data.khot", "==", selectedCity.value));
        }

        const q: FirestoreQueryType = query(entriesRef, ...queryConstraints);
        
        const snapshot = await getDocs(q);
        const items: RecommendedItem[] = snapshot.docs.map(doc => {
          const entryData = doc.data();
          const nestedData = entryData.data || {};
          
          const rawImageUrl = nestedData['nuur-zurag-url'];
          const finalImageUrl = (rawImageUrl && typeof rawImageUrl === 'string' && rawImageUrl.trim()) ? rawImageUrl.trim() : undefined;

          return {
            id: doc.id,
            name: nestedData.title || t('serviceUnnamed'),
            imageUrl: finalImageUrl,
            description: nestedData.setgegdel || '',
            location: nestedData.khot || undefined,
            rating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : undefined,
            price: nestedData.price,
            itemType: entryData.categoryName as ItemType,
            dataAiHint: nestedData.dataAiHint || "hotel item",
          } as RecommendedItem;
        });

        setRecommendations(items);
      } catch (err: any) {
        console.error("Error fetching hotel entries:", err);
        setError(
          typeof err === "string"
            ? err
            : err?.message || t('fetchHotelsError') || "Өгөгдөл татахад алдаа гарлаа"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHotelEntries();
  }, [selectedCity, t]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background py-3 md:relative md:py-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="md:hidden">
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">{t('back')}</span>
        </Button>
        <h1 className="text-xl font-headline font-semibold text-center flex-grow text-primary md:text-3xl">
          {t('hotelsPageTitle')}
        </h1>
        <div className="w-10 md:hidden" />
      </div>

      <div className="flex flex-col md:flex-row gap-2 px-1">
        <CitySelector />
        <div className="flex-grow">
          <SearchBar />
        </div>
      </div>

      <div className="px-1">
        <h2 className="text-2xl font-headline font-semibold mb-4">{t('allSectionTitle')}</h2>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, idx) => (
              <Skeleton key={idx} className="h-48 rounded-lg" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-red-600 font-semibold">{error}</p>
        )}

        {!loading && !error && recommendations.length === 0 && (
          <p>{t('noHotelsFound') || "Мэдээлэл олдсонгүй"}</p>
        )}

        {!loading && !error && recommendations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recommendations.map((item) => (
              <ServiceCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

