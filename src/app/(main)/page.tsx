
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function MainPageRedirect() {
  const router = useRouter();
  const { loading } = useAuth(); // Removed user, as we always redirect from (main)/ to /services
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading) {
      // Always redirect to /services from the base path "/" of the (main) layout
      // This simplifies the main landing area to be /services
      router.replace('/services');
    }
  }, [loading, router]);

  if (loading) {
    return <p className="text-center py-10">{t('loading')}...</p>;
  }

  // router.replace will handle the navigation. Returning null or a minimal loader is fine.
  return <p className="text-center py-10">{t('loading')}...</p>;
}

