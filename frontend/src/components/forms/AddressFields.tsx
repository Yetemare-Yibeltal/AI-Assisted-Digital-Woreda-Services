import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Home, Building2, Hash, Mailbox } from "lucide-react";
import { cn } from "@/lib/shadcn-utils";
import { ETHIOPIAN_REGIONS } from "@/types/application.types";

interface AddressFieldsProps {
  language?: "en" | "am";
  className?: string;
}

const ZONES_BY_REGION: Record<string, string[]> = {
  Amhara: [
    "Awi", "East Gojjam", "West Gojjam", "North Gondar", "South Gondar",
    "North Wollo", "South Wollo", "Wag Hemra", "North Shewa", "Oromia Zone",
  ],
  Oromia: [
    "East Wollega", "West Wollega", "Jimma", "Borena", "Guji",
    "East Hararghe", "West Hararghe", "Arsi", "Bale", "Illu Aba Bora",
  ],
  Tigray: [
    "Central Tigray", "East Tigray", "South Tigray", "West Tigray",
    "North West Tigray", "Mekelle",
  ],
  SNNP: [
    "Gamo Gofa", "Wolayita", "Sidama", "Keffa", "Bench Maji", "Hadiya",
    "Gurage", "Siltie",
  ],
  "Addis Ababa": ["Addis Ababa"],
  Afar: ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5"],
  "Benishangul-Gumuz": ["Asosa", "Kamashi", "Metekel"],
  "Dire Dawa": ["Dire Dawa"],
  Gambela: ["Agnewak", "Nuwer", "Mezhenger"],
  Harari: ["Harari"],
  Sidama: ["Sidama"],
  Somali: ["Shinile", "Jijiga", "Degehabur", "Warder", "Korahe", "Gode", "Afder", "Liben"],
  "South Ethiopia": ["Konso", "Gamo", "Gofa", "Wolayita"],
  "South West Ethiopia": ["Keffa", "Bench Sheko", "Dawro"],
  "Central Ethiopia": ["Hadiya", "Gurage", "Siltie", "Yem"],
};

export function AddressFields({ language = "en", className }: AddressFieldsProps) {
  const { control, watch, formState: { errors } } = useFormContext();
  const selectedRegion = watch("address.region") || "Amhara";
  const zones = ZONES_BY_REGION[selectedRegion] || [];

  const labels = {
    region: language === "am" ? "ክልል" : "Region",
    zone: language === "am" ? "ዞን" : "Zone",
    woreda: language === "am" ? "ወረዳ" : "Woreda",
    kebele: language === "am" ? "ቀበሌ" : "Kebele",
    houseNumber: language === "am" ? "የቤት ቁጥር (አማራጭ)" : "House Number (Optional)",
    poBox: language === "am" ? "ፖ.ሳ.ቁ (አማራጭ)" : "P.O. Box (Optional)",
  };

  const placeholders = {
    kebele: language === "am" ? "ለምሳሌ፦ 01" : "e.g., 01",
    houseNumber: language === "am" ? "ለምሳሌ፦ 123" : "e.g., 123",
    poBox: language === "am" ? "ለምሳሌ፦ 100" : "e.g., 100",
  };

  return (
    <div className={cn("space-y-5", className)}>
      {/* Region */}
      <FormField
        control={control}
        name="address.region"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{labels.region} <span className="text-red-400">*</span></FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger error={errors.address?.region?.message as string}>
                  <SelectValue placeholder={labels.region} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ETHIOPIAN_REGIONS.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Zone */}
      <FormField
        control={control}
        name="address.zone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{labels.zone} <span className="text-red-400">*</span></FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger error={errors.address?.zone?.message as string}>
                  <SelectValue placeholder={labels.zone} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {zones.length > 0 ? (
                  zones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value={field.value || "Other"}>
                    {field.value || "Other"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Woreda */}
      <FormField
        control={control}
        name="address.woreda"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{labels.woreda} <span className="text-red-400">*</span></FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Dangila"
                leftIcon={<Building2 className="h-4 w-4" />}
                error={errors.address?.woreda?.message as string}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Kebele */}
      <FormField
        control={control}
        name="address.kebele"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{labels.kebele} <span className="text-red-400">*</span></FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={placeholders.kebele}
                leftIcon={<MapPin className="h-4 w-4" />}
                error={errors.address?.kebele?.message as string}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* House Number & P.O. Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="address.houseNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{labels.houseNumber}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={placeholders.houseNumber}
                  leftIcon={<Home className="h-4 w-4" />}
                  error={errors.address?.houseNumber?.message as string}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="address.poBox"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{labels.poBox}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={placeholders.poBox}
                  leftIcon={<Mailbox className="h-4 w-4" />}
                  error={errors.address?.poBox?.message as string}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

export default AddressFields;