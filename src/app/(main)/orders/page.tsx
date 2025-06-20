
"use client";
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Plane, BedDouble, Users, Smartphone, ShoppingBag, Phone, MessageCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp, DocumentData, doc, deleteDoc } from 'firebase/firestore';
import type { Order as AppOrder, ItemType } from '@/types';
import Image from 'next/image';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
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
import { useToast } from '@/hooks/use-toast';


interface OrderCardProps {
  order: AppOrder;
  onDeleteRequest: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onDeleteRequest }) => {
  const { t } = useTranslation();
  const [showContactInfo, setShowContactInfo] = useState(false);
  const { toast } = useToast(); // Toast might be used for specific card actions later

  const getStatusTextKey = (status: AppOrder['status']) => {
    switch (status) {
      case 'pending_confirmation': return 'orderStatusPendingConfirmation';
      case 'confirmed': return 'orderStatusConfirmed';
      case 'contact_revealed': return 'orderStatusContactRevealed';
      case 'pending_payment': return 'orderStatusPendingPayment';
      case 'cancelled': return 'orderStatusCancelled';
      case 'completed': return 'orderStatusCompleted';
      default: return status;
    }
  };

  const qrImageShouldUnoptimize = order.wechatQrImageUrl?.startsWith('data:') || order.wechatQrImageUrl?.includes('lh3.googleusercontent.com');

  return (
    <Card className={cn("shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1")}>
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
        {order.imageUrl && (
          <Image
            src={order.imageUrl}
            alt={order.serviceName || t('serviceUnnamed')}
            width={64}
            height={64}
            className="h-16 w-16 rounded-md object-cover bg-muted"
            data-ai-hint={order.dataAiHint || "service item"}
            unoptimized={order.imageUrl.startsWith('data:') || order.imageUrl.includes('lh3.googleusercontent.com')}
          />
        )}
        {!order.imageUrl && <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center"><ShoppingBag className="h-8 w-8 text-muted-foreground" /></div>}
        <div className="flex-1">
          <CardTitle className="text-md font-semibold mb-1">{order.serviceName || t('serviceUnnamed')}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {t('orderDate')}: {order.orderDate instanceof Timestamp ? format(order.orderDate.toDate(), 'yyyy-MM-dd HH:mm') : t('n_a')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-sm text-muted-foreground">
          <p>{t('status')}: <span className="font-medium text-foreground">{t(getStatusTextKey(order.status))}</span></p>
          {order.amount != null && <p>{t('orderAmount')}: <span className="font-medium text-foreground">{order.amount}</span></p>}
        </div>
        {order.contactInfoRevealed && (
          <div className="mt-3 pt-3 border-t">
            {!showContactInfo ? (
              <Button onClick={() => setShowContactInfo(true)} size="sm" className="w-full mt-2">
                {t('viewContactInfoButton')}
              </Button>
            ) : (
              <>
                <h4 className="text-sm font-semibold text-foreground mb-1.5">{t('contactInformation')}</h4>
                {order.mongolianPhoneNumber && (
                  <div className="flex items-center text-sm mb-1">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{t('mongolianPhoneNumberLabel')}: {order.mongolianPhoneNumber}</span>
                  </div>
                )}
                {order.chinaPhoneNumber && (
                  <div className="flex items-center text-sm mb-1">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{t('translatorContactPhoneLabel')}: {order.chinaPhoneNumber}</span>
                  </div>
                )}
                {order.wechatId && (
                  <div className="flex items-center text-sm mb-1">
                    <MessageCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{t('translatorContactWeChatLabel')}: {order.wechatId}</span>
                  </div>
                )}
                {order.wechatQrImageUrl && (
                  <div className="mt-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{t('translatorContactWeChatQrLabel')}:</p>
                    <Image
                      src={order.wechatQrImageUrl}
                      alt={t('translatorContactWeChatQrLabel')}
                      width={100}
                      height={100}
                      className="rounded-md border bg-muted"
                      data-ai-hint="qr code"
                      unoptimized={qrImageShouldUnoptimize}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t flex justify-end">
         <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive/80 h-8 w-8"
            onClick={() => onDeleteRequest(order.id)}
            aria-label={t('deleteNotification')} // Re-use translation or add a new one
          >
            <Trash2 className="h-4 w-4" />
          </Button>
      </CardFooter>
    </Card>
  );
};


export default function OrdersPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<AppOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<ItemType | 'flights'>("flights");

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedOrderIdForDeletion, setSelectedOrderIdForDeletion] = useState<string | null>(null);


  const tabCategories: { value: ItemType | 'flights'; labelKey: string, icon: React.ElementType }[] = [
    { value: "flights", labelKey: "flights", icon: Plane },
    { value: "hotel", labelKey: "hotels", icon: BedDouble },
    { value: "translator", labelKey: "translators", icon: Users },
    { value: "wechat", labelKey: "wechatOrdersTab", icon: Smartphone },
  ];

  useEffect(() => {
    if (authLoading) {
      setLoadingOrders(true);
      return;
    }
    if (!user) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);
    const ordersColRef = collection(db, "orders");
    const q = query(ordersColRef, where("userId", "==", user.uid), orderBy("orderDate", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: AppOrder[] = snapshot.docs.map(doc => {
        const data = doc.data() as DocumentData; 
        
        let finalWechatQrImageUrl: string | null = null;
        const rawWeChatImgArray = data['we-chat-img']; // Firestore field name
        if (Array.isArray(rawWeChatImgArray) && rawWeChatImgArray.length > 0) {
          const firstElement = rawWeChatImgArray[0];
          if (typeof firstElement === 'object' && firstElement !== null && typeof firstElement.imageUrl === 'string' && firstElement.imageUrl.trim() !== '') {
            finalWechatQrImageUrl = firstElement.imageUrl.trim();
          }
        }
        
        let mainImageUrl: string | null = null;
        if (data.imageUrl && typeof data.imageUrl === 'string' && data.imageUrl.trim() !== '') {
          mainImageUrl = data.imageUrl.trim();
        } else if (data['nuur-zurag-url'] && typeof data['nuur-zurag-url'] === 'string' && data['nuur-zurag-url'].trim() !== '') {
          mainImageUrl = data['nuur-zurag-url'].trim();
        }
        
        return {
          id: doc.id,
          userId: data.userId,
          serviceType: data.serviceType as ItemType,
          serviceId: data.serviceId,
          serviceName: data.serviceName || t('serviceUnnamed'),
          orderDate: data.orderDate as Timestamp, 
          status: data.status as AppOrder['status'], 
          amount: data.amount === undefined ? null : data.amount, // Ensure null if undefined
          contactInfoRevealed: data.contactInfoRevealed || false,
          imageUrl: mainImageUrl,
          dataAiHint: data.dataAiHint || null,
          mongolianPhoneNumber: data['phone-number'], // Direct assignment
          chinaPhoneNumber: data['china-number'], // Direct assignment
          wechatId: data['we-chat-id'], // Direct assignment
          wechatQrImageUrl: finalWechatQrImageUrl,
        } as AppOrder;
      });
      setOrders(fetchedOrders);
      setLoadingOrders(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoadingOrders(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, t]);

  const handleDeleteRequest = (orderId: string) => {
    setSelectedOrderIdForDeletion(orderId);
    setIsAlertOpen(true);
  };

  const handleDeleteOrder = async () => {
    if (!user || !selectedOrderIdForDeletion) {
      toast({
        title: t('error'),
        description: t('orderDeletionErrorGeneric'),
        variant: "destructive",
      });
      return;
    }

    try {
      const orderDocRef = doc(db, "orders", selectedOrderIdForDeletion);
      await deleteDoc(orderDocRef);
      toast({
        title: t('orderDeletedSuccessTitle'),
        description: t('orderDeletedSuccessDesc'),
      });
    } catch (error) {
      console.error("Error deleting order: ", error);
      toast({
        title: t('error'),
        description: t('orderDeletionErrorFirebase'),
        variant: "destructive",
      });
    } finally {
      setSelectedOrderIdForDeletion(null);
      setIsAlertOpen(false);
    }
  };


  const filteredOrders = orders.filter(order => {
    if (activeTab === 'flights') return order.serviceType === 'flight';
    return order.serviceType === activeTab;
  });

  const renderEmptyState = (categoryLabelKey: string) => (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="bg-muted rounded-full p-6 mb-6">
         {tabCategories.find(tc => tc.value === activeTab)?.icon ?
            React.createElement(tabCategories.find(tc => tc.value === activeTab)!.icon, {className: "h-16 w-16 text-muted-foreground"})
            : <ShoppingBag className="h-16 w-16 text-muted-foreground" />}
      </div>
      <p className="text-lg font-medium text-foreground">{t('ordersNoPurchasesMade')}</p>
      <p className="text-sm text-muted-foreground">{t(categoryLabelKey) + " " + t('noOrdersPlaceholder').toLowerCase()}</p>
    </div>
  );

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-headline font-semibold text-center">{t('orders')}</h1>
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          {[...Array(2)].map((_, i) => (
            <Card key={`skeleton-order-${i}`} className="shadow-md">
              <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-1">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-headline font-semibold text-center">{t('orders')}</h1>

      <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as ItemType | 'flights')} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {tabCategories.map(category => (
            <TabsTrigger key={category.value} value={category.value}>
              {t(category.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabCategories.map(category => (
          <TabsContent key={category.value} value={category.value} className="mt-4">
            {loadingOrders && user ? (
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                    {[...Array(2)].map((_, i) => (
                        <Card key={`skeleton-tab-order-${i}`} className="shadow-md">
                        <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
                            <Skeleton className="h-16 w-16 rounded-md" />
                            <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-full" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-1">
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-3 w-1/4" />
                        </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredOrders.length === 0 ? (
              renderEmptyState(category.labelKey)
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredOrders.map(order => (
                  <OrderCard key={order.id} order={order} onDeleteRequest={handleDeleteRequest} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteOrderTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteOrderConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder}>
              {t('deleteButtonLabel')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    

    