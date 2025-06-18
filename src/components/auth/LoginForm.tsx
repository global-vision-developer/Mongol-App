
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import type { FirebaseError } from "firebase/app";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast({ title: t("login"), description: t("welcome") }); // Use t() for title too
      router.push("/services"); 
    } catch (error) {
      let errorMessage = t("authErrorGenericLogin");
      const firebaseError = error as FirebaseError;
      switch (firebaseError.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found": // Legacy, but good to keep
        case "auth/wrong-password": // Legacy
          errorMessage = t("authErrorInvalidCredential");
          break;
        case "auth/invalid-email":
          errorMessage = t("authErrorInvalidEmail");
          break;
        case "auth/too-many-requests":
          errorMessage = t("authErrorTooManyRequests");
          break;
        default:
          // Keep the generic message if no specific code matches
          break;
      }
      toast({
        title: t("loginFailed"), // Translate title
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">{t('login')}</CardTitle>
        <CardDescription>{t('enterCredentialsLogin')}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('loading') : t('login')}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t('dontHaveAccount')}{" "}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              {t('register')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
