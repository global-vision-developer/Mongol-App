
"use client";
import React from 'react'; // Added import for React
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Plane, BedDouble, Users, Smartphone, ShoppingCart, FactoryIcon, HospitalIcon, Landmark, Briefcase, ShoppingBag } from 'lucide-react'; // Added ShoppingBag
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp, DocumentData } from 'firebase/firestore';
import type { Order as AppOrder, ItemType } from '@/types';
import Image from 'next/image';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const OrderCard: React.FC<{ order: AppOrder }> = ({ order }) => {
  const { t } = useTranslation();

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

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
        {order.imageUrl && (
          <Image
            src={order.imageUrl}
            alt={order.serviceName || t('serviceUnnamed')}
            width={64}
            height={64}
            className="h-16 w-16 rounded-md object-cover bg-muted"
            data-ai-hint={order.dataAiHint || "service item"}
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
          {order.amount && <p>{t('orderAmount')}: <span className="font-medium text-foreground">{order.amount}</span></p>}
        </div>
      </CardContent>
      {/* Add footer for actions if needed, e.g., view details for specific order types */}
    </Card>
  );
};


export default function OrdersPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<AppOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<ItemType | 'flights'>("flights");

  const tabCategories: { value: ItemType | 'flights'; labelKey: string, icon: React.ElementType }[] = [
    { value: "flights", labelKey: "flights", icon: Plane },
    { value: "hotel", labelKey: "hotels", icon: BedDouble },
    { value: "translator", labelKey: "translators", icon: Users },
    { value: "wechat", labelKey: "wechatOrdersTab", icon: Smartphone },
    { value: "market", labelKey: "marketsOrdersTab", icon: ShoppingCart },
    { value: "factory", labelKey: "factoriesOrdersTab", icon: FactoryIcon },
    { value: "hospital", labelKey: "hospitalsOrdersTab", icon: HospitalIcon },
    { value: "embassy", labelKey: "embassiesOrdersTab", icon: Landmark },
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
    // The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/setgelzuin-app/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9zZXRnZWx6dWluLWFwcC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvb3JkZXJzL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCW9yZGVyRGF0ZRACGgwKCF9fbmFtZV9fEAI
    const q = query(ordersColRef, where("userId", "==", user.uid), orderBy("orderDate", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: AppOrder[] = snapshot.docs.map(doc => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          ...data,
          serviceType: data.serviceType as ItemType,
          orderDate: data.orderDate as Timestamp, // Assuming it's always a Timestamp
        } as AppOrder;
      });
      setOrders(fetchedOrders);
      setLoadingOrders(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoadingOrders(false);
      // Optionally show a toast for error fetching orders
    });

    return () => unsubscribe();
  }, [user, authLoading]);


  const filteredOrders = orders.filter(order => {
    if (activeTab === 'flights') return order.serviceType === 'flight'; // Assuming 'flight' is an ItemType or special case
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
        <h1 className="text-3xl font-headline font-semibold">{t('myOrders')}</h1>
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
      <h1 className="text-3xl font-headline font-semibold">{t('myOrders')}</h1>

      <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as ItemType | 'flights')} className="w-full">
        <TabsList className="grid w-full grid-cols-4"> {/* Kept grid-cols-4, will wrap to 2 rows */}
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
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
