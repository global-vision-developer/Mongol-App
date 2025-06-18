
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
import { SearchBar } from '@/components/SearchBar'; // Import SearchBar
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

export function Header() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
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
            {/* Keep LanguageSwitcher and UserMenu on the right */}
            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              {isMounted && (
                loading ? (
                  <Skeleton className="h-8 w-8 rounded-full bg-muted" />
                ) : user ? (
                  <UserMenu user={user} />
                ) : (
                  null // Don't render login button here, handled by auth routes
                )
              )}
            </div>
          </>
        ) : (
          <>
            {/* Left: CitySelector */}
            <div className="flex items-center">
              <CitySelector />
            </div>

            {/* Center: App Name */}
            <Link
              href="/services"
              className="flex items-center" // Removed absolute positioning
              aria-label="Home page"
            >
              <span className="font-headline text-xl font-semibold text-primary">Mongol</span>
            </Link>

            {/* Right: Search Icon, Language Switcher, User Menu */}
            <div className="flex items-center gap-1"> {/* Removed ml-auto */}
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
                  null // Don't render login button here, handled by auth routes
                )
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
