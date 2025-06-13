
"use client"; // This layout must be a client component to use context providers

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CityProvider } from "@/contexts/CityContext";
import type React from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <CityProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 container py-6 pb-24 md:pb-6"> {/* Add padding-bottom for bottom nav */}
            {children}
          </main>
          <BottomNav />
        </div>
      </CityProvider>
    </LanguageProvider>
  );
}
