
"use client";

import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mail, Phone, LifeBuoy } from 'lucide-react';

export default function HelpSupportPage() {
  const { t } = useTranslation();

  const faqs = [
    {
      id: 'faq1',
      questionKey: 'helpFaq1Question',
      answerKey: 'helpFaq1Answer',
    },
    {
      id: 'faq2',
      questionKey: 'helpFaq2Question',
      answerKey: 'helpFaq2Answer',
    },
    {
      id: 'faq3',
      questionKey: 'helpFaq3Question',
      answerKey: 'helpFaq3Answer',
    },
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <LifeBuoy className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-3xl font-headline font-semibold">{t('helpSupportPageTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('helpSupportPageSubtitle')}</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('faqTitle')}</CardTitle>
          <CardDescription>{t('faqSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          {faqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem value={faq.id} key={faq.id}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    {t(faq.questionKey)}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{t(faq.answerKey)}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-muted-foreground">{t('noFaqsAvailable')}</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('contactSupportTitle')}</CardTitle>
          <CardDescription>{t('contactSupportSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold">{t('emailSupportTitle')}</h3>
              <p className="text-muted-foreground">{t('emailSupportDescription')}</p>
              <a href="mailto:support@mongolapp.com" className="text-primary hover:underline">
                support@mongolapp.com
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold">{t('phoneSupportTitle')}</h3>
              <p className="text-muted-foreground">{t('phoneSupportDescription')}</p>
              <a href="tel:+97670000000" className="text-primary hover:underline">
                +976 7000-0000
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
