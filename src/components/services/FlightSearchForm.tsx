
"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { City } from "@/types";
import { useCity } from "@/contexts/CityContext";
import {
  PlaneTakeoff,
  PlaneLanding,
  CalendarDays,
  Users2,
  ArrowUpDown,
  Search,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


const flightSearchSchema = z.object({
  departureAirport: z.string().min(1, "departureCityRequired"),
  arrivalAirport: z.string().min(1, "arrivalCityRequired"),
  departureDate: z.date({ required_error: "Departure date is required" }),
  passengers: z.string().min(1, "Number of passengers is required"),
});

type FlightSearchFormData = z.infer<typeof flightSearchSchema>;

export function FlightSearchForm() {
  const { t, language } = useTranslation();
  const { availableCities, loadingCities } = useCity();
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<"departureAirport" | "arrivalAirport" | null>(null);
  const [citySearchTerm, setCitySearchTerm] = useState("");

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FlightSearchFormData>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      passengers: "1",
      departureAirport: "",
      arrivalAirport: "",
    },
  });

  const watchedDepartureCity = watch("departureAirport");
  const watchedArrivalCity = watch("arrivalAirport");

  const handleSwapCities = () => {
    setValue("departureAirport", watchedArrivalCity || "");
    setValue("arrivalAirport", watchedDepartureCity || "");
  };

  const onSubmit = (data: FlightSearchFormData) => {
    console.log("Flight Search Data (City IDs):", data);
    // Handle flight search logic here using city IDs
  };

  const findCityLabel = (cityId: string): string => {
    const city = availableCities.find(c => c.value === cityId);
    if (!city) return "";
    return language === 'cn' && city.label_cn ? city.label_cn : city.label;
  };

  const selectableCities = useMemo(() => {
    return availableCities.filter(city => city.value !== 'all');
  }, [availableCities]);

  const filteredCities = useMemo(() => {
    if (!citySearchTerm) return selectableCities;
    return selectableCities.filter(city =>
      (city.label.toLowerCase().includes(citySearchTerm.toLowerCase())) ||
      (city.label_cn && city.label_cn.toLowerCase().includes(citySearchTerm.toLowerCase()))
    );
  }, [citySearchTerm, selectableCities]);

  const CitySelectorButton = ({ fieldName, placeholderKey }: { fieldName: "departureAirport" | "arrivalAirport", placeholderKey: string }) => (
    <Controller
      name={fieldName}
      control={control}
      render={({ field }) => (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal pl-10 relative h-12 text-base md:text-sm"
            onClick={() => {
              setEditingField(fieldName);
              setCitySearchTerm(""); 
              setIsCityDialogOpen(true);
            }}
            disabled={loadingCities}
          >
            {fieldName === "departureAirport" ? (
              <PlaneTakeoff className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            ) : (
              <PlaneLanding className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            )}
            {loadingCities ? t('loading') : (field.value ? findCityLabel(field.value) : t(placeholderKey))}
          </Button>
        </DialogTrigger>
      )}
    />
  );


  return (
    <Dialog open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-w-md mx-auto p-4 sm:p-6 bg-card shadow-xl rounded-lg"
      >
        <div className="relative space-y-4">
          <div className="space-y-2">
            <Label htmlFor="departureAirport" className="text-sm font-medium">
              {t("fromCity")}
            </Label>
            <CitySelectorButton fieldName="departureAirport" placeholderKey="departureCityPlaceholder" />
            {errors.departureAirport && (
              <p className="text-xs text-destructive">
                {t(errors.departureAirport.message as string)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="arrivalAirport" className="text-sm font-medium">
              {t("toCity")}
            </Label>
             <CitySelectorButton fieldName="arrivalAirport" placeholderKey="arrivalCityPlaceholder" />
            {errors.arrivalAirport && (
              <p className="text-xs text-destructive">
                {t(errors.arrivalAirport.message as string)}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleSwapCities}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-full h-8 w-8 border-2 border-accent bg-background hover:bg-accent/10 z-10"
            aria-label={t("swapAirports")}
            disabled={loadingCities}
          >
            <ArrowUpDown className="h-4 w-4 text-accent" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="departureDate" className="text-sm font-medium">
            {t("selectDepartureDate")}
          </Label>
          <Controller
            name="departureDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="departureDate"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal pl-10 relative h-12 text-base md:text-sm",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>{t("selectDatePlaceholder")}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.departureDate && (
            <p className="text-xs text-destructive">
              {errors.departureDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="passengers" className="text-sm font-medium">
            {t("passengers")}
          </Label>
          <Controller
            name="passengers"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="passengers" className="pl-10 relative h-12 text-base md:text-sm justify-start text-left">
                  <Users2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <SelectValue placeholder={t("passengers")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t("onePassenger")}</SelectItem>
                  <SelectItem value="2">{t("twoPassengers")}</SelectItem>
                  <SelectItem value="3">{t("threePassengers")}</SelectItem>
                  <SelectItem value="4">{t("fourPassengers")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.passengers && (
            <p className="text-xs text-destructive">
              {errors.passengers.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-base h-12" disabled={loadingCities}>
          {loadingCities ? t('loading') : t("searchFlights")}
        </Button>
      </form>

      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>{t('selectCityDialogTitle')}</DialogTitle>
           <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchCitiesPlaceholder')}
              className="pl-10"
              value={citySearchTerm}
              onChange={(e) => setCitySearchTerm(e.target.value)}
            />
          </div>
          {loadingCities ? (
            <div className="space-y-2 h-[300px]">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <Button
                    key={city.value}
                    variant="ghost"
                    className="w-full justify-start p-2 h-auto mb-1 text-left"
                    onClick={() => {
                      if (editingField) {
                        setValue(editingField, city.value);
                      }
                      setIsCityDialogOpen(false);
                    }}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{language === 'cn' && city.label_cn ? city.label_cn : city.label}</span>
                      {/* Optionally, display other city info here if available, e.g., IATA if it were part of city data */}
                    </div>
                  </Button>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">{t('noCitiesFound')}</p>
              )}
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
