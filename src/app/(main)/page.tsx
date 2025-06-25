'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * This page is a workaround for a Next.js build issue on Vercel.
 * Because a `page.tsx` file exists at the root (`src/app/page.tsx`),
 * having another one inside a route group (`src/app/(main)/page.tsx`)
 * that also maps to the root path can cause build conflicts.
 * 
 * This component's only job is to immediately redirect any traffic
 * that might land here to the actual home page (`/services`), ensuring
 * a smooth user experience and a successful Vercel deployment.
 */
export default function MainPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/services');
  }, [router]);

  // Render a minimal loading state while the redirect happens instantly.
  // This avoids a blank screen and is visually insignificant.
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}
