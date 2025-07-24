import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardHeader } from "./DashboardHeader";
import { CallStatsCard } from "./CallStatsCard";
import { CallLogTable } from "./CallLogTable";
import { BillingSection } from "./BillingSection";
import { TimeRangeSelector, TimeRange } from "./TimeRangeSelector";
import { Phone, Clock, DollarSign, TrendingUp } from "lucide-react";
import {
  mockCallLogs,
  calculateStats,
  exportToCSV,
  exportToExcel,
  RATE_PER_MINUTE,
} from "@/utils/mockData";
import {
  isToday,
  isThisWeek,
  isThisMonth,
  isThisQuarter,
  isThisYear,
} from "date-fns";

export function Dashboard() {
  const { username: urlUsername } = useParams<{ username?: string }>();
  const navigate = useNavigate();

  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("month");

  // Redirect to login if no username in URL
  useEffect(() => {
    if (!urlUsername) {
      navigate("/login");
    }
  }, [urlUsername, navigate]);

  // Simple user object based on URL param
  const user = {
    username: urlUsername || "Guest User",
    email: `${(urlUsername || "guest").replace(/\s+/g, "").toLowerCase()}@example.com`,
  };

  // Filter call logs by selected time range
  const filteredLogs = mockCallLogs.filter((log) => {
    switch (selectedTimeRange) {
      case "today":
        return isToday(log.date);
      case "week":
        return isThisWeek(log.date);
      case "month":
        return isThisMonth(log.date);
      case "quarter":
        return isThisQuarter(log.date);
      case "year":
        return isThisYear(log.date);
      default:
        return true;
    }
  });

  const stats = calculateStats(filteredLogs);

  const billingData = {
    currentPeriod: {
      totalMinutes: stats.totalMinutes,
      totalCost: stats.totalCost,
      periodStart: new Date(2024, 6, 1),
      periodEnd: new Date(2024, 6, 31),
    },
    ratePerMinute: RATE_PER_MINUTE,
    monthlyLimit: 500,
    usagePercentage: Math.min((stats.totalCost / 500) * 100, 100),
  };

  const handleExportCSV = () => exportToCSV(filteredLogs);
  const handleExportExcel = () => exportToExcel(filteredLogs);

  // Logout just redirects here for now
  const handleLogOut = async () => {
    navigate("/login");
  };

  // Wait for redirect check
  if (!urlUsername) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <DashboardHeader user={user} onLogout={handleLogOut} />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, {user.username.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">
            Here's an overview of your call activity and billing information.
          </p>
        </div>

        <div className="flex justify-end">
          <TimeRangeSelector
            selectedRange={selectedTimeRange}
            onRangeChange={setSelectedTimeRange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CallStatsCard
            title="Total Calls"
            value={stats.totalCalls}
            description="Inbound calls received"
            trend="up"
            trendValue="+12%"
            icon={<Phone className="h-5 w-5 text-primary" />}
          />
          <CallStatsCard
            title="Call Minutes"
            value={stats.totalMinutes}
            description="Total talk time"
            trend="up"
            trendValue="+8%"
            icon={<Clock className="h-5 w-5 text-accent" />}
          />
          <CallStatsCard
            title="Total Cost"
            value={`$${stats.totalCost.toFixed(2)}`}
            description="Current period charges"
            trend="neutral"
            trendValue="0%"
            icon={<DollarSign className="h-5 w-5 text-success" />}
          />
          <CallStatsCard
            title="Avg Duration"
            value={`${Math.round(stats.averageDuration)}m`}
            description="Average call length"
            trend="down"
            trendValue="-3%"
            icon={<TrendingUp className="h-5 w-5 text-warning" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CallLogTable
              callLogs={filteredLogs}
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
            />
          </div>

          <div className="lg:col-span-1">
            <BillingSection billingData={billingData} />
          </div>
        </div>
      </main>
    </div>
  );
}
