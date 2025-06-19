
"use client";

import React from "react"; 
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCity } from "@/contexts/CityContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { City } from "@/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

interface CitySelectionSheetProps {
  setIsSheetOpen: (open: boolean) => void;
}

export function CitySelectionSheet({ setIsSheetOpen }: CitySelectionSheetProps) {
  const { setSelectedCity, selectedCity: currentSelectedCity, availableCities, loadingCities } = useCity();
  const { t, language } = useLanguage();

  const majorCities = availableCities.filter(city => city.cityType === 'major' || city.cityType === 'all');
  const otherCities = availableCities.filter(city => city.cityType === 'other');

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setIsSheetOpen(false);
  };
  
  if (loadingCities) {
    return (
      <SheetContent side="bottom" className="h-[70vh] p-0 flex flex-col rounded-t-lg">
        <SheetHeader className="p-4 pb-2 text-center relative">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted rounded-full" />
          <SheetTitle className="pt-4">{t('citySelectorPlaceholder')}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="p-4 pt-2 space-y-6">
            <div>
              <Skeleton className="h-6 w-1/3 mb-3 rounded" />
              <div className="grid grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => <Skeleton key={`major-skel-${i}`} className="h-10 w-full rounded" />)}
              </div>
            </div>
            <div>
              <Skeleton className="h-6 w-1/3 mb-3 mt-6 rounded" />
              <div className="space-y-1">
                {[...Array(4)].map((_, i) => <Skeleton key={`other-skel-${i}`} className="h-10 w-full rounded mb-1" />)}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    );
  }


  return (
    <SheetContent side="bottom" className="h-[70vh] p-0 flex flex-col rounded-t-lg">
      <SheetHeader className="p-4 pb-2 text-center relative">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted rounded-full" />
        <SheetTitle className="pt-4">{t('citySelectorPlaceholder')}</SheetTitle>
         {/* SheetClose removed from here as SheetContent handles its own close button */}
      </SheetHeader>
      
      <ScrollArea className="flex-1">
        <div className="p-4 pt-2 space-y-6">
          <div>
            <h3 className="text-md font-semibold mb-3 text-foreground px-1">{t('majorCitiesTitle', undefined, 'Том хотууд')}</h3>
            <div className="grid grid-cols-3 gap-3">
              {majorCities.map((city) => (
                <Button
                  key={city.value}
                  variant={currentSelectedCity?.value === city.value ? "default" : "outline"}
                  className={cn(
                    "w-full h-auto py-2.5 text-sm leading-tight justify-center",
                    currentSelectedCity?.value === city.value && "border-primary ring-2 ring-primary"
                  )}
                  onClick={() => handleCitySelect(city)}
                >
                  {language === 'cn' && city.label_cn ? city.label_cn : city.label}
                </Button>
              ))}
            </div>
          </div>

          {otherCities.length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-3 text-foreground px-1">{t('otherCitiesTitle', undefined, 'Бусад хотууд')}</h3>
              <div className="space-y-1">
                {otherCities.map((city, index) => (
                  <React.Fragment key={city.value}>
                    <button
                      className={cn(
                        "w-full text-left px-3 py-3 text-sm rounded-md hover:bg-muted transition-colors",
                        currentSelectedCity?.value === city.value && "bg-primary/10 text-primary font-medium"
                      )}
                      onClick={() => handleCitySelect(city)}
                    >
                      {language === 'cn' && city.label_cn ? city.label_cn : city.label}
                    </button>
                    {index < otherCities.length - 1 && <Separator className="my-0" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </SheetContent>
  );
}
