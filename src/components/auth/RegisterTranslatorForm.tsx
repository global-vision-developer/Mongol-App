
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import type { Translator, Nationality, LanguageLevel, DailyRateRange, TranslationField, ItemType } from "@/types";
import { CITIES, TranslationFields as GlobalTranslationFields } from "@/lib/constants"; 
import { AlertCircle, CheckCircle2, FileImage, ArrowLeft } from "lucide-react";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const fileSchema = z.instanceof(File)
  .optional()
  .nullable()
  .refine(file => !file || file.size <= MAX_FILE_SIZE_BYTES, {
    message: `fileSizeError` 
  });

const translatorStep1Schema = z.object({
  nationality: z.enum(['mongolian', 'chinese', 'inner_mongolian', ''], { required_error: "requiredError"}).refine(val => val !== '', { message: "requiredError" }),
  inChinaNow: z.boolean({required_error: "requiredError"}).nullable(),
  yearsInChina: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number({ invalid_type_error: "invalidNumberError" }).positive().nullable()
  ),
  currentCityInChina: z.string().nullable(),
  chineseExamTaken: z.boolean({required_error: "requiredError"}).nullable(),
  speakingLevel: z.enum(['good', 'intermediate', 'basic', ''], { required_error: "requiredError" }).refine(val => val !== '', { message: "requiredError" }),
  writingLevel: z.enum(['good', 'intermediate', 'basic', ''], { required_error: "requiredError" }).refine(val => val !== '', { message: "requiredError" }),
  workedAsTranslator: z.boolean({required_error: "requiredError"}).nullable(),
  translationFields: z.array(z.string()).min(1, "requiredError"),
  canWorkInOtherCities: z.array(z.string()).optional(),
  dailyRate: z.enum(['100-200', '200-300', '300-400', '400-500', '500+', ''], { required_error: "requiredError" }).refine(val => val !== '', { message: "requiredError" }),
  chinaPhoneNumber: z.string().optional().nullable(),
  wechatId: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.inChinaNow === false && (data.yearsInChina === null || data.yearsInChina === undefined)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "requiredError",
      path: ["yearsInChina"],
    });
  }
  if (data.inChinaNow === true && (data.currentCityInChina === null || data.currentCityInChina === undefined || data.currentCityInChina === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "requiredError",
      path: ["currentCityInChina"],
    });
  }
});

const translatorStep2Schema = z.object({
  idCardFrontImage: fileSchema.refine(file => !!file, { message: "requiredError" }),
  idCardBackImage: fileSchema.refine(file => !!file, { message: "requiredError" }),
  selfieImage: fileSchema.refine(file => !!file, { message: "requiredError" }),
  wechatQrImage: fileSchema.optional().nullable(),
});

type TranslatorStep1Data = z.infer<typeof translatorStep1Schema>;
type TranslatorStep2Data = z.infer<typeof translatorStep2Schema>;
type CombinedFormData = TranslatorStep1Data & Partial<TranslatorStep2Data>;


export function RegisterTranslatorForm() {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const [idCardFrontPreview, setIdCardFrontPreview] = useState<string | null>(null);
  const [idCardBackPreview, setIdCardBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [wechatQrPreview, setWechatQrPreview] = useState<string | null>(null);

  const currentSchema = step === 1 ? translatorStep1Schema : translatorStep2Schema;

  const { control, handleSubmit, register, setValue, getValues, trigger, watch, formState: { errors } } = useForm<CombinedFormData>({
    resolver: zodResolver(currentSchema),
    mode: "onChange", 
    defaultValues: {
      nationality: '',
      inChinaNow: null,
      yearsInChina: null,
      currentCityInChina: null,
      chineseExamTaken: null,
      speakingLevel: '',
      writingLevel: '',
      workedAsTranslator: null,
      translationFields: [],
      canWorkInOtherCities: [],
      dailyRate: '',
      chinaPhoneNumber: '',
      wechatId: '',
      idCardFrontImage: null,
      idCardBackImage: null,
      selfieImage: null,
      wechatQrImage: null,
    },
  });

  const inChinaNow = useWatch({ control, name: "inChinaNow" });

  useEffect(() => {
    if (user) {
      // Pre-fill if needed
    }
  }, [user, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof TranslatorStep2Data, setPreview: (url: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue(fieldName, file as any, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setValue(fieldName, null as any, { shouldValidate: true });
      setPreview(null);
    }
  };

  const renderFileError = (fieldName: keyof TranslatorStep2Data) => {
    if (errors[fieldName]) {
      const rawMessage = errors[fieldName]?.message || 'requiredError';
      const messageKey = rawMessage === 'fileSizeError' ? `${fieldName}SizeError` : rawMessage;
      return <p className="text-xs text-destructive pt-1">{t(messageKey, { fileName: getValues(fieldName)?.name || 'Файл' })}</p>;
    }
    return null;
  };


  const onSubmit = async (data: CombinedFormData) => {
    if (step === 1) {
      const isValid = await trigger(); 
      if (isValid) {
        setStep(2);
      }
      return;
    }

    if (!user) {
      toast({ title: t('mustBeLoggedInToRegister'), variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      // Image upload simulation/placeholders - replace with actual Firebase Storage uploads
      const idCardFrontImageUrl = data.idCardFrontImage ? `placeholder_id_front_${user.uid}` : null;
      const idCardBackImageUrl = data.idCardBackImage ? `placeholder_id_back_${user.uid}` : null;
      const selfieImageUrl = data.selfieImage ? `placeholder_selfie_${user.uid}` : null;
      const wechatQrImageUrl = data.wechatQrImage ? `placeholder_qr_${user.uid}` : null;

      // Prepare data for Firestore, ensuring no undefined values
      const profileToSave = {
        nationality: (data.nationality === '' || data.nationality === undefined) ? null : data.nationality as Nationality,
        inChinaNow: data.inChinaNow === undefined ? null : data.inChinaNow,
        yearsInChina: data.inChinaNow === false ? (data.yearsInChina === undefined ? null : data.yearsInChina) : null,
        currentCityInChina: data.inChinaNow === true ? ((data.currentCityInChina === '' || data.currentCityInChina === undefined) ? null : data.currentCityInChina) : null,
        chineseExamTaken: data.chineseExamTaken === undefined ? null : data.chineseExamTaken,
        speakingLevel: (data.speakingLevel === '' || data.speakingLevel === undefined) ? null : data.speakingLevel as LanguageLevel,
        writingLevel: (data.writingLevel === '' || data.writingLevel === undefined) ? null : data.writingLevel as LanguageLevel,
        workedAsTranslator: data.workedAsTranslator === undefined ? null : data.workedAsTranslator,
        translationFields: data.translationFields || [],
        canWorkInOtherCities: data.canWorkInOtherCities || [],
        dailyRate: (data.dailyRate === '' || data.dailyRate === undefined) ? null : data.dailyRate as DailyRateRange,
        chinaPhoneNumber: (data.chinaPhoneNumber === '' || data.chinaPhoneNumber === undefined) ? null : data.chinaPhoneNumber,
        wechatId: (data.wechatId === '' || data.wechatId === undefined) ? null : data.wechatId,
        idCardFrontImageUrl: idCardFrontImageUrl,
        idCardBackImageUrl: idCardBackImageUrl,
        selfieImageUrl: selfieImageUrl,
        wechatQrImageUrl: wechatQrImageUrl,
      };
      
      const fullTranslatorProfile: Translator = {
        uid: user.uid,
        id: user.uid, 
        name: user.displayName || t('serviceUnnamed'), // Using serviceUnnamed as a fallback for name
        photoUrl: user.photoURL || null,
        ...profileToSave,
        averageRating: null,
        reviewCount: 0,
        totalRatingSum: 0,
        city: profileToSave.currentCityInChina || null, 
        description: '', 
        itemType: 'translator' as ItemType,
        views: 0,
        registeredAt: serverTimestamp(),
        isActive: false, 
        isProfileComplete: true, 
      };
      
      await setDoc(doc(db, "ankets", user.uid), fullTranslatorProfile);
      setSubmissionSuccess(true);

    } catch (error) {
      console.error("Translator registration error:", error);
      toast({ title: t('registrationFailedGeneral'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return <p className="text-center">{t('loading')}...</p>;
  if (!user && !authLoading) return <p className="text-center text-destructive">{t('mustBeLoggedInToRegister')}</p>;

  if (submissionSuccess) {
    return (
      <Card className="w-full shadow-xl">
        <CardHeader className="items-center text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-2xl font-headline">{t('applicationSubmittedSuccessTitle')}</CardTitle>
          <CardDescription>{t('applicationSubmittedSuccessDescription')}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push('/profile')}>{t('backToProfileButton')}</Button>
        </CardFooter>
      </Card>
    );
  }

  const nationalityOptions: { value: Nationality | ''; labelKey: string }[] = [
    { value: '', labelKey: 'selectNationalityPlaceholder' },
    { value: 'mongolian', labelKey: 'mongolian' },
    { value: 'chinese', labelKey: 'chinese' },
    { value: 'inner_mongolian', labelKey: 'innerMongolian' },
  ];

  const languageLevelOptions: { value: LanguageLevel | ''; labelKey: string }[] = [
    { value: '', labelKey: 'selectSpeakingLevelPlaceholder' },
    { value: 'good', labelKey: 'languageLevelGood' },
    { value: 'intermediate', labelKey: 'languageLevelIntermediate' },
    { value: 'basic', labelKey: 'languageLevelBasic' },
  ];

  const dailyRateOptions: { value: DailyRateRange | ''; labelKey: string }[] = [
    { value: '', labelKey: 'selectDailyRatePlaceholder' },
    { value: '100-200', labelKey: 'rate100to200' },
    { value: '200-300', labelKey: 'rate200to300' },
    { value: '300-400', labelKey: 'rate300to400' },
    { value: '400-500', labelKey: 'rate400to500' },
    { value: '500+', labelKey: 'rate500plus' },
  ];

  const translationFieldOptions: { value: TranslationField; labelKey: string }[] = GlobalTranslationFields.map(field => ({
    value: field,
    labelKey: `field${field.charAt(0).toUpperCase() + field.slice(1)}` as any
  }));
  

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">{t(step === 1 ? 'translatorFormStep1' : 'translatorFormStep2')}</CardTitle>
        {step === 1 && <CardDescription>{t('translatorRegistrationFormDescription')}</CardDescription>}
        {step === 2 && <CardDescription>{t('uploadImagesDescription')}</CardDescription>}
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-1">
                <Label htmlFor="nationality">{t('nationalityLabel')}</Label>
                <Controller
                  name="nationality"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubmitting}>
                      <SelectTrigger id="nationality">
                        <SelectValue placeholder={t('selectNationalityPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {nationalityOptions.filter(opt => opt.value !== '').map(opt => <SelectItem key={opt.value} value={opt.value as string}>{t(opt.labelKey)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.nationality && <p className="text-xs text-destructive pt-1">{t(errors.nationality.message as string)}</p>}
              </div>

              <div className="space-y-2">
                 <Label>{t('inChinaNowLabel')}</Label>
                <Controller
                  name="inChinaNow"
                  control={control}
                  render={({ field }) => (
                     <RadioGroup
                        onValueChange={(value) => field.onChange(value === "true")}
                        value={field.value === null || field.value === undefined ? "" : String(field.value)}
                        className="flex gap-4"
                        disabled={isSubmitting}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="inChinaNow-yes" />
                          <Label htmlFor="inChinaNow-yes">{t('yes')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="inChinaNow-no" />
                          <Label htmlFor="inChinaNow-no">{t('no')}</Label>
                        </div>
                      </RadioGroup>
                  )}
                />
                 {errors.inChinaNow && <p className="text-xs text-destructive pt-1">{t(errors.inChinaNow.message as string)}</p>}
              </div>

              {inChinaNow === false && (
                <div className="space-y-1">
                  <Label htmlFor="yearsInChina">{t('yearsInChinaLabel')}</Label>
                  <Input id="yearsInChina" type="number" {...register("yearsInChina")} placeholder={t('yearsInChinaPlaceholder')} disabled={isSubmitting} />
                  {errors.yearsInChina && <p className="text-xs text-destructive pt-1">{t(errors.yearsInChina.message as string)}</p>}
                </div>
              )}

              {inChinaNow === true && (
                 <div className="space-y-1">
                    <Label htmlFor="currentCityInChina">{t('currentCityInChinaLabel')}</Label>
                    <Controller
                      name="currentCityInChina"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubmitting}>
                          <SelectTrigger id="currentCityInChina">
                            <SelectValue placeholder={t('selectCurrentCityInChinaPlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {CITIES.filter(c => c.value !== 'all').map(city => (
                              <SelectItem key={city.value} value={city.value}>
                                {language === 'cn' && city.label_cn ? city.label_cn : city.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.currentCityInChina && <p className="text-xs text-destructive pt-1">{t(errors.currentCityInChina.message as string)}</p>}
                  </div>
              )}

               <div className="space-y-2">
                 <Label>{t('chineseExamTakenLabel')}</Label>
                 <Controller
                    name="chineseExamTaken"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === "true")}
                        value={field.value === null || field.value === undefined ? "" : String(field.value)}
                        className="flex gap-4"
                        disabled={isSubmitting}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="chineseExamTaken-yes" />
                          <Label htmlFor="chineseExamTaken-yes">{t('yes')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="chineseExamTaken-no" />
                          <Label htmlFor="chineseExamTaken-no">{t('no')}</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.chineseExamTaken && <p className="text-xs text-destructive pt-1">{t(errors.chineseExamTaken.message as string)}</p>}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="speakingLevel">{t('speakingLevelLabel')}</Label>
                <Controller
                  name="speakingLevel"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubmitting}>
                      <SelectTrigger id="speakingLevel">
                        <SelectValue placeholder={t('selectSpeakingLevelPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {languageLevelOptions.filter(opt => opt.value !== '').map(opt => <SelectItem key={opt.value} value={opt.value as string}>{t(opt.labelKey)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.speakingLevel && <p className="text-xs text-destructive pt-1">{t(errors.speakingLevel.message as string)}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="writingLevel">{t('writingLevelLabel')}</Label>
                 <Controller
                  name="writingLevel"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubmitting}>
                      <SelectTrigger id="writingLevel">
                        <SelectValue placeholder={t('selectWritingLevelPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {languageLevelOptions.filter(opt => opt.value !== '').map(opt => <SelectItem key={opt.value} value={opt.value as string}>{t(opt.labelKey)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.writingLevel && <p className="text-xs text-destructive pt-1">{t(errors.writingLevel.message as string)}</p>}
              </div>

              <div className="space-y-2">
                <Label>{t('workedAsTranslatorLabel')}</Label>
                 <Controller
                    name="workedAsTranslator"
                    control={control}
                    render={({ field }) => (
                       <RadioGroup
                        onValueChange={(value) => field.onChange(value === "true")}
                        value={field.value === null || field.value === undefined ? "" : String(field.value)}
                        className="flex gap-4"
                        disabled={isSubmitting}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="workedAsTranslator-yes" />
                          <Label htmlFor="workedAsTranslator-yes">{t('yes')}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="workedAsTranslator-no" />
                          <Label htmlFor="workedAsTranslator-no">{t('no')}</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.workedAsTranslator && <p className="text-xs text-destructive pt-1">{t(errors.workedAsTranslator.message as string)}</p>}
              </div>

              <div className="space-y-2">
                <Label>{t('translationFieldsLabel')}</Label>
                <Controller
                    name="translationFields"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 gap-2">
                        {translationFieldOptions.map(opt => (
                          <div key={opt.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`field-${opt.value}`}
                              checked={field.value?.includes(opt.value)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValues, opt.value]);
                                } else {
                                  field.onChange(currentValues.filter(v => v !== opt.value));
                                }
                              }}
                              disabled={isSubmitting}
                            />
                            <Label htmlFor={`field-${opt.value}`} className="text-sm font-normal">{t(opt.labelKey)}</Label>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                {errors.translationFields && <p className="text-xs text-destructive pt-1">{t(errors.translationFields.message as string)}</p>}
              </div>
              
              <div className="space-y-2">
                <Label>{t('canWorkInOtherCitiesLabel')}</Label>
                 <Controller
                    name="canWorkInOtherCities"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 gap-2">
                        {CITIES.filter(c => c.value !== 'all').map(cityOpt => (
                          <div key={cityOpt.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`city-${cityOpt.value}`}
                              checked={field.value?.includes(cityOpt.value)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValues, cityOpt.value]);
                                } else {
                                  field.onChange(currentValues.filter(v => v !== cityOpt.value));
                                }
                              }}
                              disabled={isSubmitting}
                            />
                            <Label htmlFor={`city-${cityOpt.value}`} className="text-sm font-normal">
                               {language === 'cn' && cityOpt.label_cn ? cityOpt.label_cn : cityOpt.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  {errors.canWorkInOtherCities && <p className="text-xs text-destructive pt-1">{t(errors.canWorkInOtherCities.message as string)}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="dailyRate">{t('dailyRateLabel')}</Label>
                <Controller
                  name="dailyRate"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubmitting}>
                      <SelectTrigger id="dailyRate">
                        <SelectValue placeholder={t('selectDailyRatePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {dailyRateOptions.filter(opt => opt.value !== '').map(opt => <SelectItem key={opt.value} value={opt.value as string}>{t(opt.labelKey)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.dailyRate && <p className="text-xs text-destructive pt-1">{t(errors.dailyRate.message as string)}</p>}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="chinaPhoneNumber">{t('chinaPhoneNumberLabel')}</Label>
                <Input id="chinaPhoneNumber" {...register("chinaPhoneNumber")} placeholder={t('chinaPhoneNumberPlaceholder')} disabled={isSubmitting} />
                {errors.chinaPhoneNumber && <p className="text-xs text-destructive pt-1">{t(errors.chinaPhoneNumber.message as string)}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="wechatId">{t('wechatIdLabel')}</Label>
                <Input id="wechatId" {...register("wechatId")} placeholder={t('wechatIdPlaceholder')} disabled={isSubmitting} />
                {errors.wechatId && <p className="text-xs text-destructive pt-1">{t(errors.wechatId.message as string)}</p>}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-1">
                <Label htmlFor="idCardFrontImage">{t('idCardFrontImageLabel')}</Label>
                <Input id="idCardFrontImage" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "idCardFrontImage", setIdCardFrontPreview)} disabled={isSubmitting} />
                {idCardFrontPreview && <img src={idCardFrontPreview} alt="ID Card Front Preview" className="mt-2 h-32 object-contain border rounded" />}
                {renderFileError("idCardFrontImage")}
              </div>

              <div className="space-y-1">
                <Label htmlFor="idCardBackImage">{t('idCardBackImageLabel')}</Label>
                <Input id="idCardBackImage" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "idCardBackImage", setIdCardBackPreview)} disabled={isSubmitting} />
                {idCardBackPreview && <img src={idCardBackPreview} alt="ID Card Back Preview" className="mt-2 h-32 object-contain border rounded" />}
                {renderFileError("idCardBackImage")}
              </div>

              <div className="space-y-1">
                <Label htmlFor="selfieImage">{t('selfieImageLabel')}</Label>
                <Input id="selfieImage" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "selfieImage", setSelfiePreview)} disabled={isSubmitting} />
                {selfiePreview && <img src={selfiePreview} alt="Selfie Preview" className="mt-2 h-32 object-contain border rounded" />}
                {renderFileError("selfieImage")}
              </div>

              <div className="space-y-1">
                <Label htmlFor="wechatQrImage">{t('wechatQrImageLabel')} ({t('optional')})</Label>
                <Input id="wechatQrImage" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "wechatQrImage", setWechatQrPreview)} disabled={isSubmitting} />
                {wechatQrPreview && <img src={wechatQrPreview} alt="WeChat QR Preview" className="mt-2 h-32 object-contain border rounded" />}
                {renderFileError("wechatQrImage")}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {step === 1 && (
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {t('nextStepButton')}
            </Button>
          )}
          {step === 2 && (
            <>
              <Button type="submit" className="w-full" disabled={isSubmitting || authLoading}>
                {isSubmitting ? t('loading') : t('submitApplicationButton')}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)} disabled={isSubmitting}>
                <ArrowLeft className="mr-2 h-4 w-4" /> {t('previousStepButton')}
              </Button>
            </>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
