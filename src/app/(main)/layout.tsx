"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { CityProvider } from "@/contexts/CityContext";
import { SearchProvider } from "@/contexts/SearchContext";
import React, { useEffect, useRef } from "react";
import AppInit from "@/components/AppInit";
import { cn } from "@/lib/utils";


// This part of the component contains the view logic that depends on the pathname.
// By isolating it, we prevent the providers above from re-mounting on navigation.
const MainView = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  // This effect re-triggers the CSS animation on page navigation
  // by removing and re-adding the animation class.
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
  );
};


// This is the main export for the layout. It sets up the context providers
// that should persist across navigation within the (main) route group.
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <CityProvider>
        <SearchProvider>
          <AppInit />
          <MainView>{children}</MainView>
        </SearchProvider>
      </CityProvider>
  );
}
