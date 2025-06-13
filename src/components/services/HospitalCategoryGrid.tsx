
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { HOSPITAL_CATEGORIES } from '@/lib/constants';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

export function HospitalCategoryGrid() {
  const { t } = useTranslation();

  return (
    <div className="mb-6">
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {HOSPITAL_CATEGORIES.map((category) => (
          <Link href={category.href} key={category.id} className="group">
            <Card className={cn(
              "shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 rounded-lg aspect-square flex flex-col items-center justify-center text-center p-2",
              category.isSpecial ? "bg-primary/10 hover:bg-primary/20" : "bg-card hover:bg-muted/50"
            )}>
              <CardContent className="flex flex-col items-center justify-center gap-2 p-0">
                {category.Icon ? (
                  <category.Icon className={cn("h-10 w-10 text-primary group-hover:text-accent transition-colors", category.isSpecial && "text-primary")} />
                ) : category.imageUrl && (
                  <Image
                    src={category.imageUrl}
                    alt={t(category.titleKey)}
                    width={60}
                    height={60}
                    className="rounded-full object-cover w-14 h-14 md:w-16 md:h-16 group-hover:scale-105 transition-transform"
                    data-ai-hint={category.dataAiHint}
                  />
                )}
                <p className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
                  {t(category.titleKey)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
