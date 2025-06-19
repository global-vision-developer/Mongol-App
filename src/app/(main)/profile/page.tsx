
"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useRef } from 'react'; // Added useRef
import { UserCircle, Mail, LogOut, KeyRound, History, UserPlus, HelpCircle, Gift, ChevronRight, Phone, Edit3, Save, X, BadgeInfo, Camera, Loader2 } from 'lucide-react'; // Added Camera, Loader2
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from '@/types';
import { uploadProfileImage, FileUploadError } from '@/lib/storageService'; // Import upload service
import { cn } from '@/lib/utils';

const MAX_PROFILE_IMAGE_SIZE_MB = 2;
const MAX_PROFILE_IMAGE_SIZE_BYTES = MAX_PROFILE_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];


export default function ProfilePage() {
  const { user, loading, logout, updatePhoneNumber, updateProfilePicture } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const [isEditingPhoneNumber, setIsEditingPhoneNumber] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState(user?.phoneNumber || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
    if (user && !isEditingPhoneNumber) {
      setNewPhoneNumber(user.phoneNumber || "");
    }
  }, [user, loading, router, isEditingPhoneNumber]);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const handlePhoneNumberEditToggle = () => {
    if (isEditingPhoneNumber) {
      setNewPhoneNumber(user?.phoneNumber || ""); 
    }
    setIsEditingPhoneNumber(!isEditingPhoneNumber);
  };

  const handlePhoneNumberSave = async () => {
    if (!user) return;
    try {
      await updatePhoneNumber(newPhoneNumber);
      toast({ title: t('phoneNumberUpdateSuccess') });
      setIsEditingPhoneNumber(false);
    } catch (error) {
      toast({ title: t('phoneNumberUpdateError'), description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleAvatarClick = () => {
    if (!isUploadingImage) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(file.type)) {
      toast({ title: t('error'), description: t('invalidFileTypeProfile'), variant: "destructive" });
      if(fileInputRef.current) fileInputRef.current.value = ""; // Reset input
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      toast({ title: t('error'), description: t('fileTooLargeProfile', { maxSize: `${MAX_PROFILE_IMAGE_SIZE_MB}MB` }), variant: "destructive" });
      if(fileInputRef.current) fileInputRef.current.value = ""; // Reset input
      return;
    }

    setIsUploadingImage(true);
    try {
      const downloadURL = await uploadProfileImage(user.uid, file);
      await updateProfilePicture(downloadURL);
      toast({ title: t('profilePictureUpdateSuccess') });
    } catch (error) {
      let errorDesc = t('profilePictureUpdateError');
      if (error instanceof FileUploadError) {
        if (error.message === 'invalidFileType') errorDesc = t('invalidFileTypeProfile');
        else if (error.message === 'fileTooLarge') errorDesc = t('fileTooLargeProfile', { maxSize: `${MAX_PROFILE_IMAGE_SIZE_MB}MB` });
        else if (error.message === 'uploadFailed') errorDesc = t('uploadFailedError');
      }
      toast({ title: t('error'), description: errorDesc, variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
      if(fileInputRef.current) { 
        fileInputRef.current.value = "";
      }
    }
  };


  const profileCompletionPercentage = useMemo(() => {
    if (!user) return 0;
    const fields: (keyof UserProfile)[] = [
      'email', 
      'displayName', 
      'phoneNumber', 
      'lastName', 
      'firstName', 
      'dateOfBirth', 
      'gender', 
      'homeAddress'
    ];
    const filledFields = fields.filter(field => user[field] && user[field] !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  }, [user]);


  const menuItems = [
    {
      key: 'personalInfo',
      labelKey: 'personalInfo',
      icon: BadgeInfo,
      href: '/profile/personal-info',
    },
    {
      key: 'email',
      labelKey: 'email',
      icon: Mail,
      value: user?.email,
      href: undefined,
    },
    {
      key: 'phoneNumber',
      labelKey: 'phoneNumber',
      icon: Phone,
      value: isEditingPhoneNumber ? (
        <div className="flex items-center gap-2">
          <Input
            type="tel"
            value={newPhoneNumber}
            onChange={(e) => setNewPhoneNumber(e.target.value)}
            placeholder={t('enterPhoneNumberPlaceholder')}
            className="h-8 text-sm flex-grow"
            autoFocus
          />
          <Button size="icon" variant="ghost" onClick={handlePhoneNumberSave} className="h-8 w-8 text-green-600 hover:text-green-700">
            <Save className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handlePhoneNumberEditToggle} className="h-8 w-8 text-destructive hover:text-destructive/80">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        user?.phoneNumber || t('n_a')
      ),
      actionIcon: !isEditingPhoneNumber ? Edit3 : undefined,
      onActionClick: !isEditingPhoneNumber ? handlePhoneNumberEditToggle : undefined,
      href: undefined,
    },
    {
      key: 'changePassword',
      labelKey: 'changePassword',
      icon: KeyRound,
      href: '/profile/settings',
    },
    {
      key: 'purchaseHistory',
      labelKey: 'purchaseHistory',
      icon: History,
      href: '/orders',
    },
    {
      key: 'registerAsTranslator',
      labelKey: 'registerAsTranslator',
      icon: UserPlus,
      href: '/profile/register-translator',
    },
    {
      key: 'helpSupport',
      labelKey: 'helpSupport',
      icon: HelpCircle,
      href: '/profile/help-support',
    },
  ];

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 md:pt-6">
      
      <div className="flex flex-col items-center space-y-2 py-4">
        <div className="relative group">
          <Avatar 
            className={cn(
              "w-24 h-24 text-3xl border-2 border-primary cursor-pointer transition-opacity duration-300",
              isUploadingImage && "opacity-50"
            )}
            onClick={handleAvatarClick}
          >
            <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept={ALLOWED_PROFILE_IMAGE_TYPES.join(',')}
            style={{ display: 'none' }} 
            disabled={isUploadingImage}
          />
          {isUploadingImage ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          ) : (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              onClick={handleAvatarClick}
              role="button"
              aria-label={t('changeProfilePictureAria')}
              tabIndex={0}
              onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') handleAvatarClick();}}
            >
              <Camera className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
        <p className="text-lg font-medium text-foreground">{user.email}</p>
        <p className="text-sm text-muted-foreground">
          {t('personalInfoProgress', { percent: `${profileCompletionPercentage}%` })}
        </p>
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer" onClick={() => alert(t('totalPoints') + ' clicked (feature placeholder)')}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="h-7 w-7 text-primary" />
            <div>
              <p className="font-semibold">{t('totalPoints')}</p>
              <p className="text-xl font-bold text-primary">0</p>
            </div>
          </div>
          <ChevronRight className="h-6 w-6 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {menuItems.map((item) => (
              <li key={item.key}>
                <ConditionalLinkWrapper
                  href={item.href}
                  condition={!!item.href && !item.onActionClick && !isEditingPhoneNumber}
                  className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${(!item.href || item.onActionClick || (item.key === 'phoneNumber' && isEditingPhoneNumber) ) && 'cursor-default'}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{t(item.labelKey)}</span>
                  </div>
                  {typeof item.value === 'string' || typeof item.value === 'undefined' ? (
                    <span className="text-sm text-muted-foreground">{item.value}</span>
                  ) : (
                     item.value 
                  )}
                  {item.actionIcon && !isEditingPhoneNumber && (
                    <Button variant="ghost" size="icon" onClick={item.onActionClick} className="h-8 w-8">
                      <item.actionIcon className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                  {item.href && !item.actionIcon && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                </ConditionalLinkWrapper>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full mt-6 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={async () => {
          await logout();
          router.push('/auth/login');
        }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {t('logoutSystem')}
      </Button>
    </div>
  );
}

const ConditionalLinkWrapper: React.FC<{href?: string; condition: boolean; className?: string; children: React.ReactNode}> = ({ href, condition, className, children }) => {
  if (condition && href) {
    return <Link href={href} className={className}>{children}</Link>;
  }
  return <div className={className}>{children}</div>;
};

