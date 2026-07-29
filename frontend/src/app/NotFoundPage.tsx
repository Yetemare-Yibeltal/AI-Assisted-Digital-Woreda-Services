import React from "react";
import { Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/shared/GradientText";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { storage } from "@/utils/storage";

export default function NotFoundPage() {
  const language = storage.getLanguage();

  return (
    <Container maxWidth="md" padding="default" className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        {/* 404 Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <FileQuestion className="h-12 w-12 text-primary" />
        </div>

        {/* Gradient 404 Text */}
        <GradientText as="h1" variant="ethiopia" className="text-7xl sm:text-8xl font-black mb-4">
          404
        </GradientText>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">
          {language === "am" ? "ገጽ አልተገኘም" : "Page Not Found"}
        </h2>

        {/* Description */}
        <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto mb-8">
          {language === "am"
            ? "የፈለጉት ገጽ ላይኖር ይችላል፣ ተወግዶ ሊሆን ይችላል፣ ወይም የገቡት አድራሻ ትክክል ላይሆን ይችላል።"
            : "The page you're looking for doesn't exist, may have been removed, or the URL may be incorrect."}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button
            variant="primary"
            size="lg"
            onClick={() => window.history.back()}
            leftIcon={<ArrowLeft className="h-5 w-5" />}
          >
            {language === "am" ? "ወደ ኋላ ተመለስ" : "Go Back"}
          </Button>
          <Link to="/">
            <Button variant="glass" size="lg" leftIcon={<Home className="h-5 w-5" />}>
              {language === "am" ? "ወደ መነሻ ገጽ" : "Go Home"}
            </Button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-10 pt-6 border-t border-border/20">
          <p className="text-sm text-muted-foreground mb-4">
            {language === "am" ? "እነዚህን ገጾች ይሞክሩ:" : "Try these pages:"}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap text-sm">
            <Link to="/services" className="text-primary hover:underline">
              {language === "am" ? "አገልግሎቶች" : "Services"}
            </Link>
            <Link to="/track" className="text-primary hover:underline">
              {language === "am" ? "ማመልከቻ ይከታተሉ" : "Track Application"}
            </Link>
            <Link to="/admin/login" className="text-primary hover:underline">
              {language === "am" ? "አስተዳዳሪ መግቢያ" : "Admin Login"}
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}