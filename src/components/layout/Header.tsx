
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
      <div className={`container flex h-16 items-center ${isSearchOpen ? '' : 'justify-between'}`}>
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
          // Layout for non-search state to ensure title centering
          <div className="flex w-full items-center">
            {/* Left Slot (for CitySelector trigger) */}
            <div className="flex-none w-auto min-w-[80px] flex justify-start">
              <CitySelector />
            </div>

            {/* Centered Title (takes remaining space and centers content) */}
            <div className="flex-grow text-center">
              <Link href="/services" className="inline-flex items-center" aria-label="Home page">
                <span className="font-headline text-xl font-semibold text-primary">Mongol</span>
              </Link>
            </div>

            {/* Right Slot (Search, Language, UserMenu) */}
            <div className="flex-none w-auto min-w-[calc(theme(spacing.8)_*_2_+_theme(spacing.1)_*_1_+_theme(spacing.8))] flex justify-end items-center gap-1"> {/* Adjusted min-width based on 2 icon buttons + user menu */}
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
