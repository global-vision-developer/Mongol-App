
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { CitySelector } from "@/components/CitySelector";
import { SearchBar } from "@/components/SearchBar";
import { TranslatorCard } from "@/components/services/TranslatorCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCity } from "@/contexts/CityContext";
import { collection, getDocs, query, where, type Query } from "firebase/firestore"; 
import { db } from "@/lib/firebase";
import type { Translator } from "@/types";

export default function TranslatorsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedCity } = useCity();

  const [translators, setTranslators] = useState<Translator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranslators = async () => {
      setLoading(true);
      setError(null);
      try {
        const ref = collection(db, "translators");
        let q: Query;
        if (selectedCity && selectedCity.value !== "all") {
          q = query(ref, where("city", "==", selectedCity.value), where("isActive", "==", true));
        } else {
          q = query(ref, where("isActive", "==", true)); 
        }
        const snapshot = await getDocs(q);
        const translatorsData: Translator[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Translator[];
        
        setTranslators(translatorsData);
      } catch (err) {
        console.error("Error fetching translators:", err);
        setError(t('fetchErrorGeneric') || "Алдаа гарлаа. Түр хүлээнэ үү.");
      } finally {
        setLoading(false);
      }
    };

    if(selectedCity){ 
        fetchTranslators();
    } else {
        setLoading(false); 
        setTranslators([]);
    }
  }, [selectedCity, t]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background py-3 md:relative md:py-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="md:hidden">
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">{t('back')}</span>
        </Button>
        <h1 className="text-xl font-headline font-semibold text-center flex-grow text-primary md:text-3xl">
          {t('translatorsPageTitle')}
        </h1>
        <Button variant="ghost" size="icon" asChild className="text-primary">
          <Link href="/profile/register-translator" aria-label={t('addTranslator')}>
            <UserPlus className="h-6 w-6" />
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 px-1">
        <CitySelector />
        <div className="flex-grow">
          <SearchBar />
        </div>
      </div>

      {/* Results */}
      <div className="px-1">
        <h2 className="text-2xl font-headline font-semibold mb-4">{t('translatorsSectionTitle')}</h2>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => ( // Increased skeleton count for better loading feel
              <div key={`skeleton-${i}`} className="flex flex-col space-y-2">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" aria-hidden />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-destructive text-center py-10">{error}</p>
        ) : translators.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">{t('noRecommendations')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-3 gap-y-4">
            {translators.map((item) => (
              <TranslatorCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
