
"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSearch } from "@/contexts/SearchContext"; // Import useSearch
import { useEffect } from "react";

export function SearchBar() {
  const { t } = useTranslation();
  const { searchTerm, setSearchTerm } = useSearch(); // Use search context

  // If the component unmounts (e.g. search UI is closed),
  // we don't necessarily want to clear the global searchTerm here,
  // as another SearchBar instance (e.g. on another page) might rely on it.
  // Clearing is handled in Header.tsx when search UI is explicitly closed.

  return (
    <div className="relative w-full">
      <Input
        type="search"
        placeholder={t('searchPlaceholder')}
        className="pl-10 pr-4 py-3 text-base rounded-lg shadow-sm focus:shadow-md transition-shadow h-12"
        value={searchTerm} // Controlled component
        onChange={(e) => setSearchTerm(e.target.value)} // Update context
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
    </div>
  );
}
