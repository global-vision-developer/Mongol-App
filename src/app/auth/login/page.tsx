import { LoginForm } from "@/components/auth/LoginForm";
import { LanguageProvider } from "@/contexts/LanguageContext"; // Required for t() in LoginForm

export default function LoginPage() {
  return (
    <LanguageProvider> {/* LoginForm uses useTranslation, needs provider */}
        <LoginForm />
    </LanguageProvider>
  );
}
