import React from "react";
import { cn } from "@/lib/shadcn-utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, MessageCircle } from "lucide-react";

interface FAQItem {
  questionEn: string;
  questionAm: string;
  answerEn: string;
  answerAm: string;
}

interface ServiceFAQProps {
  faqs: FAQItem[];
  language?: "en" | "am";
  className?: string;
}

const defaultFAQs: FAQItem[] = [
  {
    questionEn: "How long does the process take?",
    questionAm: "ሂደቱ ምን ያህል ጊዜ ይወስዳል?",
    answerEn:
      "Processing time varies depending on the service. Please check the service details for specific timeframes. Most services are completed within 3-7 business days.",
    answerAm:
      "የማስኬጃ ጊዜ እንደ አገልግሎቱ አይነት ይለያያል። እባክዎ ዝርዝሩን ይመልከቱ። አብዛኛው አገልግሎት ከ3-7 የስራ ቀናት ውስጥ ይጠናቀቃል።",
  },
  {
    questionEn: "What documents do I need?",
    questionAm: "ምን ሰነዶች ያስፈልጋሉ?",
    answerEn:
      "Required documents are listed in the Requirements section above. Please bring all original documents along with photocopies.",
    answerAm:
      "የሚያስፈልጉ ሰነዶች ከላይ በመስፈርቶች ክፍል ተዘርዝረዋል። እባክዎ ሁሉንም ኦርጅናል ሰነዶች ከፎቶ ኮፒዎቻቸው ጋር ይዘው ይምጡ።",
  },
  {
    questionEn: "How much does it cost?",
    questionAm: "ዋጋው ስንት ነው?",
    answerEn:
      "Fees are displayed in the Fees section above. Payment must be made at the Woreda Finance Office. Fees are non-refundable.",
    answerAm:
      "ክፍያዎች ከላይ በክፍያዎች ክፍል ተዘርዝረዋል። ክፍያ የሚከፈለው በወረዳው ፋይናንስ ቢሮ ብቻ ነው። ክፍያዎች ተመላሽ አይደረጉም።",
  },
  {
    questionEn: "Where is the office located?",
    questionAm: "ቢሮው የት ነው የሚገኘው?",
    answerEn:
      "All services are processed at the Dangila Woreda Administration Office, located in the center of Dangila town, Awi Zone, Amhara Region.",
    answerAm:
      "ሁሉም አገልግሎቶች የሚሰጡት በዳንግላ ወረዳ አስተዳደር ቢሮ ሲሆን፣ በዳንግላ ከተማ መሃል፣ አዊ ዞን፣ አማራ ክልል ይገኛል።",
  },
  {
    questionEn: "Can I track my application status?",
    questionAm: "የማመልከቻዬን ሁኔታ መከታተል እችላለሁ?",
    answerEn:
      "Yes! Use your tracking number on the Track Application page. You can also contact our office during business hours.",
    answerAm:
      "አዎ! የመከታተያ ቁጥርዎን በማመልከቻ መከታተያ ገጽ ላይ ይጠቀሙ። በተጨማሪም በስራ ሰዓታት ቢሮአችንን ማነጋገር ይችላሉ።",
  },
];

export function ServiceFAQ({
  faqs = defaultFAQs,
  language = "en",
  className,
}: ServiceFAQProps) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3 mb-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">
          {language === "am" ? "ተደጋጋሚ ጥያቄዎች" : "Frequently Asked Questions"}
        </h3>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`faq-${index}`}
            className="border border-border/20 rounded-xl overflow-hidden bg-woreda-card/50"
          >
            <AccordionTrigger
              variant="glass"
              className="px-4 py-3 text-sm font-medium hover:no-underline"
            >
              <div className="flex items-start gap-3 text-left">
                <HelpCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{language === "am" ? faq.questionAm : faq.questionEn}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="pl-7 text-sm text-muted-foreground leading-relaxed">
                {language === "am" ? faq.answerAm : faq.answerEn}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default ServiceFAQ;