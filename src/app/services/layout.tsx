
"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { CityProvider } from "@/contexts/CityContext";
import { SearchProvider } from "@/contexts/SearchContext";
import React, { useEffect, useRef } from "react";
import AppInit from "@/components/AppInit";
import { cn } from "@/lib/utils";

// Энэ бол /services зам доорх бүх нийтийн хуудсуудад хамаарах layout.
// Энэ нь хэрэглэгч нэвтэрсэн эсэхээс үл хамааран харагдах UI-г тодорхойлно.
export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  // Энэ эффект нь хуудас солигдох бүрд CSS анимацийг дахин эхлүүлэх үүрэгтэй.
  // Ингэснээр хуудас солигдох бүрд слайд-анимаци ажиллана.
  useEffect(() => {
    const mainEl = mainRef.current;
    if (mainEl) {
      mainEl.classList.remove('animate-page-slide-in-right');
      void mainEl.offsetWidth; // DOM-г дахин уншиж, reflow хийх трик
      mainEl.classList.add('animate-page-slide-in-right');
    }
  }, [pathname]);

  return (
    // Шаардлагатай Context Provider-уудыг тохируулах.
    // Эдгээр context-үүд нь зөвхөн /services доторх хуудсуудад хамааралтай.
    <CityProvider>
      <SearchProvider>
        {/* Firebase Cloud Messaging-г эхлүүлэх компонент */}
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
