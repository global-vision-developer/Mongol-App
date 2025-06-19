
"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, FileText, ShieldCheck, BookOpen, DollarSign, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FAQItem } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp, DocumentData } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface GroupedFAQs {
  [topic: string]: FAQItem[];
}

export default function HelpSupportPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [groupedFaqs, setGroupedFaqs] = useState<GroupedFAQs>({});
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Set to true once mounted on client

    const fetchFAQs = async () => {
      setLoadingFaqs(true);
      try {
        const faqsColRef = collection(db, "faqs");
        const q = query(faqsColRef, orderBy("topic"), orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);
        
        const items: FAQItem[] = snapshot.docs.map(doc => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            question: data.question || '',
            answer: data.answer || '',
            topic: data.topic || 'General', 
            createdAt: data.createdAt as Timestamp, 
            createdBy: data.createdBy,
            isPredefined: data.isPredefined,
            updatedAt: data.updatedAt as Timestamp | undefined,
            order: typeof data.order === 'number' ? data.order : undefined,
          } as FAQItem;
        });

        const grouped: GroupedFAQs = items.reduce((acc, faq) => {
          const topicKey = faq.topic;
          if (!acc[topicKey]) {
            acc[topicKey] = [];
          }
          acc[topicKey].push(faq);
          if (acc[topicKey].every(item => typeof item.order === 'number')) {
            acc[topicKey].sort((a, b) => (a.order as number) - (b.order as number));
          }
          return acc;
        }, {} as GroupedFAQs);
        
        setGroupedFaqs(grouped);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        setGroupedFaqs({}); 
      } finally {
        setLoadingFaqs(false);
      }
    };

    fetchFAQs();
  }, []);

  const getTopicIcon = (topicKey: string) => {
    const topicAppUsageKey = t('faqTopicAppUsage', undefined, "Аппликэйшн ашиглах заавар");
    const topicCheapTravelKey = t('faqTopicCheapTravel', undefined, "Хэрхэн хямд аялах вэ?");

    if (topicKey === topicAppUsageKey) {
      return <BookOpen className="h-6 w-6 text-primary mr-3" />;
    }
    if (topicKey === topicCheapTravelKey) {
      return <DollarSign className="h-6 w-6 text-primary mr-3" />;
    }
    return <HelpCircle className="h-6 w-6 text-primary mr-3" />;
  };

  // Use a non-translated placeholder if not on client yet, or an empty string
  const pageTitle = isClient ? t('helpSupportPageTitle') : ''; 
  const backButtonSrText = isClient ? t('back') : 'Back';

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <div className="flex items-center sticky top-0 z-10 bg-background py-3 md:relative md:py-0 -mx-4 px-4 md:mx-0 md:px-0 border-b md:border-none mb-2 md:mb-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">{backButtonSrText}</span>
          </Button>
          <h1 className="text-xl font-headline font-semibold text-center flex-grow text-primary">
            {pageTitle}
          </h1>
          <div className="w-10" /> {/* Spacer for centering title */}
      </div>

      {loadingFaqs && (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Card key={`skeleton-faq-topic-${i}`} className="shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-1/2 rounded" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-full rounded" />
                <Skeleton className="h-10 w-full rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loadingFaqs && Object.keys(groupedFaqs).length === 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{isClient ? t('faqTitle') : 'FAQs'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{isClient ? t('noFaqsAvailable') : 'No FAQs available.'}</p>
          </CardContent>
        </Card>
      )}

      {!loadingFaqs && Object.entries(groupedFaqs).map(([topic, faqs]) => (
        <Card key={topic} className="shadow-lg">
          <CardHeader className="flex flex-row items-center">
            {getTopicIcon(topic)}
            <CardTitle className="text-lg">{topic}</CardTitle>
          </CardHeader>
          <CardContent>
            {faqs.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem value={faq.id} key={faq.id}>
                    <AccordionTrigger className="text-left hover:no-underline text-sm">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-sm text-muted-foreground">{isClient ? t('noFaqsAvailable') : 'No FAQs available for this topic.'}</p>
            )}
          </CardContent>
        </Card>
      ))}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{isClient ? t('otherInformationTitle') : 'Other Information'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center p-3 hover:bg-muted/50 rounded-md transition-colors cursor-pointer" onClick={() => alert((isClient ? t('termsOfService') : 'Terms of Service') + ' clicked (placeholder)')}>
            <FileText className="h-5 w-5 text-primary mr-3" />
            <span className="text-sm font-medium">{isClient ? t('termsOfService') : 'Terms of Service'}</span>
          </div>
           <div className="flex items-center p-3 hover:bg-muted/50 rounded-md transition-colors cursor-pointer" onClick={() => alert((isClient ? t('privacyPolicy') : 'Privacy Policy') + ' clicked (placeholder)')}>
            <ShieldCheck className="h-5 w-5 text-primary mr-3" />
            <span className="text-sm font-medium">{isClient ? t('privacyPolicy') : 'Privacy Policy'}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{isClient ? t('contactSupportTitle') : 'Contact Support'}</CardTitle>
          <CardDescription>{isClient ? t('contactSupportSubtitle') : 'Contact us for any issues or check FAQs.'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold">{isClient ? t('emailSupportTitle') : 'Email Support'}</h3>
              <p className="text-muted-foreground">{isClient ? t('emailSupportDescription') : 'Send us your questions or suggestions.'}</p>
              <a href="mailto:support@mongolapp.com" className="text-primary hover:underline">
                support@mongolapp.com
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold">{isClient ? t('phoneSupportTitle') : 'Phone Support'}</h3>
              <p className="text-muted-foreground">{isClient ? t('phoneSupportDescription') : 'Call us for urgent help.'}</p>
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
