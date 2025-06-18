
"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { CitySelector } from "@/components/CitySelector";
import { SearchBar } from "@/components/SearchBar";
import { ServiceCard } from "@/components/ServiceCard";
// import { HospitalCategoryGrid } from "@/components/services/HospitalCategoryGrid"; // Removed static grid
import { Skeleton } from "@/components/ui/skeleton";
import { useCity } from "@/contexts/CityContext";
import type { RecommendedItem, ItemType } from "@/types";
import { collection, getDocs, query, where, type Query as FirestoreQueryType, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

const mapCategoryToSingularItemType = (categoryName: string): ItemType => {
  const lowerCategoryName = categoryName?.toLowerCase();
  switch (lowerCategoryName) {
    case 'hospitals': return 'hospital';
    default: return lowerCategoryName as ItemType;
  }
};

export default function HospitalsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedCity } = useCity();

  const [allHospitalItems, setAllHospitalItems] = useState<RecommendedItem[]>([]);
  const [displayableSubcategories, setDisplayableSubcategories] = useState<string[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHospitalEntries = async () => {
      setLoading(true);
      setError(null);
      try {
        const entriesRef = collection(db, "entries");
        const queryConstraints = [where("categoryName", "==", "hospitals")]; 
        
        if (selectedCity && selectedCity.value !== "all") {
          queryConstraints.push(where("data.khot", "==", selectedCity.value));
        }

        const q: FirestoreQueryType = query(entriesRef, ...queryConstraints);
        const snapshot = await getDocs(q);

        const items: RecommendedItem[] = snapshot.docs.map(doc => {
          const entryData = doc.data();
          const nestedData = entryData.data || {};

          let finalImageUrl: string | undefined = undefined;
          const rawImageUrl = nestedData['nuur-zurag-url'];
          if (rawImageUrl && typeof rawImageUrl === 'string' && rawImageUrl.trim() !== '' && !rawImageUrl.startsWith("data:image/gif;base64") && !rawImageUrl.includes('lh3.googleusercontent.com')) {
            finalImageUrl = rawImageUrl.trim();
          }
          
          return {
            id: doc.id,
            name: nestedData.name || t('serviceUnnamed'),
            imageUrl: finalImageUrl,
            description: nestedData.setgegdel || '',
            location: nestedData.khot || undefined,
            averageRating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : null,
            reviewCount: typeof nestedData.reviewCount === 'number' ? nestedData.reviewCount : 0,
            totalRatingSum: typeof nestedData.totalRatingSum === 'number' ? nestedData.totalRatingSum : 0,
            price: nestedData.price === undefined ? null : nestedData.price,
            itemType: mapCategoryToSingularItemType(entryData.categoryName),
            dataAiHint: nestedData.dataAiHint || "hospital item",
            subcategory: nestedData.subcategory || null,
          } as RecommendedItem;
        });
        setAllHospitalItems(items);

        const subcategories = new Set(items.map(item => item.subcategory).filter(Boolean) as string[]);
        setDisplayableSubcategories(Array.from(subcategories));
        setSelectedSubcategory(null);

      } catch (err: any) {
        console.error("Error fetching hospital entries:", err);
        setError(t('fetchErrorGeneric') || "Өгөгдөл татахад алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };

    if(selectedCity){
        fetchHospitalEntries();
    } else {
        setLoading(false);
        setAllHospitalItems([]);
        setDisplayableSubcategories([]);
    }
  }, [selectedCity, t]);

  const filteredItems = useMemo(() => {
    if (!selectedSubcategory) {
      return allHospitalItems;
    }
    return allHospitalItems.filter(item => item.subcategory === selectedSubcategory);
  }, [allHospitalItems, selectedSubcategory]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background py-3 md:relative md:py-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="md:hidden">
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">{t('back')}</span>
        </Button>
        <h1 className="text-xl font-headline font-semibold text-center flex-grow text-primary md:text-3xl">
          {t('hospitalsPageTitle')}
        </h1>
        <div className="w-10 md:hidden" /> {/* Spacer */}
      </div>

      <div className="flex flex-col md:flex-row gap-2 px-1">
        <CitySelector />
        <div className="flex-grow">
          <SearchBar />
        </div>
      </div>

      {/* Removed static <HospitalCategoryGrid /> */}

      {displayableSubcategories.length > 0 && (
        <div className="px-1 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            {t('filterBySubcategory')}
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!selectedSubcategory ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubcategory(null)}
              className="rounded-full"
            >
              {t('allSubcategories')}
            </Button>
            {displayableSubcategories.map(subcat => (
              <Button
                key={subcat}
                variant={selectedSubcategory === subcat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSubcategory(subcat)}
                className="rounded-full"
              >
                {subcat}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="px-1">
        <h2 className="text-2xl font-headline font-semibold mb-4">{t('allHospitalsSectionTitle')}</h2>
        
        {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(4)].map((_, i) => (
                <div key={`skeleton-hospital-${i}`} className="flex flex-col space-y-3">
                    <Skeleton className="h-[180px] w-full rounded-xl aspect-[3/4]" />
                    <div className="space-y-2 p-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
                ))}
            </div>
        )}

        {!loading && error && <p className="col-span-full text-destructive">{error}</p>}
        
        {!loading && !error && filteredItems.length === 0 && (
            <p className="col-span-full text-muted-foreground">{t('noRecommendations')}</p>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <ServiceCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
