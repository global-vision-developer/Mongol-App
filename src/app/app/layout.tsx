
"use client";

import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { CityProvider } from "@/contexts/CityContext";
import { SearchProvider } from "@/contexts/SearchContext";
import React, { useEffect, useRef } from "react";
import AppInit from "@/components/AppInit";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

// /app/** хавтас доторх бүх хуудсанд хамаарах хамгаалалттай хэсэг.
// Энэ компонент нь хэрэглэгч нэвтэрсэн эсэхийг шалгаж, шаардлагатай бол ачааллах (loading) дэлгэц харуулна.
const ProtectedAppView = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  // Хэрэглэгчийн нэвтрэлтийн төлвийг шалгах useEffect.
  // Хэрэв ачааллаж дууссан (loading=false) ба хэрэглэгч нэвтрээгүй (user=null) бол
  // /auth/login хуудас руу шилжүүлнэ.
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

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

  // Хэрэв хэрэглэгчийн мэдээлэл ачааллагдаж байгаа эсвэл хэрэглэгч нэвтрээгүй бол
  // эргэлдэх ачааллах дүрс харуулна.
  if (loading || !user) {
    return (
       <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Хэрэглэгч нэвтэрсэн бол үндсэн апп-ын бүтцийг харуулна.
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


// Энэ бол апп-ын хамгаалалттай хэсгийн үндсэн layout.
// Энэ нь шаардлагатай Context Provider-уудыг тохируулж, хуудасны хамгаалалтыг хариуцдаг.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <CityProvider>
        <SearchProvider>
          <AppInit />
          <ProtectedAppView>{children}</ProtectedAppView>
        </SearchProvider>
      </CityProvider>
  );
}
