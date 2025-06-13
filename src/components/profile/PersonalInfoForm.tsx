
"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/types';

const personalInfoSchema = z.object({
  lastName: z.string().min(1, "lastNameRequired"),
  firstName: z.string().min(1, "firstNameRequired"),
  dateOfBirth: z.date({ required_error: "dateOfBirthRequired" }).optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  homeAddress: z.string().optional().nullable(),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

export function PersonalInfoForm() {
  const { user, updatePersonalInformation, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, register, setValue, formState: { errors } } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      lastName: '',
      firstName: '',
      dateOfBirth: null,
      gender: null,
      homeAddress: '',
    },
  });

  useEffect(() => {
    if (user) {
      setValue('lastName', user.lastName || '');
      setValue('firstName', user.firstName || '');
      setValue('dateOfBirth', user.dateOfBirth ? parseISO(user.dateOfBirth) : null);
      setValue('gender', user.gender || null);
      setValue('homeAddress', user.homeAddress || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: PersonalInfoFormData) => {
    if (!user) {
      toast({ title: t('userNotLoggedInError'), variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const updateData: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'dateOfBirth' | 'gender' | 'homeAddress'>> = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth ? format(data.dateOfBirth, 'yyyy-MM-dd') : null,
        gender: data.gender,
        homeAddress: data.homeAddress,
      };
      await updatePersonalInformation(updateData);
      toast({ title: t('personalInfoUpdateSuccess') });
    } catch (error) {
      console.error("Personal info update error:", error);
      toast({ title: t('personalInfoUpdateError'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const translateError = (key?: string) => {
    if (!key) return undefined;
    if (key === "lastNameRequired") return t("fillRequiredFields"); // Assuming a generic message key
    if (key === "firstNameRequired") return t("fillRequiredFields");
    if (key === "dateOfBirthRequired") return t("fillRequiredFields");
    return key; // Fallback to raw key if no specific translation
  };


  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">{t('personalInfoFormTitle')}</CardTitle>
        <CardDescription>{t('personalInfoFormDescription')}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Last Name */}
          <div className="space-y-1">
            <Label htmlFor="lastName">{t('lastName')}</Label>
            <Input id="lastName" {...register("lastName")} placeholder={t('yourLastNamePlaceholder')} disabled={isSubmitting || authLoading} />
            {errors.lastName && <p className="text-xs text-destructive pt-1">{translateError(errors.lastName.message)}</p>}
          </div>

          {/* First Name */}
          <div className="space-y-1">
            <Label htmlFor="firstName">{t('firstName')}</Label>
            <Input id="firstName" {...register("firstName")} placeholder={t('yourFirstNamePlaceholder')} disabled={isSubmitting || authLoading} />
            {errors.firstName && <p className="text-xs text-destructive pt-1">{translateError(errors.firstName.message)}</p>}
          </div>

          {/* Date of Birth */}
          <div className="space-y-1">
            <Label htmlFor="dateOfBirth">{t('dateOfBirth')}</Label>
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isSubmitting || authLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>{t('selectDatePlaceholderShort')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01") || (isSubmitting || authLoading)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.dateOfBirth && <p className="text-xs text-destructive pt-1">{translateError(errors.dateOfBirth.message)}</p>}
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <Label htmlFor="gender">{t('gender')}</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || ""}
                  value={field.value || ""}
                  disabled={isSubmitting || authLoading}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={t('selectGenderPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t('male')}</SelectItem>
                    <SelectItem value="female">{t('female')}</SelectItem>
                    <SelectItem value="other">{t('other')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
             {errors.gender && <p className="text-xs text-destructive pt-1">{translateError(errors.gender.message)}</p>}
          </div>

          {/* Home Address */}
          <div className="space-y-1">
            <Label htmlFor="homeAddress">{t('homeAddress')}</Label>
            <Textarea
              id="homeAddress"
              {...register("homeAddress")}
              placeholder={t('yourHomeAddressPlaceholder')}
              disabled={isSubmitting || authLoading}
              className="min-h-[60px]"
            />
            {errors.homeAddress && <p className="text-xs text-destructive pt-1">{translateError(errors.homeAddress.message)}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting || authLoading}>
            {isSubmitting || authLoading ? t('loading') : t('save')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
