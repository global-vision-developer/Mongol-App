
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCity } from "@/contexts/CityContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { CITIES } from "@/lib/constants";
import type { City } from "@/types";
import { cn } from "@/lib/utils";

interface CitySelectionSheetProps {
  setIsSheetOpen: (open: boolean) => void;
}

export function CitySelectionSheet({ setIsSheetOpen }: CitySelectionSheetProps) {
  const { setSelectedCity, selectedCity: currentSelectedCity } = useCity();
  const { t, language } = useLanguage();

  const majorCities = CITIES.filter(city => city.isMajor);
  const otherCities = CITIES.filter(city => !city.isMajor && city.value !== 'all'); // Exclude 'all' from other cities

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setIsSheetOpen(false);
  };

  return (
    <SheetContent side="bottom" className="h-[70vh] p-0 flex flex-col rounded-t-lg">
      <SheetHeader className="p-4 pb-2 text-center relative">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted rounded-full" />
        <SheetTitle className="pt-4">{t('citySelectorPlaceholder')}</SheetTitle>
         <SheetClose className="absolute right-2 top-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            <span className="sr-only">Close</span>
        </SheetClose>
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
