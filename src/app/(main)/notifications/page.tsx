
"use client";
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { NotificationItem as NotificationItemType } from '@/types';
import { format } from 'date-fns';
import { Bell, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, DocumentData, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [userNotifications, setUserNotifications] = useState<NotificationItemType[]>([]);
  const [globalNotifications, setGlobalNotifications] = useState<NotificationItemType[]>([]);
  const [loadingUserNotifications, setLoadingUserNotifications] = useState(true);
  const [loadingGlobalNotifications, setLoadingGlobalNotifications] = useState(true);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedNotificationIdForDeletion, setSelectedNotificationIdForDeletion] = useState<string | null>(null);


  useEffect(() => {
    if (authLoading) {
      setLoadingUserNotifications(true);
      setLoadingGlobalNotifications(true);
      return;
    }

    // Fetch Global Notifications
    const fetchGlobalNotifications = async () => {
      setLoadingGlobalNotifications(true);
      try {
        const globalNotificationsColRef = collection(db, "notifications");
        const qGlobal = query(globalNotificationsColRef, orderBy("date", "desc"));
        
        const unsubscribeGlobal = onSnapshot(qGlobal, (snapshot) => {
            const items: NotificationItemType[] = snapshot.docs.map(doc => {
            const data = doc.data() as DocumentData;
            let dateValue: Date | Timestamp = data.date;
            if (data.date && typeof data.date.seconds === 'number' && typeof data.date.nanoseconds === 'number') {
                dateValue = new Timestamp(data.date.seconds, data.date.nanoseconds);
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
                itemType: data.itemType || 'general',
                isGlobal: true,
            } as NotificationItemType;
            });
            setGlobalNotifications(items);
            setLoadingGlobalNotifications(false);
        }, (error) => {
            console.error("Error fetching global notifications:", error);
            setLoadingGlobalNotifications(false);
        });
        return unsubscribeGlobal;
      } catch (error) {
        console.error("Error setting up global notifications listener:", error);
        setLoadingGlobalNotifications(false);
        return () => {}; 
      }
    };
    
    const unsubGlobal = fetchGlobalNotifications();


    if (!user) {
      setUserNotifications([]);
      setLoadingUserNotifications(false);
       return () => {
        if (typeof unsubGlobal === 'function') unsubGlobal();
      };
    }

    // Fetch User-Specific Notifications
    setLoadingUserNotifications(true);
    const userNotificationsColRef = collection(db, "users", user.uid, "notifications");
    const qUser = query(userNotificationsColRef, orderBy("date", "desc"));

    const unsubscribeUser = onSnapshot(qUser, (snapshot) => {
      const items: NotificationItemType[] = snapshot.docs.map(doc => {
        const data = doc.data() as DocumentData;
        let dateValue: Date | Timestamp = data.date;
         if (data.date && typeof data.date.seconds === 'number' && typeof data.date.nanoseconds === 'number') {
            dateValue = new Timestamp(data.date.seconds, data.date.nanoseconds);
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
          itemType: data.itemType || 'general',
          isGlobal: false,
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
      if (typeof unsubGlobal === 'function') unsubGlobal();
    };
  }, [user, authLoading]);

  const handleDeleteNotification = async () => {
    if (!user || !selectedNotificationIdForDeletion) {
      toast({
        title: t('error'),
        description: t('notificationDeletionErrorGeneric'),
        variant: "destructive",
      });
      return;
    }

    try {
      const notificationDocRef = doc(db, "users", user.uid, "notifications", selectedNotificationIdForDeletion);
      await deleteDoc(notificationDocRef);
      toast({
        title: t('notificationDeletedSuccessTitle'),
        description: t('notificationDeletedSuccessDesc'),
      });
    } catch (error) {
      console.error("Error deleting notification: ", error);
      toast({
        title: t('error'),
        description: t('notificationDeletionErrorFirebase'),
        variant: "destructive",
      });
    } finally {
      setSelectedNotificationIdForDeletion(null);
      setIsAlertOpen(false);
    }
  };

  const combinedNotifications = [...globalNotifications, ...userNotifications].sort((a, b) => {
    const dateA = a.date instanceof Timestamp ? a.date.toMillis() : (a.date instanceof Date ? a.date.getTime() : 0);
    const dateB = b.date instanceof Timestamp ? b.date.toMillis() : (b.date instanceof Date ? b.date.getTime() : 0);
    return dateB - dateA; // Sort descending
  });

  const isLoading = authLoading || loadingUserNotifications || loadingGlobalNotifications;

  if (isLoading && combinedNotifications.length === 0) {
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
                  <img src={item.imageUrl} alt={t(item.titleKey, item.descriptionPlaceholders)} data-ai-hint={item.dataAiHint || "notification image"} className="h-16 w-16 rounded-md object-cover"/>
                )}
                <div className="flex-1">
                  <CardTitle className="text-md font-semibold mb-1">{t(item.titleKey, item.descriptionPlaceholders)}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                    {t(item.descriptionKey, item.descriptionPlaceholders)}
                  </CardDescription>
                </div>
                {!item.isGlobal && !item.read && (
                   <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1 shrink-0" />
                )}
              </CardHeader>
              <CardContent className="pt-0 pb-3 flex justify-between items-center">
                 <p className="text-xs text-muted-foreground">
                    {item.date ? format(item.date instanceof Timestamp ? item.date.toDate() : (item.date instanceof Date ? item.date : new Date(item.date as string)), 'yyyy-MM-dd HH:mm') : t('n_a')}
                  </p>
                <div className="flex items-center gap-2">
                    {item.link && (
                    <Button variant="link" size="sm" asChild className="p-0 h-auto text-primary hover:text-primary/80">
                        <a href={item.link} target="_blank" rel="noopener noreferrer">{t('viewDetails')}</a>
                    </Button>
                    )}
                    {!item.isGlobal && user && (
                        <AlertDialog open={isAlertOpen && selectedNotificationIdForDeletion === item.id} onOpenChange={(open) => {
                            if (!open) {
                                setSelectedNotificationIdForDeletion(null);
                            }
                            setIsAlertOpen(open);
                        }}>
                            <AlertDialogTrigger asChild>
                                <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive/80"
                                onClick={() => {
                                    setSelectedNotificationIdForDeletion(item.id);
                                    setIsAlertOpen(true);
                                }}
                                >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">{t('deleteNotification')}</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>{t('confirmDeletionTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('confirmDeletionNotificationDesc')}
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>{t('cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteNotification}>
                                    {t('deleteButtonConfirm')}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Placeholder translation keys (add these to your LanguageContext)
// mn: {
//   deleteNotification: "Мэдэгдэл устгах",
//   confirmDeletionTitle: "Устгахдаа итгэлтэй байна уу?",
//   confirmDeletionNotificationDesc: "Энэ мэдэгдлийг устгах уу? Энэ үйлдлийг буцаах боломжгүй.",
//   deleteButtonConfirm: "Устгах",
//   notificationDeletedSuccessTitle: "Амжилттай",
//   notificationDeletedSuccessDesc: "Мэдэгдэл устгагдлаа.",
//   notificationDeletionErrorGeneric: "Мэдэгдэл устгахад алдаа гарлаа.",
//   notificationDeletionErrorFirebase: "Firestore-оос мэдэгдэл устгахад алдаа гарлаа.",
// }
// cn: {
//   deleteNotification: "删除通知",
//   confirmDeletionTitle: "确认删除吗？",
//   confirmDeletionNotificationDesc: "您确定要删除此通知吗？此操作无法撤销。",
//   deleteButtonConfirm: "删除",
//   notificationDeletedSuccessTitle: "成功",
//   notificationDeletedSuccessDesc: "通知已删除。",
//   notificationDeletionErrorGeneric: "删除通知时出错。",
//   notificationDeletionErrorFirebase: "从 Firestore 删除通知时出错。",
// }

    