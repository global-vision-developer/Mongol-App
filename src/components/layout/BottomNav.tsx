
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Heart, Bell, UserCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: "/services", labelKey: "home", Icon: Home },
  { href: "/orders", labelKey: "orders", Icon: ShoppingBag },
  { href: "/saved", labelKey: "saved", Icon: Heart },
  { href: "/notifications", labelKey: "notifications", Icon: Bell },
  { href: "/profile", labelKey: "user", Icon: UserCircle },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container mx-auto flex h-16 max-w-md items-center justify-around">
        {navItems.map(({ href, labelKey, Icon }) => {
          // Check if the current path starts with the nav item's href
          // This handles nested routes correctly (e.g., /profile/settings is active for /profile)
          const isActive = pathname.startsWith(href);
          
          return (
            <Link
              key={href}
              href={href}
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
