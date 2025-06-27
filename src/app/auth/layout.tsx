
import type React from "react";
import Link from "next/link";
import { Package2 } from "lucide-react";

// Энэ бол /auth зам доорх бүх хуудсуудад (Нэвтрэх, Бүртгүүлэх) хамаарах layout.
// Гол зорилго нь эдгээр хуудсуудад зориулсан тусдаа, голлуулсан, логотой загварыг үүсгэх юм.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
       {/* Апп-ын лого */}
       <Link href="/" className="mb-8 flex items-center gap-2 text-primary hover:text-primary/90">
          <Package2 className="h-8 w-8" />
          <span className="font-headline text-2xl font-semibold">Mongol</span>
        </Link>
      {/* Нэвтрэх эсвэл бүртгүүлэх формыг энд харуулна */}
      {children}
    </div>
  );
}
