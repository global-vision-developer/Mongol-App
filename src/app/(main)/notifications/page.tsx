
"use client";
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NotificationItem } from '@/types'; 
import { format } from 'date-fns'; 

export default function NotificationsPage() {
  const { t } = useTranslation();
  
  const notifications: NotificationItem[] = []; // Made this array empty

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
                  <CardDescription className="text-sm text-muted-foreground line-clamp-2">{t(item.descriptionKey)}</CardDescription>
                </div>
                {!item.read && (
                   <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1 shrink-0" />
                )}
              </CardHeader>
              <CardContent className="pt-0 pb-3 flex justify-between items-center">
                 <p className="text-xs text-muted-foreground">
                    {format(new Date(item.date), 'yyyy-MM-dd HH:mm')}
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
