"use client"; // This layout must be a client component to use context providers

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CityProvider } from "@/contexts/CityContext";
import { SearchProvider } from "@/contexts/SearchContext";
import React, { useState, useEffect, useRef } from "react"; // Import useState, useEffect, useRef
import { usePathname } from 'next/navigation'; // Import usePathname
import AppInit from "@/components/AppInit";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [animationClass, setAnimationClass] = useState('');
  const isInitialRender = useRef(true);

  useEffect(() => {
    // Don't animate on the initial page load
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // Set animation class to trigger the slide-in
    setAnimationClass('animate-page-slide-in-right');

    // After the animation duration, remove the class so it can be re-triggered on next navigation
    const timer = setTimeout(() => {
      setAnimationClass('');
    }, 350); // This duration must match your CSS animation duration

    return () => clearTimeout(timer);
  }, [pathname]); // Re-run this effect every time the path changes

  return (
    <LanguageProvider>
      <CityProvider>
        <SearchProvider>
          <AppInit />
          <div className="flex min-h-screen flex-col" style={{ overflowX: 'hidden' }}>
            <Header />
            <main 
              className={cn(
                "flex-1 container pt-2 pb-24 md:pb-6",
                animationClass // Apply the animation class dynamically
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
