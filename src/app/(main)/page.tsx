
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page component now correctly redirects to /services 
// from within the (main) layout group, preventing route conflicts.
export default function MainPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/services');
  }, [router]);

  // Return a minimal loading state to avoid flashes of content.
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
    </div>
  );
}
