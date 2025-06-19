
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from '@/hooks/useTranslation';
import type { WeChatCategoryItem } from '@/types';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface WeChatCategoryCardProps {
  category: WeChatCategoryItem;
}

export function WeChatCategoryCard({ category }: WeChatCategoryCardProps) {
  const { t } = useTranslation();
  const IconComponent = category.iconType === 'lucide' ? (LucideIcons[category.iconNameOrUrl as keyof typeof LucideIcons] as LucideIcons.LucideIcon) : null;

  return (
    <Link href={category.href} className="group flex flex-col items-center">
      <Card className="shadow-md hover:shadow-lg transition-all duration-300 ease-out transform hover:-translate-y-1.5 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-0 overflow-hidden mb-2">
        <CardContent className="p-0 flex items-center justify-center w-full h-full">
          {category.iconType === 'image' && (
            <Image
              src={category.iconNameOrUrl}
              alt={t(category.titleKey)}
              width={80}
              height={80}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ease-out"
            />
          )}
          {IconComponent && (
            <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-primary group-hover:text-accent transition-colors duration-300 ease-out" />
          )}
        </CardContent>
      </Card>
      <p className="text-xs sm:text-sm font-medium text-center text-foreground group-hover:text-primary transition-colors leading-tight">
        {t(category.titleKey)}
      </p>
    </Link>
  );
}
