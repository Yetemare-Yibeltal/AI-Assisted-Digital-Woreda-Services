import { Link } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUpRight,
  FileText,
  Users,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { WOREDA_INFO } from "@/utils/constants";

interface FooterProps {
  language: "en" | "am";
  className?: string;
}

const quickLinks = [
  {
    label: "Services",
    labelAmharic: "አገልግሎቶች",
    path: "/services",
    icon: FileText,
  },
  {
    label: "Track Application",
    labelAmharic: "ማመልከቻ ይከታተሉ",
    path: "/track",
    icon: HelpCircle,
  },
  {
    label: "Admin Login",
    labelAmharic: "አስተዳዳሪ መግቢያ",
    path: "/admin/login",
    icon: Users,
  },
];

const supportLinks = [
  {
    label: "FAQ",
    labelAmharic: "ተደጋጋሚ ጥያቄዎች",
    path: "/faq",
  },
  {
    label: "Contact Us",
    labelAmharic: "ያግኙን",
    path: "/contact",
  },
  {
    label: "Privacy Policy",
    labelAmharic: "የግላዊነት ፖሊሲ",
    path: "/privacy",
  },
];

export function Footer({ language = "en", className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className={cn(
        "relative z-10 border-t border-border/20 bg-woreda-darker/90 backdrop-blur-xl",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Logo size="sm" className="mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {language === "am"
                ? `${WOREDA_INFO.nameAmharic} ወረዳ ዲጂታል አገልግሎት መድረክ። ሁሉም የወረዳ አገልግሎቶች በአንድ ቦታ።`
                : `${WOREDA_INFO.name} Woreda Digital Services Platform. All woreda services in one place.`}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-ethiopia-green" />
              <div className="h-2 w-2 rounded-full bg-ethiopia-yellow" />
              <div className="h-2 w-2 rounded-full bg-ethiopia-red" />
              <span className="text-xs text-muted-foreground ml-1">
                {language === "am" ? "ኢትዮጵያ" : "Ethiopia"}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
              {language === "am" ? "ፈጣን አገናኞች" : "Quick Links"}
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                    >
                      {Icon && (
                        <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                      <span>{language === "am" ? link.labelAmharic : link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
              {language === "am" ? "ድጋፍ" : "Support"}
            </h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {language === "am" ? link.labelAmharic : link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-border/20">
              <Button
                variant="glass"
                size="sm"
                className="gap-2 text-xs"
                onClick={() => {
                  const chatButton = document.querySelector('[aria-label="Toggle AI Chat"]') as HTMLButtonElement;
                  chatButton?.click();
                }}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {language === "am" ? "AI ረዳት ይጠይቁ" : "Ask AI Assistant"}
              </Button>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
              {language === "am" ? "ያግኙን" : "Contact Us"}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>
                  {language === "am"
                    ? `${WOREDA_INFO.nameAmharic} ወረዳ አስተዳደር፣ ${WOREDA_INFO.zoneAmharic} ዞን፣ ${WOREDA_INFO.regionAmharic} ክልል`
                    : `${WOREDA_INFO.name} Woreda Administration, ${WOREDA_INFO.zone} Zone, ${WOREDA_INFO.region} Region`}
                </span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href="tel:+251911111111" className="hover:text-primary transition-colors">
                  +251 91 111 1111
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href="mailto:support@dangila.gov.et" className="hover:text-primary transition-colors break-all">
                  support@dangila.gov.et
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>
                  {language === "am"
                    ? "ሰኞ - አርብ፣ 8:30 AM - 5:30 PM"
                    : "Mon - Fri, 8:30 AM - 5:30 PM"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} {WOREDA_INFO.name} Woreda Administration.{" "}
            {language === "am" ? "መብቱ በህግ የተጠበቀ ነው።" : "All rights reserved."}
          </p>
          <button
            onClick={scrollToTop}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {language === "am" ? "ወደ ላይ ↑" : "Back to top ↑"}
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;