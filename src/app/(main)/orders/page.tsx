
"use client";
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button'; // Might be needed for filter actions later
import { CreditCard, ShoppingBag } from 'lucide-react'; // Using CreditCard for the new empty state icon

export default function OrdersPage() {
  const { t } = useTranslation();
  // Dummy data or fetch orders here
  const orders: any[] = []; // Replace with actual Order[] type from '@/types'

  const tabCategories = [
    { value: "flights", labelKey: "flights" },
    { value: "hotels", labelKey: "hotels" },
    { value: "translators", labelKey: "translators" },
    { value: "needs", labelKey: "ordersNeedsTab" }, // New key for "Хэрэгцээ"
  ];

  const flightFilters = [
    { value: "payment", labelKey: "ordersPaymentFilter", placeholderKey: "ordersPaymentFilter" },
    { value: "ticket", labelKey: "ordersTicketFilter", placeholderKey: "ordersTicketFilter" },
    { value: "refund", labelKey: "ordersRefundFilter", placeholderKey: "ordersRefundFilter" },
  ];

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="bg-muted rounded-full p-6 mb-6">
        <CreditCard className="h-16 w-16 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium text-foreground">{t('ordersNoPurchasesMade')}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">{t('myOrders')}</h1>

      <Tabs defaultValue="flights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {tabCategories.map(category => (
            <TabsTrigger key={category.value} value={category.value}>
              {t(category.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabCategories.map(category => (
          <TabsContent key={category.value} value={category.value} className="mt-4">
            {category.value === "flights" && (
              <div className="flex gap-2 mb-4">
                {flightFilters.map(filter => (
                  <Select key={filter.value}>
                    <SelectTrigger className="flex-1 text-sm h-9">
                      <SelectValue placeholder={t(filter.placeholderKey)} />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Add SelectItem options here when filter logic is implemented */}
                      <SelectItem value="option1">{t(filter.labelKey)} 1</SelectItem>
                      <SelectItem value="option2">{t(filter.labelKey)} 2</SelectItem>
                    </SelectContent>
                  </Select>
                ))}
              </div>
            )}

            {/* Currently, all tabs will show the empty state as order fetching per category is not implemented */}
            {renderEmptyState()}
            
            {/* 
            // Placeholder for when orders are fetched and filtered by category
            {orders.filter(order => order.category === category.value).length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {orders.filter(order => order.category === category.value).map(order => (
                  // Replace with actual OrderCard component
                  <Card key={order.id}> 
                    <CardHeader><CardTitle>{order.name}</CardTitle></CardHeader>
                    <CardContent><p>Order details...</p></CardContent>
                  </Card>
                ))}
              </div>
            )}
            */}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
