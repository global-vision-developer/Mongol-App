
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

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { register, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: t("error"),
        description: t("passwordsDoNotMatch"),
        variant: "destructive",
      });
      return;
    }

    try {
      await register(email, password, displayName);
      toast({
        title: t("registrationSuccess"),
        description: t("welcome"),
      });
      router.push("/services"); // Changed redirect to /services
    } catch (error: any) {
      toast({
        title: t("registrationFailed"),
        description: error?.message || t("registrationError"),
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">{t("register")}</CardTitle>
        <CardDescription>{t("createYourAccount")}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">{t("displayName")}</Label>
            <Input
              id="displayName"
              type="text"
              placeholder={t("yourName")}
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
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
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("loading") : t("register")}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t("alreadyHaveAccount")}{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              {t("login")}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
