import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, AlertCircle } from "lucide-react";

interface BillingData {
  currentPeriod: {
    totalMinutes: number;
    totalCost: number;
    periodStart: Date;
    periodEnd: Date;
  };
  ratePerMinute: number;
  monthlyLimit?: number;
  usagePercentage: number;
}

interface BillingSectionProps {
  billingData: BillingData;
}

export function BillingSection({ billingData }: BillingSectionProps) {
  const { currentPeriod, ratePerMinute, monthlyLimit, usagePercentage } = billingData;
  
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  
  const getUsageStatus = () => {
    if (usagePercentage >= 90) return { color: "destructive", text: "High usage" };
    if (usagePercentage >= 70) return { color: "warning", text: "Moderate usage" };
    return { color: "success", text: "Normal usage" };
  };

  const usageStatus = getUsageStatus();

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Current Billing Period
          </CardTitle>
          <CardDescription>
            {currentPeriod.periodStart.toLocaleDateString()} - {currentPeriod.periodEnd.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Minutes</p>
              <p className="text-2xl font-bold">{currentPeriod.totalMinutes}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Rate per Minute</p>
              <p className="text-2xl font-bold">{formatCurrency(ratePerMinute)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(currentPeriod.totalCost)}</p>
            </div>
          </div>

          {monthlyLimit && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Monthly Usage</p>
                <Badge variant={usageStatus.color as any} className="flex items-center gap-1">
                  {usagePercentage >= 90 && <AlertCircle className="h-3 w-3" />}
                  {usageStatus.text}
                </Badge>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(currentPeriod.totalCost)} used</span>
                <span>{formatCurrency(monthlyLimit)} limit</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Billing Breakdown
          </CardTitle>
          <CardDescription>
            Transparent cost calculation for this period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Call minutes ({currentPeriod.totalMinutes} min)</span>
              <span className="font-mono">{formatCurrency(currentPeriod.totalCost)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Service fees</span>
              <span className="font-mono text-muted-foreground">$0.00</span>
            </div>
            <div className="flex justify-between items-center py-2 font-medium">
              <span>Total Amount</span>
              <span className="font-mono text-lg">{formatCurrency(currentPeriod.totalCost)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}