
'use client';

// Энэ компонент нь Next.js-ийн Image компонентийг өргөтгөж,
// зураг ачаалагдаж дуустал skeleton loader болон shimmer эффект харуулах үүрэгтэй.

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

type ImageWithLoaderProps = ImageProps & {
  containerClassName?: string;
};

export function ImageWithLoader({
  className,
  containerClassName,
  onLoad,
  ...props
}: ImageWithLoaderProps) {
  // Зураг ачааллаж байгаа эсэхийг хянах төлөв
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn('relative h-full w-full overflow-hidden rounded-[inherit]', containerClassName)}>
      {/* Ачааллаж байх үед skeleton болон shimmer эффектийг харуулах */}
      {isLoading && (
        <Skeleton className="absolute inset-0 h-full w-full rounded-[inherit]" />
      )}
      {/* Бодит зургийг харуулах Next.js-ийн Image компонент */}
      <Image
        className={cn(
          'transition-opacity duration-300',
          // Ачааллаж байвал зургийг нууж, ачааллаж дууссан бол жигд харуулах (fade-in)
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={(e) => {
          // Зураг ачааллаж дуусахад isLoading төлвийг false болгох
          setIsLoading(false);
          if (onLoad) {
            onLoad(e);
          }
        }}
        {...props}
      />
    </div>
  );
}
