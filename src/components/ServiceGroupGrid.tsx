
"use client";

import Link from 'next/link';
import { SERVICE_GROUPS } from '@/lib/constants';
import { useTranslation } from '@/hooks/useTranslation';

export function ServiceGroupGrid() {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-4 gap-x-2 gap-y-4 my-8">
      {SERVICE_GROUPS.map((service) => (
        <Link 
          href={service.href} 
          key={service.id} 
          className="group flex flex-col items-center text-center p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        >
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 transition-all duration-300 ease-in-out group-hover:scale-105">
            <service.icon className="h-8 w-8 text-accent-foreground" />
          </div>
          <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
            {t(service.titleKey)}
          </p>
        </Link>
      ))}
    </div>
  );
}
