import { RegisterForm } from "@/components/auth/RegisterForm";
import { LanguageProvider } from "@/contexts/LanguageContext"; // Required for t() in RegisterForm

export default function RegisterPage() {
  return (
    <LanguageProvider> {/* RegisterForm uses useTranslation, needs provider */}
        <RegisterForm />
    </LanguageProvider>
  );
}
