import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { pdfConfig } from "@/config/pdf.config";
import type { IApplication } from "@/types/application.types";
import type { IService } from "@/types/service.types";

interface PDFTemplateProps {
  application: IApplication;
  service: IService;
  type: "receipt" | "certificate" | "document-request";
  approvedBy?: string;
  documents?: string[];
  language?: "en" | "am";
  className?: string;
  showStamp?: boolean;
  showWatermark?: boolean;
}

export function PDFTemplate({
  application,
  service,
  type,
  approvedBy = "Dangila Woreda Administration",
  documents = [],
  language = "en",
  className,
  showStamp = true,
  showWatermark = true,
}: PDFTemplateProps) {
  const totalFee = service.fees?.reduce((sum, f) => sum + f.amount, 0) || 0;
  const config = pdfConfig;

  const labels = {
    receipt: {
      title: language === "am" ? "የማመልከቻ ደረሰኝ" : "APPLICATION RECEIPT",
      trackingLabel: language === "am" ? "የመከታተያ ቁጥር" : "TRACKING NUMBER",
    },
    certificate: {
      title: language === "am" ? "የማጽደቅ ሰርተፍኬት" : "CERTIFICATE OF APPROVAL",
    },
    "document-request": {
      title: language === "am" ? "የሰነድ ጥያቄ ደብዳቤ" : "DOCUMENT REQUEST LETTER",
    },
  };

  const currentLabels = labels[type];

  return (
    <Card
      className={cn(
        "relative bg-white text-gray-900 shadow-2xl print:shadow-none print:border-none",
        "max-w-[210mm] mx-auto",
        className
      )}
    >
      {/* Watermark */}
      {showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
          <span
            className="text-[120px] font-extrabold opacity-[0.03] rotate-[-30deg] whitespace-nowrap"
            style={{ color: config.watermark.color }}
          >
            DANGILA WOREDA
          </span>
        </div>
      )}

      <div className="relative p-8 sm:p-12">
        {/* Header */}
        <div className="text-center border-b-2 pb-4 mb-6" style={{ borderColor: config.colors.primary }}>
          <h1 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-1">
            {language === "am" ? config.header.titleAm : config.header.titleEn}
          </h1>
          <p className="text-xs text-gray-400">
            {language === "am" ? config.header.subtitleAm : config.header.subtitleEn}
          </p>
        </div>

        {/* Title */}
        <h2
          className="text-xl sm:text-2xl font-extrabold text-center mb-6 uppercase tracking-wider"
          style={{ color: config.colors.primary }}
        >
          {currentLabels.title}
        </h2>

        {/* Tracking Number */}
        {type === "receipt" && (
          <div className="text-center mb-6">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
              {currentLabels.trackingLabel}
            </p>
            <div
              className="inline-block border-2 rounded-lg px-8 py-2 mx-auto"
              style={{ borderColor: config.colors.primary }}
            >
              <span
                className="text-2xl sm:text-3xl font-extrabold tracking-[0.3em] tabular-nums"
                style={{ color: config.colors.primary }}
              >
                {application.trackingNumber}
              </span>
            </div>
          </div>
        )}

        {/* Receipt Content */}
        {type === "receipt" && (
          <>
            <table className="w-full text-sm">
              <tbody>
                {[
                  {
                    label: language === "am" ? "የማመልከቻ ቁጥር" : "Application ID",
                    value: application.applicationId,
                  },
                  {
                    label: language === "am" ? "አገልግሎት" : "Service",
                    value: language === "am" ? service.nameAmharic : service.name,
                  },
                  {
                    label: language === "am" ? "የአመልካች ስም" : "Applicant Name",
                    value: language === "am"
                      ? application.applicantInfo.fullNameAmharic
                      : application.applicantInfo.fullName,
                  },
                  {
                    label: language === "am" ? "ስልክ" : "Phone",
                    value: application.applicantInfo.phoneNumber,
                  },
                  {
                    label: language === "am" ? "ቀበሌ" : "Kebele",
                    value: application.address.kebele,
                  },
                  {
                    label: language === "am" ? "የቀረበበት ቀን" : "Submission Date",
                    value: formatDate(application.createdAt, language),
                  },
                  {
                    label: language === "am" ? "ሁኔታ" : "Status",
                    value: application.status,
                  },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-2 pr-4 text-gray-500 font-medium w-2/5">{row.label}</td>
                    <td className="py-2 font-semibold">{row.value || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Fees */}
            {service.fees && service.fees.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-300">
                <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-3">
                  {language === "am" ? "ክፍያዎች" : "Fees"}
                </h3>
                <table className="w-full text-sm">
                  <tbody>
                    {service.fees.map((fee, i) => (
                      <tr key={i}>
                        <td className="py-1">{language === "am" ? fee.nameAmharic : fee.name}</td>
                        <td className="py-1 text-right tabular-nums font-medium">
                          {formatCurrency(fee.amount, fee.currency)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-400 font-bold">
                      <td className="py-2">
                        {language === "am" ? "ጠቅላላ" : "Total"}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {formatCurrency(totalFee)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center mt-8 italic">
              {language === "am"
                ? "ይህ ደረሰኝ ማመልከቻዎ መቀበሉን ያረጋግጣል። ለወደፊት ማጣቀሻ ይዘውት ይቆዩ።"
                : "This receipt confirms your application has been received. Keep it for future reference."}
            </p>
          </>
        )}

        {/* Certificate Content */}
        {type === "certificate" && (
          <div className="text-center">
            <div className="text-base leading-relaxed max-w-lg mx-auto my-8 py-6 px-4 border-y border-gray-300">
              {language === "am"
                ? `ይህ ሰርተፍኬት የሚያረጋግጠው ${application.applicantInfo.fullNameAmharic} ያቀረቡት የ${service.nameAmharic} ማመልከቻ ቁጥር ${application.trackingNumber} ጸድቋል።`
                : `This certificate confirms that the application for ${service.name} submitted by ${application.applicantInfo.fullName} (${application.trackingNumber}) has been approved.`}
            </div>

            <p className="text-sm mt-6">
              <strong>{language === "am" ? "ጸድቋል" : "Approved by"}:</strong> {approvedBy}
            </p>
            <p className="text-sm mt-1">
              <strong>{language === "am" ? "ቀን" : "Date"}:</strong>{" "}
              {formatDate(new Date().toISOString(), language)}
            </p>
          </div>
        )}

        {/* Document Request Content */}
        {type === "document-request" && (
          <div>
            <p className="text-sm mb-2">
              <strong>{language === "am" ? "ለ" : "To"}:</strong>{" "}
              {language === "am"
                ? application.applicantInfo.fullNameAmharic
                : application.applicantInfo.fullName}
            </p>
            <p className="text-sm mb-4">
              <strong>{language === "am" ? "የመከታተያ ቁጥር" : "Tracking Number"}:</strong>{" "}
              {application.trackingNumber}
            </p>
            <p className="text-sm mb-3">
              {language === "am"
                ? "የሚከተሉት ሰነዶች ያስፈልጋሉ:"
                : "The following documents are required:"}
            </p>
            <ol className="list-decimal list-inside text-sm space-y-1 mb-6 ml-2">
              {documents.map((doc, i) => (
                <li key={i}>{doc}</li>
              ))}
            </ol>
            <p className="text-sm font-semibold">
              {language === "am" ? "የማስረከቢያ ቀን" : "Submission Deadline"}:{" "}
              {formatDate(
                new Date(Date.now() + 10 * 86400000).toISOString(),
                language
              )}
            </p>
          </div>
        )}

        {/* Official Stamp */}
        {showStamp && (
          <div className="flex justify-end mt-8">
            <div
              className="inline-block border-[3px] rounded-lg px-6 py-2 -rotate-12 opacity-80"
              style={{ borderColor: config.stamp.color, color: config.stamp.color }}
            >
              <p className="text-sm font-extrabold uppercase tracking-wider text-center">
                {language === "am" ? config.stamp.textAm : config.stamp.text}
              </p>
              <p className="text-[10px] font-semibold text-center mt-0.5">
                DANGILA WOREDA
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400">
          {language === "am"
            ? "በዳንግላ ዲጂታል ወረዳ አገልግሎቶች የተፈጠረ"
            : "Generated by Dangila Digital Woreda Services"}{" "}
          &mdash; {new Date().toLocaleString()}
        </div>
      </div>
    </Card>
  );
}

export default PDFTemplate;