
"use client";
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react'; // Added Circle

interface PasswordRequirementItemProps {
  textKey?: string;
  textValue?: string; 
  met: boolean;
  customText?: string;
}

function PasswordRequirementItem({ textKey, textValue, met, customText }: PasswordRequirementItemProps) {
  const { t } = useTranslation();
  let displayText = customText;
  if (!displayText && textKey) {
    displayText = textValue ? t(textKey, { value: textValue }) : t(textKey);
  }

  return (
    <div className="flex items-center gap-2">
      {met ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground/70" />}
      <span className="text-xs">{displayText}</span>
    </div>
  );
}

export default function ProfileSettingsPage() {
  const { t } = useTranslation();
  const { user, updateUserPassword, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Password validation states
  const [lengthMet, setLengthMet] = useState(false);
  const [complexityMet, setComplexityMet] = useState(false); // General complexity check if needed
  const [uppercaseMet, setUppercaseMet] = useState(false);
  const [lowercaseMet, setLowercaseMet] = useState(false);
  const [numberMet, setNumberMet] = useState(false);
  const [specialCharMet, setSpecialCharMet] = useState(false);
  const [matchMet, setMatchMet] = useState(false);

  const allowedSpecialChars = "!#$%&()*+,-./:;<=>?@[]^_{|}~"; // Added |
  const specialCharRegex = new RegExp(`[${allowedSpecialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);


  useEffect(() => {
    setLengthMet(newPassword.length >= 8 && newPassword.length <= 50);
    setUppercaseMet(/[A-Z]/.test(newPassword));
    setLowercaseMet(/[a-z]/.test(newPassword));
    setNumberMet(/\d/.test(newPassword));
    setSpecialCharMet(specialCharRegex.test(newPassword));
    setComplexityMet(
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /\d/.test(newPassword) &&
      specialCharRegex.test(newPassword)
    );
    setMatchMet(newPassword !== "" && newPassword === confirmNewPassword);
  }, [newPassword, confirmNewPassword, specialCharRegex]);

  const validatePassword = (): boolean => {
    if (newPassword.length < 8 || newPassword.length > 50) {
       toast({ title: t('error'), description: t('passwordReqLengthError'), variant: "destructive" });
      return false;
    }
    if (!/[A-Z]/.test(newPassword)) {
      toast({ title: t('error'), description: t('passwordReqUppercaseError'), variant: "destructive" });
      return false;
    }
    if (!/[a-z]/.test(newPassword)) {
      toast({ title: t('error'), description: t('passwordReqLowercaseError'), variant: "destructive" });
      return false;
    }
    if (!/\d/.test(newPassword)) {
      toast({ title: t('error'), description: t('passwordReqNumberError'), variant: "destructive" });
      return false;
    }
    if (!specialCharRegex.test(newPassword)) {
      toast({ title: t('error'), description: t('passwordReqSpecialCharError'), variant: "destructive" });
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: t('error'), description: t('passwordsDoNotMatchError'), variant: "destructive" });
      return false;
    }
    return true;
  };


  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updateUserPassword(currentPassword, newPassword);
      toast({ title: t('passwordUpdateSuccess') });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      router.push('/profile'); // Navigate back to profile on success
    } catch (error: any) {
      let errorMessage = t('genericPasswordError');
      if (error.code === 'auth/wrong-password') {
        errorMessage = t('reauthFailedError');
      } else if (error.code === 'auth/weak-password') {
        errorMessage = t('passwordTooWeakError');
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = t('passwordRequiresRecentLogin');
      } else if (error.message) {
        errorMessage = t('genericPasswordError'); 
        console.error("Password update error:", error.message);
      }
      toast({
        title: t('passwordUpdateError'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  
  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto pb-10">
      <div className="flex items-center sticky top-0 z-10 bg-background py-3 md:relative md:py-0 -mx-4 px-4 md:mx-0 md:px-0 border-b md:border-none mb-2 md:mb-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2"> {/* Always show back button */}
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">{t('back')}</span>
          </Button>
          <h1 className="text-xl font-headline font-semibold text-center flex-grow">
            {t('changePasswordPageTitle')}
          </h1>
          <div className="w-10" /> {/* Spacer for centering title */}
      </div>
      
      <form onSubmit={handlePasswordUpdate} className="space-y-4 px-4 md:px-0">
        <div className="space-y-1">
          <Label htmlFor="current-password">{t('currentPasswordLabel')}</Label>
          <Input 
            id="current-password" 
            type="password" 
            className="mt-1" 
            placeholder={t('currentPasswordPlaceholder')}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isUpdatingPassword || authLoading}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-password">{t('newPasswordLabel')}</Label>
          <Input 
            id="new-password" 
            type="password" 
            className="mt-1" 
            placeholder={t('newPasswordPlaceholder')}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isUpdatingPassword || authLoading}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirm-new-password">{t('confirmNewPasswordLabel')}</Label> 
          <Input 
            id="confirm-new-password" 
            type="password" 
            className="mt-1" 
            placeholder={t('confirmNewPasswordPlaceholder')}
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            disabled={isUpdatingPassword || authLoading}
            required
          />
        </div>

        <div className="space-y-1.5 text-muted-foreground pt-2">
          <PasswordRequirementItem met={lengthMet} customText={t('passwordReqLength_8_50')} />
          <PasswordRequirementItem met={complexityMet} customText={t('passwordReqComplexity')} />
          <PasswordRequirementItem met={specialCharMet} customText={t('passwordReqSpecialCharsDetail', {chars: allowedSpecialChars})} />
          <PasswordRequirementItem met={uppercaseMet} customText={t('passwordReqUppercase')} />
          <PasswordRequirementItem met={lowercaseMet} customText={t('passwordReqLowercase')} />
          <PasswordRequirementItem met={matchMet} customText={t('passwordReqMatch')} />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 text-base h-12 mt-6" 
          disabled={isUpdatingPassword || authLoading}
        >
          {isUpdatingPassword || authLoading ? t('loading') : t('continueButton')}
        </Button>
      </form>
    </div>
  );
}
