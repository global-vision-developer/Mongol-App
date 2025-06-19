
"use client"; // This layout must be a client component to use context providers

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CityProvider } from "@/contexts/CityContext";
import { SearchProvider } from "@/contexts/SearchContext";
import type React from "react";
import AppInit from "@/components/AppInit";
import { usePathname } from 'next/navigation'; // Import usePathname
import { cn } from "@/lib/utils"; // Import cn if you use it

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Get current pathname

  return (
    <LanguageProvider>
      <CityProvider>
        <SearchProvider>
          <AppInit />
          <div className="flex min-h-screen flex-col" style={{ overflowX: 'hidden' }}> {/* Added overflow-x: hidden */}
            <Header />
            <main 
              key={pathname} /* Add key to re-trigger animation on route change */
              className={cn(
                "flex-1 container pt-2 pb-24 md:pb-6",
                "animate-page-slide-in-right" /* Apply animation class */
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
