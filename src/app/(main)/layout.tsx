"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CityProvider } from "@/contexts/CityContext";
import { SearchProvider } from "@/contexts/SearchContext";
import React, { useEffect, useRef } from "react";
import AppInit from "@/components/AppInit";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  // This effect re-triggers the CSS animation on page navigation
  // by removing and re-adding the animation class.
  // This avoids state-based re-renders and hydration errors.
  useEffect(() => {
    const mainEl = mainRef.current;
    if (mainEl) {
      mainEl.classList.remove('animate-page-slide-in-right');
      // Trigger a reflow to ensure the class removal is processed
      void mainEl.offsetWidth;
      mainEl.classList.add('animate-page-slide-in-right');
    }
  }, [pathname]);

  return (
    <LanguageProvider>
      <CityProvider>
        <SearchProvider>
          <AppInit />
          <div className="flex min-h-screen flex-col" style={{ overflowX: 'hidden' }}>
            <Header />
            <main
              ref={mainRef}
              className={cn(
                "flex-1 container pt-2 pb-24 md:pb-6"
              )}
            >
              {children}
            </main>
            <BottomNav />
          </div>
        </SearchProvider>
      </CityProvider>
    </LanguageProvider>
  );
}
