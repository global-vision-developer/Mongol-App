
"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useCity } from "@/contexts/CityContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { CitySelectionSheet } from "./CitySelectionSheet";
import { useState } from "react";

export function CitySelector() {
  const { selectedCity } = useCity();
  const { language, t } = useLanguage();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const displayLabel = selectedCity 
    ? (language === 'cn' && selectedCity.label_cn ? selectedCity.label_cn : selectedCity.label)
    : t('citySelectorPlaceholder');

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center text-sm font-medium h-9 px-2 py-1.5", // Adjusted to match header button style
            !selectedCity && "text-muted-foreground"
          )}
          aria-label={t('citySelectorAriaLabel')}
        >
          <MapPin className="mr-1.5 h-4 w-4 text-muted-foreground" />
          <span className="truncate max-w-[80px] sm:max-w-[120px]">{displayLabel}</span>
        </Button>
      </SheetTrigger>
      <CitySelectionSheet setIsSheetOpen={setIsSheetOpen} />
    </Sheet>
  );
}
