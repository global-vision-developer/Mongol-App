"use client"; // This layout must be a client component to use context providers

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CityProvider } from "@/contexts/CityContext";
import type React from "react";
import AppInit from "@/components/AppInit"; // Import the AppInit component

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <CityProvider>
        <AppInit /> {/* Add AppInit here to run on main app part load */}
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 container pt-4 pb-24 md:pb-6"> {/* Reduced py-6 to pt-4 */}
            {children}
          </main>
          <BottomNav />
        </div>
      </CityProvider>
    </LanguageProvider>
  );
}
