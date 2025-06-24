'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component is for the '/' route within the (main) layout.
// Its primary purpose is to redirect to the actual main page, '/services',
// for any user who lands here. This avoids showing a blank page at the root
// of the authenticated section and resolves a build conflict on Vercel.
export default function MainPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/services');
  }, [router]);

  // Render a loading state while redirecting
  return (
    <div className="flex h-screen items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}
