
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CitySelector } from '@/components/CitySelector';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { UserMenu } from '@/components/auth/UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useEffect, useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearch } from '@/contexts/SearchContext';

export function Header() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { setSearchTerm } = useSearch();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchTerm(""); 
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {isSearchOpen ? (
          <>
            <Button variant="ghost" size="icon" onClick={handleCloseSearch} aria-label={t('back')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-grow mx-2">
              <SearchBar />
            </div>
            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              {isMounted && (
                loading ? (
                  <Skeleton className="h-8 w-8 rounded-full bg-muted" />
                ) : user ? (
                  <UserMenu user={user} />
                ) : (
                  null
                )
              )}
            </div>
          </>
        ) : (
          <div className="relative flex w-full items-center justify-between h-full">
            {/* Left items */}
            <div className="flex items-center">
              <CitySelector />
            </div>

            {/* Absolute centered title */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Link href="/app/services" className="inline-flex items-center" aria-label="Home page">
                <span className="font-headline text-xl font-semibold text-primary">Mongol</span>
              </Link>
            </div>

            {/* Right items */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleSearchClick} aria-label={t('search')}>
                <Search className="h-5 w-5" />
              </Button>
              <LanguageSwitcher />
              {isMounted && (
                loading ? (
                  <Skeleton className="h-8 w-8 rounded-full bg-muted" />
                ) : user ? (
                  <UserMenu user={user} />
                ) : (
                  null // Or login button if needed
                )
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
