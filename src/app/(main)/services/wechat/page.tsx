
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { CitySelector } from "@/components/CitySelector";
import { SearchBar } from "@/components/SearchBar";
import { WeChatCategoryGrid } from "@/components/services/WeChatCategoryGrid";
import { ServiceCard } from "@/components/ServiceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCity } from "@/contexts/CityContext";
import { collection, getDocs, query, where, type Query as FirestoreQueryType, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { RecommendedItem, ItemType } from "@/types";

export default function WeChatPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedCity } = useCity();

  const [productItems, setProductItems] = useState<RecommendedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeChatEntries = async () => {
      setLoading(true);
      setError(null);
      try {
        const entriesRef = collection(db, "entries");
        const queryConstraints = [where("categoryName", "==", "wechat")]; 

        if (selectedCity && selectedCity.value !== "all") {
          queryConstraints.push(where("data.khot", "==", selectedCity.value)); 
        }

        const q: FirestoreQueryType = query(entriesRef, ...queryConstraints);
        const snapshot = await getDocs(q);
        
        const data: RecommendedItem[] = snapshot.docs.map((doc) => {
          const entryData = doc.data();
          const nestedData = entryData.data || {};

          const rawImageUrl = nestedData['nuur-zurag-url'];
          const finalImageUrl = (rawImageUrl && typeof rawImageUrl === 'string' && rawImageUrl.trim() && !rawImageUrl.startsWith("https://lh3.googleusercontent.com/")) ? rawImageUrl.trim() : undefined;

          return {
            id: doc.id,
            name: nestedData.name || t('serviceUnnamed'), // Changed from nestedData.title
            imageUrl: finalImageUrl,
            description: nestedData.setgegdel || '',
            location: nestedData.khot || undefined,
            rating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : undefined,
            price: nestedData.price,
            itemType: entryData.categoryName as ItemType, 
            dataAiHint: nestedData.dataAiHint || "wechat item",
            wechatId: nestedData.wechatId, 
            wechatQrImageUrl: nestedData.wechatQrImageUrl, 
          } as RecommendedItem;
        });

        setProductItems(data);
      } catch (err: any) {
        console.error("Error fetching WeChat entries:", err);
        setError(t('fetchErrorGeneric') || "Өгөгдөл татахад алдаа гарлаа.");
      } finally {
        setLoading(false);
      }
    };
    
    if(selectedCity){ 
        fetchWeChatEntries();
    } else {
        setLoading(false);
        setProductItems([]);
    }

  }, [selectedCity, t]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background py-3 md:relative md:py-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="md:hidden">
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">{t('back')}</span>
        </Button>
        <h1 className="text-xl font-headline font-semibold text-center flex-grow text-primary md:text-3xl">
          {t('wechatPageTitle')}
        </h1>
        <div className="w-10 md:hidden" /> {/* Spacer for centering title on mobile */}
      </div>

      <div className="flex flex-col md:flex-row gap-2 px-1">
        <CitySelector />
        <div className="flex-grow">
          <SearchBar />
        </div>
      </div>

      <div className="px-1">
        <WeChatCategoryGrid />
      </div>

      <div className="px-1">
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="col-span-full text-destructive">{error}</p>
        )}

        {!loading && !error && productItems.length === 0 && (
          <p className="col-span-full text-muted-foreground">{t('noRecommendations')}</p>
        )}

        {!loading && !error && productItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {productItems.map((item) => (
              <ServiceCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

