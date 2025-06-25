'use client';

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
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn('relative h-full w-full overflow-hidden rounded-[inherit]', containerClassName)}>
      {isLoading && (
        <Skeleton className="absolute inset-0 h-full w-full rounded-[inherit]" />
      )}
      <Image
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={(e) => {
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
