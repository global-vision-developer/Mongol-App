
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useTranslation } from '@/hooks/useTranslation';
import type { EmbassyCategoryItem } from '@/types';
import { cn } from '@/lib/utils';

interface EmbassyCategoryCardProps {
  category: EmbassyCategoryItem;
  className?: string;
}

export function EmbassyCategoryCard({ category, className }: EmbassyCategoryCardProps) {
  const { t } = useTranslation();

  return (
    <Link href={category.href} className={cn("group", className)}>
      <Card className="shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 rounded-lg overflow-hidden flex flex-col items-center justify-center text-center p-3 aspect-[3/2]">
        <CardContent className="flex flex-col items-center justify-center gap-2 p-0">
          <Image
            src={category.imageUrl}
            alt={t(category.titleKey)}
            width={80}
            height={50}
            className="object-contain h-12 group-hover:scale-105 transition-transform"
            data-ai-hint={category.dataAiHint}
          />
          <p className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-tight mt-1">
            {t(category.titleKey)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
