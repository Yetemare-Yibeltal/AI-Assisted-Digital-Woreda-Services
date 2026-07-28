import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Phone, Mail, Calendar, IdCard, Briefcase, Users } from "lucide-react";
import { cn } from "@/lib/shadcn-utils";

interface PersonalInfoFieldsProps {
  language?: "en" | "am";
  className?: string;
}

export function PersonalInfoFields({ language = "en", className }: PersonalInfoFieldsProps) {
  const { control, formState: { errors } } = useFormContext();

  const labels = {
    fullName: language === "am" ? "ሙሉ ስም (በእንግሊዘኛ)" : "Full Name (English)",
    fullNameAmharic: language === "am" ? "ሙሉ ስም (በአማርኛ)" : "Full Name (Amharic)",
    dateOfBirth: language === "am" ? "የትውልድ ቀን" : "Date of Birth",
    gender: language === "am" ? "ጾታ" : "Gender",
    male: language === "am" ? "ወንድ" : "Male",
    female: language === "am" ? "ሴት" : "Female",
    phoneNumber: language === "am" ? "ስልክ ቁጥር" : "Phone Number",
    email: language === "am" ? "ኢሜይል (አማራጭ)" : "Email (Optional)",
    idNumber: language === "am" ? "የመታወቂያ ቁጥር (አማራጭ)" : "ID Number (Optional)",
    occupation: language === "am" ? "ሙያ (አማራጭ)" : "Occupation (Optional)",
  };

  const placeholders = {
    fullName: language === "am" ? "ለምሳሌ፦ አበበ ከበደ" : "e.g., Abebe Kebede",
    fullNameAmharic: language === "am" ? "ለምሳሌ፦ አበበ ከበደ" : "e.g., አበበ ከበደ",
    phoneNumber: language === "am" ? "ለምሳሌ፦ 0912345678" : "e.g., 0912345678",
    email: language === "am" ? "ለምሳሌ፦ abebe@example.com" : "e.g., abebe@example.com",
    idNumber: language === "am" ? "የመታወቂያ ቁጥርዎን ያስገቡ" : "Enter your ID number",
    occupation: language === "am" ? "ሙያዎን ያስገቡ" : "Enter your occupation",
  };

  return (
    <div className={cn("space-y-5", className)}>
      {/* Full Name - English */}
      <FormField
        control={control}
        name="applicantInfo.fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{labels.fullName} <span className="text-red-400">*</span></FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={placeholders.fullName}
                leftIcon={<User className="h-4 w-4" />}
                error={errors.applicantInfo?.fullName?.message as string}
                maxLength={200}
                showCharCount
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Full Name - Amharic */}
      <FormField
        control={control}
        name="applicantInfo.fullNameAmharic"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{labels.fullNameAmharic} <span className="text-red-400">*</span></FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={placeholders.fullNameAmharic}
                leftIcon={<User className="h-4 w-4" />}
                error={errors.applicantInfo?.fullNameAmharic?.message as string}
                maxLength={200}
                showCharCount
                className="font-amharic"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Date of Birth & Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="applicantInfo.dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{labels.dateOfBirth} <span className="text-red-400">*</span></FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  leftIcon={<Calendar className="h-4 w-4" />}
                  error={errors.applicantInfo?.dateOfBirth?.message as string}
                  max={new Date().toISOString().split("T")[0]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="applicantInfo.gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{labels.gender} <span className="text-red-400">*</span></FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger error={errors.applicantInfo?.gender?.message as string}>
                    <SelectValue placeholder={labels.gender} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">{labels.male}</SelectItem>
                  <SelectItem value="female">{labels.female}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Phone Number */}
      <FormField
        control={control}
        name="applicantInfo.phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{labels.phoneNumber} <span className="text-red-400">*</span></FormLabel>
            <FormControl>
              <Input
                {...field}
                type="tel"
                placeholder={placeholders.phoneNumber}
                leftIcon={<Phone className="h-4 w-4" />}
                error={errors.applicantInfo?.phoneNumber?.message as string}
                maxLength={13}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Email */}
      <FormField
        control={control}
        name="applicantInfo.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{labels.email}</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
                placeholder={placeholders.email}
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.applicantInfo?.email?.message as string}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ID Number & Occupation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="applicantInfo.idNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{labels.idNumber}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={placeholders.idNumber}
                  leftIcon={<IdCard className="h-4 w-4" />}
                  error={errors.applicantInfo?.idNumber?.message as string}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="applicantInfo.occupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{labels.occupation}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={placeholders.occupation}
                  leftIcon={<Briefcase className="h-4 w-4" />}
                  error={errors.applicantInfo?.occupation?.message as string}
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

export default PersonalInfoFields;