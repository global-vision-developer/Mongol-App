
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

// Захиалга бүрийг харуулах картын компонент
const OrderCard: React.FC<OrderCardProps> = ({ order, onDeleteRequest }) => {
  const { t } = useTranslation();
  const [detailsVisible, setDetailsVisible] = useState(false);

  // Захиалгын статусыг орчуулах функц
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

  // Vercel-ийн Image Optimization-г шаардлагагүй тохиолдолд (жишээ нь, data URI) ашиглахгүй байх
  const qrImageShouldUnoptimize = order.wechatQrImageUrl?.startsWith('data:') || order.wechatQrImageUrl?.includes('lh3.googleusercontent.com');
  const itemImageShouldUnoptimize = order.imageUrl?.startsWith('data:') || order.imageUrl?.includes('lh3.googleusercontent.com');

  return (
    <Card className={cn("shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1")}>
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
        {order.imageUrl ? (
          <Image
            src={order.imageUrl}
            alt={order.serviceName || t('serviceUnnamed')}
            width={64}
            height={64}
            className="h-16 w-16 rounded-md object-cover bg-muted"
            data-ai-hint={order.dataAiHint || "service item"}
            unoptimized={itemImageShouldUnoptimize}
          />
        ) : (
          <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
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
        
        {/* Хэрэглэгч дэлгэрэнгүйг харах товч дарсан бол холбоо барих мэдээллийг харуулах */}
        {detailsVisible && (
          <div className="mt-3 pt-3 border-t">
              <h4 className="text-sm font-semibold text-foreground mb-1.5">{t('contactInformation')}</h4>
              
              {order.mongolianPhoneNumber && (
                  <div className="flex items-center text-sm mb-1">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{t('mongolianPhoneNumberLabel')}: {String(order.mongolianPhoneNumber)}</span>
                  </div>
              )}
              
              {order.chinaPhoneNumber && (
                  <div className="flex items-center text-sm mb-1">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{t('translatorContactPhoneLabel')}: {String(order.chinaPhoneNumber)}</span>
                  </div>
              )}
              
              {order.wechatId && (
                  <div className="flex items-center text-sm mb-1">
                      <MessageCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{t('translatorContactWeChatLabel')}: {String(order.wechatId)}</span>
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
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t flex justify-between items-center">
         <div>
            {!order.contactInfoRevealed && <p className="text-xs text-muted-foreground">{t('contactInfoPending')}</p>}
         </div>
         <div className="flex items-center gap-2">
            {order.contactInfoRevealed && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5"
                onClick={() => setDetailsVisible(!detailsVisible)}
              >
                {detailsVisible ? t('hideDetails') : t('viewDetails')}
              </Button>
            )}
            <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/80 h-8 w-8"
                onClick={() => onDeleteRequest(order.id)}
                aria-label={t('deleteOrderTitle')}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
         </div>
      </CardFooter>
    </Card>
  );
};


export default function OrdersPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  // Төлөвүүдийг тодорхойлох
  const [orders, setOrders] = useState<AppOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<ItemType | 'flights'>("flights");

  // Устгах үйлдлийг баталгаажуулах alert dialog-ийн төлөвүүд
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedOrderIdForDeletion, setSelectedOrderIdForDeletion] = useState<string | null>(null);

  // Табуудын мэдээлэл
  const tabCategories: { value: ItemType | 'flights'; labelKey: string, icon: React.ElementType }[] = [
    { value: "flights", labelKey: "flights", icon: Plane },
    { value: "hotel", labelKey: "hotels", icon: BedDouble },
    { value: "translator", labelKey: "translators", icon: Users },
    { value: "wechat", labelKey: "wechatOrdersTab", icon: Smartphone },
  ];

  // Хэрэглэгчийн захиалгуудыг Firestore-оос татах useEffect
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

    // onSnapshot ашиглан бодит цагт өөрчлөлтийг сонсох
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: AppOrder[] = snapshot.docs.map(doc => {
        const data = doc.data() as DocumentData;
        
        // Холбоо барих мэдээлэл нээгдсэн эсэхийг шалгах
        const isContactInfoRevealed = data.contactInfoRevealed === true || data.status === 'contact_revealed' || data.status === 'confirmed' || data.status === 'completed';
        
        return {
          id: doc.id,
          userId: data.userId,
          serviceType: data.serviceType as ItemType,
          serviceId: data.serviceId,
          serviceName: data.serviceName || t('serviceUnnamed'),
          orderDate: data.orderDate as Timestamp, 
          status: data.status as AppOrder['status'], 
          amount: data.amount, 
          contactInfoRevealed: isContactInfoRevealed,
          imageUrl: data.imageUrl || null,
          dataAiHint: data.dataAiHint || null,
          mongolianPhoneNumber: data.mongolianPhoneNumber,
          chinaPhoneNumber: data.chinaPhoneNumber,        
          wechatId: data.wechatId,                          
          wechatQrImageUrl: data.wechatQrImageUrl,
        } as AppOrder;
      });
      setOrders(fetchedOrders);
      setLoadingOrders(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoadingOrders(false);
    });

    return () => unsubscribe(); // Компонент unmount болоход listener-г цэвэрлэх
  }, [user, authLoading, t]);

  // Устгах хүсэлт эхлүүлэх
  const handleDeleteRequest = (orderId: string) => {
    setSelectedOrderIdForDeletion(orderId);
    setIsAlertOpen(true);
  };

  // Захиалгыг устгах функц
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

  // Сонгогдсон таб-д харгалзах захиалгуудыг шүүх
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'flights') return order.serviceType === 'flight';
    return order.serviceType === activeTab;
  });

  // Захиалга байхгүй үед харуулах UI
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

  // Хэрэглэгч нэвтрэх үед эсвэл мэдээлэл ачааллаж байхад харуулах skeleton UI
  if (authLoading || !user) {
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
