"use client"; // This layout must be a client component to use context providers

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CityProvider } from "@/contexts/CityContext";
import { SearchProvider } from "@/contexts/SearchContext";
import React from "react"; 
import AppInit from "@/components/AppInit";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <CityProvider>
        <SearchProvider>
          <AppInit />
          <div className="flex min-h-screen flex-col" style={{ overflowX: 'hidden' }}>
            <Header />
            <main 
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
