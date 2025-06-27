
"use client";
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { NotificationItem as NotificationItemType } from '@/types';
import { format } from 'date-fns';
import { Bell, Trash2, Phone, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  // Төлөвүүдийг тодорхойлох
  const [userNotifications, setUserNotifications] = useState<NotificationItemType[]>([]); // Хэрэглэгчийн хувийн мэдэгдэл
  const [globalNotifications, setGlobalNotifications] = useState<NotificationItemType[]>([]); // Бүх хэрэглэгчид харагдах мэдэгдэл
  const [loadingUserNotifications, setLoadingUserNotifications] = useState(true);
  const [loadingGlobalNotifications, setLoadingGlobalNotifications] = useState(true);

  // Мэдэгдэл устгах үеийн төлөвүүд
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedNotificationIdForDeletion, setSelectedNotificationIdForDeletion] = useState<string | null>(null);

  // Компонент ачаалахад Firebase-ээс мэдэгдлүүдийг татах useEffect
  useEffect(() => {
    // Хэрэглэгчийн мэдээлэл ачааллаж байвал хүлээх
    if (authLoading) {
      setLoadingUserNotifications(true);
      setLoadingGlobalNotifications(true);
      return;
    }

    // Глобал (бүх хэрэглэгчийн) мэдэгдлийг татах функц
    const fetchGlobalNotifications = async () => {
      setLoadingGlobalNotifications(true);
      try {
        const globalNotificationsColRef = collection(db, "notifications");
        const qGlobal = query(globalNotificationsColRef, orderBy("date", "desc"));
        
        // onSnapshot ашиглан бодит цагт өөрчлөлтийг сонсох
        const unsubscribeGlobal = onSnapshot(qGlobal, (snapshot) => {
            const items: NotificationItemType[] = snapshot.docs.map(doc => {
            const data = doc.data() as DocumentData;
            // Firestore-ийн Timestamp-г Date object болгох
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
                isGlobal: true, // Энэ нь глобал мэдэгдэл гэдгийг илтгэнэ
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

    // Хэрэглэгч нэвтрээгүй бол зөвхөн глобал мэдэгдлийг харуулаад буцах
    if (!user) {
      setUserNotifications([]);
      setLoadingUserNotifications(false);
       return () => {
        if (typeof unsubGlobal === 'function') unsubGlobal();
      };
    }

    // Хэрэглэгчийн хувийн мэдэгдлийг татах
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
          isGlobal: false, // Энэ нь хувийн мэдэгдэл
        } as NotificationItemType;
      });
      setUserNotifications(items);
      setLoadingUserNotifications(false);
    }, (error) => {
      console.error("Error fetching user notifications:", error);
      setLoadingUserNotifications(false);
    });

    // Компонент unmount хийгдэхэд listener-уудыг цэвэрлэх
    return () => {
      unsubscribeUser();
      if (typeof unsubGlobal === 'function') unsubGlobal();
    };
  }, [user, authLoading]);

  // Мэдэгдэл устгах функц
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

  // Глобал болон хувийн мэдэгдлийг нэгтгээд огноогоор нь эрэмбэлэх
  const combinedNotifications = [...globalNotifications, ...userNotifications].sort((a, b) => {
    const dateA = a.date instanceof Timestamp ? a.date.toMillis() : (a.date instanceof Date ? a.date.getTime() : 0);
    const dateB = b.date instanceof Timestamp ? b.date.toMillis() : (b.date instanceof Date ? b.date.getTime() : 0);
    return dateB - dateA; // Буурах дарааллаар
  });

  const isLoading = loadingUserNotifications || loadingGlobalNotifications;

  // Ачааллаж байх үед skeleton UI харуулах
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-headline font-semibold text-center">{t('notifications')}</h1>
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
      <h1 className="text-2xl font-headline font-semibold text-center">{t('notifications')}</h1>
      {/* Мэдэгдэл байхгүй бол харуулах хэсэг */}
      {combinedNotifications.length === 0 && !isLoading ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
               {t('notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t('noNotificationsPlaceholder')}</p>
          </CardContent>
        </Card>
      ) : (
        // Мэдэгдлийн жагсаалтыг харуулах
        <div className="space-y-4">
          {combinedNotifications.map((item) => (
            <Card 
              key={item.id + (item.isGlobal ? '-global' : '-user')} 
              // Уншаагүй мэдэгдлийг ялгаж харуулах
              className={cn(
                "shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1",
                !item.isGlobal && item.read ? 'bg-card' : (!item.isGlobal && !item.read ? 'bg-primary/5 border-primary/20' : 'bg-card')
              )}
            >
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={t(item.titleKey, item.descriptionPlaceholders)} data-ai-hint={item.dataAiHint || "notification image"} className="h-16 w-16 rounded-md object-cover"/>
                )}
                <div className="flex-1">
                  <CardTitle className="text-md font-semibold mb-1">{t(item.titleKey, item.descriptionPlaceholders)}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {t(item.descriptionKey, item.descriptionPlaceholders)}
                  </CardDescription>
                  {/* Орчуулагчийн холбоо барих мэдээлэл байвал харуулах */}
                  {item.itemType === 'translator' && item.descriptionPlaceholders?.translatorPhoneNumber && (
                    <div className="mt-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Phone className="h-3.5 w-3.5 mr-1.5" />
                        <span>{t('translatorContactPhoneLabel')}: {item.descriptionPlaceholders.translatorPhoneNumber}</span>
                      </div>
                    </div>
                  )}
                   {item.itemType === 'translator' && item.descriptionPlaceholders?.translatorWeChatId && (
                     <div className="mt-0.5 text-xs text-muted-foreground">
                        <div className="flex items-center">
                            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                            <span>{t('translatorContactWeChatLabel')}: {item.descriptionPlaceholders.translatorWeChatId}</span>
                        </div>
                     </div>
                   )}
                </div>
                {/* Уншаагүй бол цэнхэр цэг харуулах */}
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
                    {/* Глобал биш бол устгах товч харуулах */}
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
