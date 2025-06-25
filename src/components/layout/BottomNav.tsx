
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Heart, Bell, UserCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: "/services", labelKey: "home", Icon: Home, protected: false },
  { href: "/main/orders", labelKey: "orders", Icon: ShoppingBag, protected: true },
  { href: "/main/saved", labelKey: "saved", Icon: Heart, protected: true },
  { href: "/main/notifications", labelKey: "notifications", Icon: Bell, protected: true },
  { href: "/main/profile", labelKey: "user", Icon: UserCircle, protected: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isProtected: boolean) => {
    if (isProtected && !user) {
      e.preventDefault();
      router.push('/auth/login');
    }
  };


  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container mx-auto flex h-16 max-w-md items-center justify-around">
        {navItems.map(({ href, labelKey, Icon, protected: isProtected }) => {
          const isActive = pathname.startsWith(href);
          
          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => handleNavigation(e, href, isProtected)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-md transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
