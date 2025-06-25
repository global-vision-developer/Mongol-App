
"use client";

import { RegisterTranslatorForm } from "@/components/auth/RegisterTranslatorForm";
import { useTranslation } from "@/hooks/useTranslation";
import { ProtectedPage } from "@/components/auth/ProtectedPage";

function RegisterTranslatorContent() {
  const { t } = useTranslation(); 

  return (
      <div className="w-full max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-headline font-semibold mb-6 text-center">
          {t('registerAsTranslatorPageTitle')}
        </h1>
        <RegisterTranslatorForm />
      </div>
  );
}

export default function RegisterTranslatorPage() {
    return (
        <ProtectedPage>
            <RegisterTranslatorContent />
        </ProtectedPage>
    )
}