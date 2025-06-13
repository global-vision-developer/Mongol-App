"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCity } from "@/contexts/CityContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function CitySelector() {
  const { selectedCity, setSelectedCity, availableCities } = useCity();
  const { language, t } = useLanguage();

  const handleCityChange = (value: string) => {
    const city = availableCities.find(c => c.value === value);
    if (city) {
      setSelectedCity(city);
    }
  };

  return (
    <Select value={selectedCity?.value} onValueChange={handleCityChange}>
      <SelectTrigger
        className={cn("w-auto min-w-[80px] text-sm font-medium h-9 px-2")}
        aria-label={t('citySelectorAriaLabel')}
      >
        <MapPin className="mr-1.5 h-4 w-4 text-muted-foreground" />
        <SelectValue placeholder={t('citySelectorPlaceholder')} />
      </SelectTrigger>
      <SelectContent>
        {availableCities.map((city) => (
          <SelectItem key={city.value} value={city.value}>
            {language === 'cn' && city.label_cn ? city.label_cn : city.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
