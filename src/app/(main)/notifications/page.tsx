
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
import { collection, query, orderBy, onSnapshot, DocumentData, Timestamp, getDocs } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [userNotifications, setUserNotifications] = useState<NotificationItemType[]>([]);
  const [globalNotifications, setGlobalNotifications] = useState<NotificationItemType[]>([]);
  const [loadingUserNotifications, setLoadingUserNotifications] = useState(true);
  const [loadingGlobalNotifications, setLoadingGlobalNotifications] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoadingUserNotifications(true);
      setLoadingGlobalNotifications(true);
      return;
    }

    // Fetch Global Notifications (run once or listen for changes)
    const fetchGlobalNotifications = async () => {
      setLoadingGlobalNotifications(true);
      try {
        const globalNotificationsColRef = collection(db, "notifications");
        const qGlobal = query(globalNotificationsColRef, orderBy("date", "desc"));
        // Using getDocs for global notifications as they might not change frequently for a single user session
        // Or use onSnapshot if real-time updates for global notifications are desired
        const snapshot = await getDocs(qGlobal);
        const items: NotificationItemType[] = snapshot.docs.map(doc => {
          const data = doc.data() as DocumentData;
          let dateValue: string | Timestamp = data.date;
          if (data.date instanceof Timestamp) {
            dateValue = data.date.toDate().toISOString();
          } else if (data.date && typeof data.date.seconds === 'number') {
            dateValue = new Timestamp(data.date.seconds, data.date.nanoseconds).toDate().toISOString();
          }
          return {
            id: doc.id,
            titleKey: data.titleKey || 'unknownNotificationTitle',
            descriptionKey: data.descriptionKey || 'unknownNotificationDescription',
            descriptionPlaceholders: data.descriptionPlaceholders || {},
            date: dateValue,
            read: data.read || false, // For global, 'read' might be managed differently or ignored on client
            imageUrl: data.imageUrl,
            dataAiHint: data.dataAiHint,
            link: data.link,
            itemType: data.itemType,
            isGlobal: true, // Mark as global
          } as NotificationItemType;
        });
        setGlobalNotifications(items);
      } catch (error) {
        console.error("Error fetching global notifications:", error);
      } finally {
        setLoadingGlobalNotifications(false);
      }
    };
    fetchGlobalNotifications();


    if (!user) {
      setUserNotifications([]);
      setLoadingUserNotifications(false);
      return; // Skip user notifications if no user
    }

    // Fetch User-Specific Notifications
    setLoadingUserNotifications(true);
    const userNotificationsColRef = collection(db, "users", user.uid, "notifications");
    const qUser = query(userNotificationsColRef, orderBy("date", "desc"));

    const unsubscribeUser = onSnapshot(qUser, (snapshot) => {
      const items: NotificationItemType[] = snapshot.docs.map(doc => {
        const data = doc.data() as DocumentData;
        let dateValue: string | Timestamp = data.date;
        if (data.date instanceof Timestamp) {
          dateValue = data.date.toDate().toISOString();
        } else if (data.date && typeof data.date.seconds === 'number') {
          dateValue = new Timestamp(data.date.seconds, data.date.nanoseconds).toDate().toISOString();
        }
        return {
          id: doc.id,
          titleKey: data.titleKey || 'unknownNotificationTitle',
          descriptionKey: data.descriptionKey || 'unknownNotificationDescription',
          descriptionPlaceholders: data.descriptionPlaceholders || {},
          date: dateValue,
          read: data.read || false,
          imageUrl: data.imageUrl,
          dataAiHint: data.dataAiHint,
          link: data.link,
          itemType: data.itemType,
          isGlobal: false, // Mark as not global
        } as NotificationItemType;
      });
      setUserNotifications(items);
      setLoadingUserNotifications(false);
    }, (error) => {
      console.error("Error fetching user notifications:", error);
      setLoadingUserNotifications(false);
    });

    return () => {
      unsubscribeUser();
      // No need to unsubscribe from getDocs
    };
  }, [user, authLoading]);

  const combinedNotifications = [...globalNotifications, ...userNotifications].sort((a, b) => {
    const dateA = a.date instanceof Timestamp ? a.date.toMillis() : new Date(a.date as string).getTime();
    const dateB = b.date instanceof Timestamp ? b.date.toMillis() : new Date(b.date as string).getTime();
    return dateB - dateA; // Sort descending
  });

  const isLoading = authLoading || loadingUserNotifications || loadingGlobalNotifications;

  if (isLoading && combinedNotifications.length === 0) { // Show skeletons only if no data yet
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
      {combinedNotifications.length === 0 && !isLoading ? (
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
          {combinedNotifications.map((item) => (
            <Card 
              key={item.id + (item.isGlobal ? '-global' : '-user')} 
              className={`shadow-md hover:shadow-lg transition-shadow duration-300 ${!item.isGlobal && item.read ? 'bg-card' : (!item.isGlobal && !item.read ? 'bg-primary/5 border-primary/20' : 'bg-card')}`}
            >
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
                {/* Show read indicator only for non-global user notifications */}
                {!item.isGlobal && !item.read && (
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

    