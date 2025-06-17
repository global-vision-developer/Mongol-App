
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
import { ServiceReviewForm } from "@/components/ServiceReviewForm"; // Added import

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
    } else if (cityValue && typeof value === 'string') {
      const city = CITIES.find(c => c.value === value);
      displayValue = city ? (language === 'cn' && city.label_cn ? city.label_cn : city.label) : value.toString();
    } else if (labelKey === 'ratingLabel' && typeof value === 'number') { // This specific handling for ratingLabel might be redundant now
      displayValue = `${value.toFixed(1)} / 10`;
    } else {
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
  itemData: Translator | null;
}

export default function TranslatorDetailClientPage({ params, itemType, itemData }: TranslatorDetailClientPageProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [translator, setTranslator] = useState<Translator | null>(itemData);
  const [loadingInitial, setLoadingInitial] = useState(!itemData && !!params.id);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (itemData) {
      setTranslator(itemData);
      setLoadingInitial(false);
    } else if (params.id && !itemData) {
      const fetchTranslator = async () => {
        setLoadingInitial(true);
        try {
          const docRef = doc(db, "entries", params.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const entryData = docSnap.data();
            if (entryData.categoryName === "translators") {
              const nestedData = entryData.data || {};
              const registeredAtRaw = nestedData.registeredAt;
              const registeredAtDate = registeredAtRaw instanceof Timestamp 
                                        ? registeredAtRaw.toDate() 
                                        : (registeredAtRaw && typeof registeredAtRaw === 'string' ? new Date(registeredAtRaw) : undefined);
              
              const rawImageUrl = nestedData['nuur-zurag-url'] || nestedData.photoUrl;
              let finalImageUrl: string | undefined = undefined;
              if (typeof rawImageUrl === 'string' && rawImageUrl.trim() !== '' && !rawImageUrl.startsWith("data:image/gif;base64") && !rawImageUrl.includes('lh3.googleusercontent.com')) {
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
                nationality: nestedData.nationality as Nationality,
                inChinaNow: nestedData.inChinaNow,
                yearsInChina: nestedData.yearsInChina,
                currentCityInChina: nestedData.currentCityInChina,
                chineseExamTaken: nestedData.chineseExamTaken,
                speakingLevel: nestedData.speakingLevel as LanguageLevel,
                writingLevel: nestedData.writingLevel as LanguageLevel,
                workedAsTranslator: nestedData.workedAsTranslator,
                translationFields: nestedData.translationFields as TranslationField[],
                canWorkInOtherCities: nestedData.canWorkInOtherCities,
                dailyRate: nestedData.dailyRate as DailyRateRange,
                chinaPhoneNumber: nestedData.chinaPhoneNumber,
                wechatId: nestedData.wechatId,
                wechatQrImageUrl: finalWeChatQrUrl,
                city: nestedData.khot || nestedData.currentCityInChina,
                averageRating: typeof nestedData.unelgee === 'number' ? nestedData.unelgee : null,
                reviewCount: typeof nestedData.reviewCount === 'number' ? nestedData.reviewCount : 0,
                totalRatingSum: typeof nestedData.totalRatingSum === 'number' ? nestedData.totalRatingSum : 0,
                description: nestedData.setgegdel || nestedData.description || '',
                itemType: entryData.categoryName as ItemType, 
                registeredAt: registeredAtDate,
                isActive: nestedData.isActive,
                isProfileComplete: nestedData.isProfileComplete,
                views: nestedData.views,
              } as Translator);
            } else {
              setTranslator(null);
            }
          } else {
            setTranslator(null);
          }
        } catch (error) {
          console.error("Error fetching translator entry client-side:", error);
          setTranslator(null);
        } finally {
          setLoadingInitial(false);
        }
      };
      fetchTranslator();
    }
  }, [itemData, params.id, t]);

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

  const onReviewSubmitted = (newAverageRating: number, newReviewCount: number, newTotalRatingSum: number) => {
    if (translator) {
      setTranslator(prevTranslator => prevTranslator ? ({
        ...prevTranslator,
        averageRating: newAverageRating,
        reviewCount: newReviewCount,
        totalRatingSum: newTotalRatingSum,
      }) : null);
    }
  };
  
  const mainImageShouldUnoptimize = translator?.photoUrl?.startsWith('data:') || translator?.photoUrl?.includes('lh3.googleusercontent.com');
  const qrImageShouldUnoptimize = translator?.wechatQrImageUrl?.startsWith('data:') || translator?.wechatQrImageUrl?.includes('lh3.googleusercontent.com');

  if (loadingInitial) {
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
  const registeredAtDate = translator.registeredAt instanceof Date
    ? translator.registeredAt
    : (translator.registeredAt instanceof Timestamp ? translator.registeredAt.toDate() : null);

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
        <Card className="overflow-hidden shadow-xl mb-6">
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
                         
                        <div className="flex items-center gap-1 text-sm text-amber-500">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                            {translator.averageRating !== null && translator.averageRating !== undefined && translator.reviewCount !== undefined ? (
                                <span>{t('averageRatingDisplay', { averageRating: translator.averageRating.toFixed(1), reviewCount: translator.reviewCount })}</span>
                            ) : (
                                <span>{t('noReviewsYet')}</span>
                            )}
                        </div>
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
        
        <ServiceReviewForm
          itemId={translator.id}
          itemType={itemType}
          currentAverageRating={translator.averageRating ?? 0}
          currentReviewCount={translator.reviewCount ?? 0}
          currentTotalRatingSum={translator.totalRatingSum ?? 0}
          onReviewSubmitted={onReviewSubmitted}
        />
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

