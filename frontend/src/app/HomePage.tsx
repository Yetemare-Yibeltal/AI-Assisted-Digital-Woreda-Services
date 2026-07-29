import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { GradientHeading } from "@/components/shared/GradientText";
import { GradientButton } from "@/components/shared/GradientButton";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { StatsCard } from "@/components/admin/StatsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { storage } from "@/utils/storage";
import api from "@/utils/api";
import type { IService } from "@/types/service.types";
import type { ApiResponse } from "@/types/api.types";
import { WOREDA_INFO } from "@/utils/constants";
import { motion } from "framer-motion";

export default function HomePage() {
  const [popularServices, setPopularServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const language = storage.getLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, statsRes] = await Promise.all([
          api.get<ApiResponse<IService[]>>("/public/services/popular?limit=8"),
          api.get<ApiResponse<any>>("/public/stats"),
        ]);
        if (servicesRes.data.success) setPopularServices(servicesRes.data.data);
        if (statsRes.data.success) setStats(statsRes.data.data);
      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const scrollToServices = () => {
    document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-24">
        <Container maxWidth="xl" padding="lg" className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Badge variant="success" size="sm" className="mb-4 gap-1">
              <MapPin className="h-3 w-3" />
              {language === "am"
                ? `${WOREDA_INFO.nameAmharic} ወረዳ`
                : `${WOREDA_INFO.name} Woreda`}
            </Badge>
            <GradientHeading
              title="Digital Woreda Services"
              titleAmharic="ዲጂታል ወረዳ አገልግሎቶች"
              subtitle="Access all Dangila Woreda government services online. Apply, track, and get AI-powered assistance — all in one place."
              variant="ethiopia"
              size="xl"
              align="center"
            />
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4 font-amharic">
              ሁሉም የዳንግላ ወረዳ መንግስታዊ አገልግሎቶች በአንድ ቦታ። ያመልክቱ፣ ይከታተሉ፣ እና AI እርዳታ ያግኙ።
            </p>
          </motion.div>

          <motion.div
            className="flex items-center justify-center gap-4 mt-8 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <Link to="/services">
              <GradientButton size="lg" leftIcon={<Search className="h-5 w-5" />}>
                {language === "am" ? "አገልግሎቶችን ይመልከቱ" : "Browse Services"}
              </GradientButton>
            </Link>
            <Link to="/track">
              <GradientButton
                variant="green-gold"
                size="lg"
                fill="outline"
                leftIcon={<FileText className="h-5 w-5" />}
              >
                {language === "am" ? "ማመልከቻ ይከታተሉ" : "Track Application"}
              </GradientButton>
            </Link>
          </motion.div>

          {/* Quick Stats */}
          {stats && (
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              <StatsCard
                title={language === "am" ? "አገልግሎቶች" : "Services"}
                value={stats.totalServices || 0}
                icon={FileText}
                color="green"
              />
              <StatsCard
                title={language === "am" ? "ማመልከቻዎች" : "Applications"}
                value={stats.totalApplications || 0}
                icon={FileText}
                color="blue"
              />
              <StatsCard
                title={language === "am" ? "የተጠናቀቁ" : "Completed"}
                value={stats.completed || 0}
                icon={CheckCircle2}
                color="green"
                trend="up"
                trendValue="95%"
              />
              <StatsCard
                title={language === "am" ? "አማካይ ጊዜ" : "Avg Time"}
                value={`${stats.averageDays || 3} days`}
                icon={Clock}
                color="yellow"
              />
            </motion.div>
          )}
        </Container>
      </section>

      {/* Popular Services Section */}
      <section id="services-section" className="py-16 bg-woreda-darker/30">
        <Container maxWidth="xl" padding="default">
          <div className="mb-8 text-center">
            <GradientHeading
              title="Popular Services"
              titleAmharic="ታዋቂ አገልግሎቶች"
              size="lg"
              align="center"
            />
            <p className="text-muted-foreground mt-2">
              {language === "am"
                ? "በብዛት የሚጠየቁ አገልግሎቶች"
                : "Most requested services by citizens"}
            </p>
          </div>
          <ServiceGrid services={popularServices} loading={loading} columns={4} />
          <div className="text-center mt-8">
            <Link to="/services">
              <Button variant="outline" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                {language === "am" ? "ሁሉንም አገልግሎቶች ይመልከቱ" : "View All Services"}
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <Container maxWidth="xl" padding="default">
          <div className="text-center mb-10">
            <GradientHeading
              title="How It Works"
              titleAmharic="እንዴት እንደሚሰራ"
              size="lg"
              align="center"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: language === "am" ? "1. አገልግሎት ይምረጡ" : "1. Find Service",
                desc: language === "am"
                  ? "የሚፈልጉትን አገልግሎት ይፈልጉና ዝርዝሩን ይመልከቱ።"
                  : "Browse or search for the service you need and view requirements.",
              },
              {
                icon: FileText,
                title: language === "am" ? "2. ያመልክቱ" : "2. Apply Online",
                desc: language === "am"
                  ? "ቅጹን ይሙሉ፣ ሰነዶችን ያያይዙ፣ እና ያስገቡ።"
                  : "Fill the form, attach documents, and submit your application.",
              },
              {
                icon: MessageSquare,
                title: language === "am" ? "3. ይከታተሉ" : "3. Track & Get Help",
                desc: language === "am"
                  ? "የመከታተያ ቁጥርዎን በመጠቀም ሁኔታዎን ይከታተሉ ወይም AI ረዳት ይጠይቁ።"
                  : "Track your status with your tracking number or ask our AI assistant.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="glass-card p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <Container maxWidth="md" padding="default" className="text-center">
          <div className="glass-card p-8 gradient-border">
            <h2 className="text-2xl font-extrabold mb-4">
              {language === "am"
                ? "ዛሬውኑ ያመልክቱ"
                : "Apply Today"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === "am"
                ? "በዳንግላ ወረዳ አገልግሎቶች በቀላሉ ያግኙ።"
                : "Get Dangila Woreda services easily online."}
            </p>
            <Link to="/services">
              <GradientButton size="lg">
                {language === "am" ? "ጀምር" : "Get Started"}
              </GradientButton>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}