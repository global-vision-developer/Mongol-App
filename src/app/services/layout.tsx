
"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { CityProvider } from "@/contexts/CityContext";
import { SearchProvider } from "@/contexts/SearchContext";
import React, { useEffect, useRef } from "react";
import AppInit from "@/components/AppInit";
import { cn } from "@/lib/utils";

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  // This effect re-triggers the CSS animation on page navigation
  // by removing and re-adding the animation class.
  useEffect(() => {
    const mainEl = mainRef.current;
    if (mainEl) {
      mainEl.classList.remove('animate-page-slide-in-right');
      void mainEl.offsetWidth; // Trigger a reflow
      mainEl.classList.add('animate-page-slide-in-right');
    }
  }, [pathname]);

  return (
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
  );
}
