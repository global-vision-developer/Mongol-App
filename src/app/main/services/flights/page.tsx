
"use client";

import { FlightSearchForm } from "@/components/services/FlightSearchForm";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FlightsPage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background py-3 md:relative md:py-0">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="md:hidden">
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">{t('back')}</span>
        </Button>
        <h1 className="text-xl font-headline font-semibold text-center flex-grow text-primary md:text-3xl">
          {t('flightsPageTitle')}
        </h1>
        <div className="w-10 md:hidden" /> {/* Spacer for centering title on mobile */}
      </div>
      <FlightSearchForm />
    </div>
  );
}
