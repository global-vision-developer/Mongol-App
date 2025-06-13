
"use client";
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { NotificationItem as NotificationItemType } from '@/types';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItemType[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoadingNotifications(true);
      return;
    }
    if (!user) {
      setNotifications([]);
      setLoadingNotifications(false);
      return;
    }

    setLoadingNotifications(true);
    const notificationsColRef = collection(db, "users", user.uid, "notifications");
    const q = query(notificationsColRef, orderBy("date", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: NotificationItemType[] = snapshot.docs.map(doc => {
        const data = doc.data() as DocumentData;
        let dateValue: string | Timestamp = data.date;
        
        // Ensure date is a string for format function, converting from Firestore Timestamp if necessary
        if (data.date instanceof Timestamp) {
          dateValue = data.date.toDate().toISOString();
        } else if (data.date && typeof data.date.seconds === 'number') {
           // Handle plain object Firestore Timestamp representation
          dateValue = new Timestamp(data.date.seconds, data.date.nanoseconds).toDate().toISOString();
        }


        return {
          id: doc.id,
          titleKey: data.titleKey || 'unknownNotificationTitle',
          descriptionKey: data.descriptionKey || 'unknownNotificationDescription',
          descriptionPlaceholders: data.descriptionPlaceholders || {},
          date: dateValue, // Keep as string or Timestamp for flexibility, handle in render
          read: data.read || false,
          imageUrl: data.imageUrl,
          dataAiHint: data.dataAiHint,
          link: data.link,
          itemType: data.itemType,
        } as NotificationItemType;
      });
      setNotifications(items);
      setLoadingNotifications(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoadingNotifications(false);
      // Optionally show a toast for error fetching notifications
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  if (authLoading || (!user && !authLoading) || (user && loadingNotifications)) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-headline font-semibold">{t('myNotifications')}</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={`skeleton-notification-${i}`} className="shadow-md">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
              </CardHeader>
              <CardContent className="pt-0 pb-3 flex justify-between items-center">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-6 w-1/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">{t('myNotifications')}</h1>
      {notifications.length === 0 ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
               {t('myNotifications')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('noNotificationsPlaceholder')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((item) => (
            <Card key={item.id} className={`shadow-md hover:shadow-lg transition-shadow duration-300 ${item.read ? 'bg-card' : 'bg-primary/5 border-primary/20'}`}>
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={t(item.titleKey)} data-ai-hint={item.dataAiHint || "notification image"} className="h-16 w-16 rounded-md object-cover"/>
                )}
                <div className="flex-1">
                  <CardTitle className="text-md font-semibold mb-1">{t(item.titleKey)}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                    {t(item.descriptionKey, item.descriptionPlaceholders)}
                  </CardDescription>
                </div>
                {!item.read && (
                   <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1 shrink-0" />
                )}
              </CardHeader>
              <CardContent className="pt-0 pb-3 flex justify-between items-center">
                 <p className="text-xs text-muted-foreground">
                    {item.date ? format(item.date instanceof Timestamp ? item.date.toDate() : new Date(item.date as string), 'yyyy-MM-dd HH:mm') : t('n_a')}
                  </p>
                {item.link && (
                  <Button variant="link" size="sm" asChild className="p-0 h-auto text-primary hover:text-primary/80">
                    <a href={item.link} target="_blank" rel="noopener noreferrer">{t('viewDetails')}</a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

    