import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Users,
  RefreshCw,
} from "lucide-react";
import api from "@/utils/api";
import { storage } from "@/utils/storage";
import type { ApiResponse } from "@/types/api.types";

interface DashboardChartsProps {
  className?: string;
}

// Simple SVG bar chart component
function BarChart({
  data,
  color = "#009A44",
  height = 200,
  showLabels = true,
  language = "en",
}: {
  data: { label: string; value: number; color?: string }[];
  color?: string;
  height?: number;
  showLabels?: boolean;
  language?: string;
}) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = Math.max(20, Math.min(60, 80 / data.length));
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${data.length * 80 + 40} ${height}`}>
      {data.map((d, i) => {
        const barH = (d.value / max) * (height - 40);
        const x = i * 80 + 30;
        return (
          <g key={i}>
            <rect
              x={x}
              y={height - barH - 20}
              width={barWidth}
              height={barH}
              rx={4}
              fill={d.color || color}
              opacity={0.85}
            />
            {showLabels && (
              <text x={x + barWidth / 2} y={height - 5} textAnchor="middle" fontSize="10" fill="#888">
                {d.label.length > 8 ? d.label.slice(0, 8) + ".." : d.label}
              </text>
            )}
            <text x={x + barWidth / 2} y={height - barH - 25} textAnchor="middle" fontSize="10" fill="#aaa">
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Simple SVG line chart
function LineChart({
  data,
  color = "#009A44",
  height = 200,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const points = data
    .map((d, i) => `${(i / (data.length - 1)) * 100}% ${height - 30 - ((d.value / max) * (height - 50))}`)
    .join(" ");
  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
      {data.map((d, i) => (
        <circle
          key={i}
          cx={`${(i / (data.length - 1)) * 100}%`}
          cy={height - 30 - ((d.value / max) * (height - 50))}
          r="3"
          fill={color}
        />
      ))}
    </svg>
  );
}

// Pie chart using SVG
function PieChartSvg({
  data,
  size = 160,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let startAngle = 0;
  const radius = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d, i) => {
        const angle = (d.value / total) * 360;
        const endAngle = startAngle + angle;
        const x1 = radius + radius * Math.cos((startAngle * Math.PI) / 180);
        const y1 = radius + radius * Math.sin((startAngle * Math.PI) / 180);
        const x2 = radius + radius * Math.cos((endAngle * Math.PI) / 180);
        const y2 = radius + radius * Math.sin((endAngle * Math.PI) / 180);
        const largeArc = angle > 180 ? 1 : 0;
        const path = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        startAngle = endAngle;
        return <path key={i} d={path} fill={d.color} stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />;
      })}
    </svg>
  );
}

export function DashboardCharts({ className }: DashboardChartsProps) {
  const [language] = useState<"en" | "am">(storage.getLanguage());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("status");
  const [chartData, setChartData] = useState<any>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, trendsRes, serviceRes, officerRes, demographicsRes, revenueRes] = await Promise.all([
        api.get("/dashboard/status-distribution"),
        api.get("/dashboard/trends?days=30"),
        api.get("/dashboard/service-performance"),
        api.get("/dashboard/officer-workload"),
        api.get("/dashboard/citizen-demographics"),
        api.get("/dashboard/revenue"),
      ]);

      setChartData({
        status: statusRes.data?.data || {},
        trends: trendsRes.data?.data || { daily: [] },
        service: serviceRes.data?.data || { byService: [] },
        officer: officerRes.data?.data || { currentWorkload: [] },
        demographics: demographicsRes.data?.data || {},
        revenue: revenueRes.data?.data || { byService: [] },
      });
    } catch (err) {
      console.error("Failed to load chart data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} variant="glass" className="h-[280px]"><Skeleton variant="card" className="h-full" /></Card>
        ))}
      </div>
    );
  }

  const statusData = chartData.status?.byStatus || [];
  const statusColors: Record<string, string> = {
    pending: "#FEDD00",
    under_review: "#2196F3",
    documents_requested: "#FF9800",
    approved: "#4CAF50",
    rejected: "#EF3340",
    completed: "#009A44",
  };

  const pieData = statusData.map((s: any) => ({
    label: s._id || "",
    value: s.count || 0,
    color: statusColors[s._id] || "#888",
  }));

  const trendData = (chartData.trends?.daily || []).map((d: any) => ({
    label: d._id?.slice(-5) || "",
    value: d.total || 0,
  }));

  const serviceBars = (chartData.service?.byService || []).slice(0, 10).map((s: any) => ({
    label: s._id?.serviceName || s._id || "",
    value: s.total || 0,
    color: s.approvalRate > 70 ? "#4CAF50" : s.approvalRate > 40 ? "#FEDD00" : "#EF3340",
  }));

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{language === "am" ? "ቻርቶች" : "Charts"}</h2>
        <Button variant="glass" size="sm" onClick={fetchData} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {language === "am" ? "አድስ" : "Refresh"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} variant="glass">
        <TabsList>
          <TabsTrigger value="status" icon={<PieChart className="h-4 w-4" />}>
            {language === "am" ? "ሁኔታ" : "Status"}
          </TabsTrigger>
          <TabsTrigger value="trends" icon={<TrendingUp className="h-4 w-4" />}>
            {language === "am" ? "አዝማሚያ" : "Trends"}
          </TabsTrigger>
          <TabsTrigger value="service" icon={<BarChart3 className="h-4 w-4" />}>
            {language === "am" ? "አገልግሎት" : "Service"}
          </TabsTrigger>
          <TabsTrigger value="officer" icon={<Users className="h-4 w-4" />}>
            {language === "am" ? "ሰራተኞች" : "Officers"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>{language === "am" ? "የሁኔታ ስርጭት" : "Status Distribution"}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <PieChartSvg data={pieData} size={220} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>{language === "am" ? "የ30 ቀን አዝማሚያ" : "30-Day Trends"}</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart data={trendData} color="#009A44" height={220} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="service">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>{language === "am" ? "የአገልግሎት ተወዳጅነት" : "Service Popularity"}</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart data={serviceBars} color="#FEDD00" height={250} language={language} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="officer">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>{language === "am" ? "የሰራተኛ ስራ ጫና" : "Officer Workload"}</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={(chartData.officer?.currentWorkload || []).map((o: any) => ({
                  label: o.officerName || o._id || "",
                  value: o.activeApplications || 0,
                }))}
                color="#2196F3"
                height={250}
                language={language}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DashboardCharts;