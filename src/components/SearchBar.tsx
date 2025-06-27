
"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSearch } from "@/contexts/SearchContext"; // Хайлтын context-г импортлох
import { useEffect } from "react";

// Хайлтын талбарыг харуулах компонент
export function SearchBar() {
  const { t } = useTranslation();
  const { searchTerm, setSearchTerm } = useSearch(); // Хайлтын context-оос төлөв болон функц авах

  return (
    <div className="relative w-full">
      <Input
        type="search"
        placeholder={t('searchPlaceholder')}
        className="pl-10 pr-4 py-3 text-base rounded-lg shadow-sm focus:shadow-md transition-shadow h-12"
        value={searchTerm} // Controlled component болгох
        onChange={(e) => setSearchTerm(e.target.value)} // Утга өөрчлөгдөхөд context-г шинэчлэх
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
    </div>
  );
}
