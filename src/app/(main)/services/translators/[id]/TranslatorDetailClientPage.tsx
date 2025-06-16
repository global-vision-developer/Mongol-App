
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { doc, getDoc, serverTimestamp, addDoc, collection as firestoreCollection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import type { Translator, City, Order as AppOrder, TranslationField, LanguageLevel, DailyRateRange, NotificationItem, ItemType } from "@/types";
import { CITIES, TranslationFields as GlobalTranslationFields } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Star, MapPin, Phone, MessageCircle, ShieldCheck, CalendarDays, UserCheck, Users, LanguagesIcon, Briefcase, Landmark, Globe, ExternalLink, AlertTriangle, Info, ShoppingBag } from "lucide-react";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

const DetailItem: React.FC<{ labelKey: string; value?: string | string[] | null | number | boolean; icon?: React.ElementType; cityValue?: boolean; translationFieldsValue?: boolean; languageLevelValue?: boolean; dailyRateValue?: boolean }> = ({ labelKey, value, icon: Icon, cityValue, translationFieldsValue, languageLevelValue, dailyRateValue }) => {
  const { t, language } = useTranslation();
  let displayValue: string | React.ReactNode = t('notProvided');

  if (value !== undefined && value !== null && value !== '') {
    if (Array.isArray(value)) {
      if (cityValue) {
        displayValue = value.map(v => {
          const city = CITIES.find(c => c.value === v);
          return city ? (language === 'cn' && city.label_cn ? city.label_cn : city.label) : v;
        }).join(', ');
      } else if (translationFieldsValue) {
         displayValue = value.map(v => t(`field${v.charAt(0).toUpperCase() + v.slice(1)}`)).join(', ');
      } else {
        displayValue = value.join(', ');
      }
    } else if (typeof value === 'boolean') {
      displayValue = value ? t('yes') : t('no');
    } else if (languageLevelValue && typeof value === 'string') {
        const levelKey = `languageLevel${value.charAt(0).toUpperCase() + value.slice(1)}`;
        displayValue = t(levelKey);
    } else if (dailyRateValue && typeof value === 'string') {
        const rateKey = `rate${value.replace('-', 'to').replace('+', 'plus')}`;
        displayValue = t(rateKey);
    }
     else if (cityValue && typeof value === 'string') {
      const city = CITIES.find(c => c.value === value);
      displayValue = city ? (language === 'cn' && city.label_cn ? city.label_cn : city.label) : value.toString();
    } else if (labelKey === 'ratingLabel' && typeof value === 'number') {
      displayValue = `${value.toFixed(1)} / 5`; // Assuming 0-5 scale for translators for now
    }
     else {
      displayValue = value.toString();
    }
  }

  if (Icon) {
    return (
      <div className="flex items-start text-sm">
        <Icon className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium text-muted-foreground">{t(labelKey)}</p>
          <p className="text-foreground">{displayValue}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{t(labelKey)}</p>
      <p className="text-sm text-foreground">{displayValue}</p>
    </div>
  );
};

interface TranslatorDetailClientPageProps {
  params: { id: string };
  itemType: 'translator';
}

export default function TranslatorDetailClientPage({ params, itemType }: TranslatorDetailClientPageProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, addPointsToUser } = useAuth();
  const { toast } = useToast();

  const [translator, setTranslator] = useState<Translator | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const translatorId = params.id;

  useEffect(() => {
    if (translatorId) {
      const fetchTranslator = async () => {
        setLoading(true);
        try {
          const docRef = doc(db, "entries", translatorId); 
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const entryData = docSnap.data();
             if (entryData.categoryName === itemType) { 
                const nestedData = entryData.data || {};
                const registeredAtRaw = nestedData.registeredAt;
                const registeredAtDate = registeredAtRaw instanceof Timestamp 
                                          ? registeredAtRaw.toDate() 
                                          : (registeredAtRaw && typeof registeredAtRaw === 'string' ? new Date(registeredAtRaw) : undefined);
                
                const rawImageUrl = nestedData['nuur-zurag-url'];
                let finalImageUrl: string | undefined = undefined;
                if (typeof rawImageUrl === 'string' && rawImageUrl.trim() !== '') {
                    finalImageUrl = rawImageUrl.trim();
                }
                
                const rawWeChatQrUrl = nestedData.wechatQrImageUrl; 
                let finalWeChatQrUrl: string | undefined = undefined;
                if (typeof rawWeChatQrUrl === 'string' && rawWeChatQrUrl.trim() !== '') {
                    finalWeChatQrUrl = rawWeChatQrUrl.trim();
                }


                setTranslator({ 
                  id: docSnap.id, 
                  uid: nestedData.uid || docSnap.id,
                  name: nestedData.name || t('serviceUnnamed'),
                  photoUrl: finalImageUrl,
                  nationality: nestedData.nationality,
                  inChinaNow: nestedData.inChinaNow,
                  yearsInChina: nestedData.yearsInChina,
                  currentCityInChina: nestedData.currentCityInChina,
                  chineseExamTaken: nestedData.chineseExamTaken,
                  speakingLevel: nestedData.speakingLevel,
                  writingLevel: nestedData.writingLevel,
                  workedAsTranslator: nestedData.workedAsTranslator,
                  translationFields: nestedData.translationFields,
                  canWorkInOtherCities: nestedData.canWorkInOtherCities,
                  dailyRate: nestedData.dailyRate,
                  chinaPhoneNumber: nestedData.chinaPhoneNumber,
                  wechatId: nestedData.wechatId,
                  wechatQrImageUrl: finalWeChatQrUrl,
                  city: nestedData.khot || nestedData.currentCityInChina,
                  rating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : undefined,
                  description: nestedData.setgegdel || nestedData.description || '',
                  itemType: entryData.categoryName as ItemType, 
                  registeredAt: registeredAtDate,
                  isActive: nestedData.isActive,
                  isProfileComplete: nestedData.isProfileComplete,
                  reviewCount: nestedData.reviewCount,
                  views: nestedData.views,
                } as Translator);
            } else {
                console.warn(`Fetched item ${translatorId} is not a ${itemType}, but ${entryData.categoryName}`);
                setTranslator(null);
            }
          } else {
            console.log("No such translator entry!");
            setTranslator(null);
          }
        } catch (error) {
          console.error("Error fetching translator entry:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTranslator();
    }
  }, [translatorId, itemType, t]);

  const handleGetContactInfo = async () => {
    if (!user) {
      toast({ title: t('loginToProceed'), description: t('loginToBookService'), variant: "destructive" });
      router.push('/auth/login');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async () => {
    if (!user || !translator) return;
    setIsProcessingPayment(true);
    try {
      // Simulate payment processing if needed, or directly create order
      // For now, assume payment is successful immediately for demo purposes.
      // await new Promise(resolve => setTimeout(resolve, 1500)); 

      const orderData: Omit<AppOrder, 'id'> = {
        userId: user.uid,
        serviceType: itemType, 
        serviceId: translator.id,
        serviceName: translator.name || t('serviceUnnamed'),
        orderDate: serverTimestamp(),
        status: 'contact_revealed', 
        amount: translator.dailyRate || null, 
        contactInfoRevealed: true,
        imageUrl: translator.photoUrl || null,
        dataAiHint: "translator portrait",
      };
      await addDoc(firestoreCollection(db, "orders"), orderData);
      
      if (user?.uid) {
          await addPointsToUser(15);
      }

      const notificationData: Omit<NotificationItem, 'id'> = {
        titleKey: 'orderSuccessNotificationTitle',
        descriptionKey: 'orderSuccessNotificationDescription',
        descriptionPlaceholders: { serviceName: translator.name || t('serviceUnnamed') },
        date: serverTimestamp(),
        read: false,
        itemType: itemType, 
        link: `/orders`, 
        imageUrl: translator.photoUrl || null,
        dataAiHint: "translator portrait"
      };
      if (user?.uid) {
          await addDoc(firestoreCollection(db, "users", user.uid, "notifications"), notificationData);
      }

      toast({ title: t('orderCreatedSuccess') });
      setShowContactInfo(true);
      setIsPaymentModalOpen(false);
    } catch (error) {
      console.error("Error creating order:", error);
      toast({ title: t('orderCreationFailed'), variant: "destructive" });
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  const mainImageShouldUnoptimize = translator?.photoUrl?.startsWith('data:') || translator?.photoUrl?.includes('lh3.googleusercontent.com');
  const qrImageShouldUnoptimize = translator?.wechatQrImageUrl?.startsWith('data:') || translator?.wechatQrImageUrl?.includes('lh3.googleusercontent.com');


  if (loading) {
    return (
      <div className="space-y-4 p-4">
         <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md -mx-4 px-4">
            <div className="container mx-auto flex items-center justify-between h-16">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-6 w-1/2" />
                <div className="w-10"></div>
            </div>
        </div>
        <div className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-32" />
                </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
        </div>
        <CardFooter className="p-4 md:p-6 border-t">
           <Skeleton className="h-12 w-full rounded-lg" />
        </CardFooter>
      </div>
    );
  }

  if (!translator) {
    return (
      <div className="container mx-auto py-8 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">{t('translatorNotFound')}</h1>
        <Button onClick={() => router.back()}>{t('back')}</Button>
      </div>
    );
  }

  const dailyRateDisplay = translator.dailyRate ? t(`rate${translator.dailyRate.replace('-', 'to').replace('+', 'plus')}`) : t('notProvided');
  const registeredAtDate = translator.registeredAt instanceof Timestamp
    ? translator.registeredAt.toDate()
    : (translator.registeredAt ? new Date(translator.registeredAt as string) : null);


  return (
    <div className="pb-20">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between h-16">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold text-primary truncate px-2">
            {translator.name || t('translatorDetailTitle')}
          </h1>
          <div className="w-10"> {/* Spacer */}</div>
        </div>
      </div>

      <div className="container mx-auto py-2 md:py-6 px-2">
        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="p-0 relative aspect-[16/10] md:aspect-[16/7]">
            <Image
              src={translator.photoUrl || "https://placehold.co/600x400.png"}
              alt={translator.name || "Translator"}
              layout="fill"
              objectFit="cover"
              className="bg-muted"
              data-ai-hint="translator portrait professional"
              unoptimized={mainImageShouldUnoptimize}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
                <div className="flex items-center gap-3">
                    <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-background">
                        <AvatarImage src={translator.photoUrl || undefined} alt={translator.name} />
                        <AvatarFallback>{translator.name?.charAt(0) || 'T'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl md:text-3xl font-headline text-white mb-1">{translator.name}</CardTitle>
                         <DetailItem labelKey="ratingLabel" value={typeof translator.rating === 'number' ? translator.rating : undefined} icon={Star} />
                          {translator.reviewCount !== undefined && translator.reviewCount > 0 && (
                            <span className="text-xs text-gray-300 ml-1">
                                ({t('basedOnReviews', {reviewCount: translator.reviewCount})})
                            </span>
                        )}
                        { (translator.reviewCount === undefined || translator.reviewCount === 0) && typeof translator.rating !== 'number' && (
                             <span className="text-xs text-gray-300 ml-1">({t('noReviewsYet')})</span>
                        )}
                    </div>
                </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 md:p-6 space-y-6">
            {translator.description && (
                 <div className="space-y-2">
                    <h3 className="text-md font-semibold text-foreground flex items-center"><Info className="h-5 w-5 mr-2 text-primary"/>{t('translatorDescription')}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{translator.description}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <DetailItem labelKey="nationalityLabel" value={t(translator.nationality || 'notProvided')} icon={Globe} />
              <DetailItem labelKey="currentCityInChinaLabel" value={translator.currentCityInChina || t('notProvided')} icon={Landmark} cityValue />
              <DetailItem labelKey="yearsInChinaLabel" value={translator.inChinaNow === false && translator.yearsInChina ? translator.yearsInChina.toString() : (translator.inChinaNow ? t('yes') : t('notProvided'))} icon={CalendarDays} />
              <DetailItem labelKey="chineseExamTakenLabel" value={translator.chineseExamTaken} icon={ShieldCheck} />
              <DetailItem labelKey="speakingLevelLabel" value={translator.speakingLevel} icon={LanguagesIcon} languageLevelValue/>
              <DetailItem labelKey="writingLevelLabel" value={translator.writingLevel} icon={LanguagesIcon} languageLevelValue/>
              <DetailItem labelKey="workedAsTranslatorLabel" value={translator.workedAsTranslator} icon={Briefcase} />
              <DetailItem labelKey="dailyRateLabel" value={translator.dailyRate} icon={Star} dailyRateValue />
              <DetailItem labelKey="translationFieldsLabel" value={translator.translationFields} icon={Users} translationFieldsValue />
              <DetailItem labelKey="canWorkInOtherCitiesLabel" value={translator.canWorkInOtherCities} icon={MapPin} cityValue />
              {registeredAtDate && (
                <DetailItem labelKey="registeredAt" value={format(registeredAtDate, 'yyyy-MM-dd')} icon={UserCheck} />
              )}
            </div>

            {showContactInfo && (
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold text-primary mb-3">{t('contactInformation')}</h3>
                <div className="space-y-3">
                  {translator.chinaPhoneNumber && <DetailItem labelKey="chinaPhoneNumberLabel" value={translator.chinaPhoneNumber} icon={Phone} />}
                  {translator.wechatId && <DetailItem labelKey="wechatIdLabel" value={translator.wechatId} icon={MessageCircle} />}
                   {translator.wechatQrImageUrl && (
                     <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{t('wechatQrImageLabel')}</p>
                        <Image src={translator.wechatQrImageUrl} alt={t('wechatQrImageLabel')} width={128} height={128} className="rounded-md border" data-ai-hint="qr code" unoptimized={qrImageShouldUnoptimize} />
                     </div>
                   )}
                </div>
              </div>
            )}
          </CardContent>

          {!showContactInfo && (
            <CardFooter className="p-4 md:p-6 border-t">
              <Button 
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 text-base h-12" 
                onClick={handleGetContactInfo} 
                disabled={isProcessingPayment}
                >
                 {isProcessingPayment ? t('loading') : (
                    <>
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        {t('getContactInfoButton')}
                    </>
                 )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('paymentModalTitle')}</DialogTitle>
            <DialogDescription>
              {translator.dailyRate && t('paymentModalDescription', { rate: dailyRateDisplay || '...' })}
              {!translator.dailyRate && t('paymentModalDescription', { rate: '...' })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">{t('contactInfoPaymentPlaceholder')}</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" disabled={isProcessingPayment}>{t('cancel')}</Button>
            </DialogClose>
            <Button onClick={handlePaymentConfirm} disabled={isProcessingPayment}>
              {isProcessingPayment ? t('loading') : t('payButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Add to LanguageContext:
// mn: {
//   ratingLabel: "Үнэлгээ",
//   notProvided: "Оруулаагүй"
// },
// cn: {
//   ratingLabel: "评分",
//   notProvided: "未提供"
// }

