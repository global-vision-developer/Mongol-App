
"use client";

import { PersonalInfoForm } from '@/components/profile/PersonalInfoForm';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PersonalInfoPage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center sticky top-0 z-10 bg-background py-3 md:relative md:py-0 -mx-4 px-4 md:mx-0 md:px-0 border-b md:border-none mb-2 md:mb-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="md:hidden mr-2">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">{t('back')}</span>
          </Button>
          <h1 className="text-xl font-headline font-semibold text-center flex-grow md:text-3xl">
            {t('personalInfoFormTitle')}
          </h1>
          <div className="w-10 md:hidden" /> {/* Spacer for centering title on mobile */}
        </div>
        <PersonalInfoForm />
      </div>
  );
}
