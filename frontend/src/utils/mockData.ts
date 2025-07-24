import { addDays, subDays, subHours, subMinutes } from "date-fns";

export interface CallLog {
  id: string;
  date: Date;
  duration: number; // in minutes
  caller: string;
  status: "completed" | "missed" | "ongoing";
  cost: number;
  summary: string;
  callType: "support" | "sales" | "consultation" | "follow-up" | "technical";
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Mock user data
export const mockUser: User = {
  id: "1",
  name: "Sarah Johnson",
  email: "sarah.johnson@company.com",
  avatar: undefined
};

// Rate per minute in USD
export const RATE_PER_MINUTE = 0.20;

// Generate mock call logs
export const generateMockCallLogs = (count: number = 50): CallLog[] => {
  const callers = [
    "John Smith",
    "Emma Wilson",
    "Michael Brown",
    "Lisa Davis",
    "David Miller",
    "Jennifer Garcia",
    "Robert Johnson",
    "Ashley Martinez",
    "Christopher Lee",
    "Amanda Rodriguez",
    "Matthew Taylor",
    "Stephanie Anderson",
    "James White",
    "Nicole Thompson",
    "Daniel Harris",
    "Michelle Clark",
    "Kevin Lewis",
    "Rachel Walker",
    "Brian Hall",
    "Samantha Young"
  ];

  const callTypes: CallLog["callType"][] = ["support", "sales", "consultation", "follow-up", "technical"];
  const statuses: CallLog["status"][] = ["completed", "completed", "completed", "completed", "missed", "ongoing"];

  const summaryTemplates = {
    support: [
      "Customer reported login issues, provided troubleshooting steps and account verification.",
      "Technical support for payment processing errors, resolved billing discrepancy.",
      "User assistance with feature configuration, walked through setup process.",
      "Account access issues resolved, password reset completed successfully.",
      "Product functionality questions answered, provided documentation links."
    ],
    sales: [
      "Initial product demo conducted, customer showed strong interest in premium features.",
      "Follow-up call to discuss pricing options and implementation timeline.",
      "Product consultation for enterprise plan, scheduled technical review meeting.",
      "Demo of AI features completed, customer requested proposal for team plan.",
      "Pricing discussion and contract negotiation, awaiting decision next week."
    ],
    consultation: [
      "Strategic consultation on AI implementation roadmap and best practices.",
      "Business requirements analysis completed, recommended optimal configuration.",
      "Process optimization discussion, identified key automation opportunities.",
      "Implementation planning session, defined project milestones and timeline.",
      "Custom solution design review, technical architecture discussion."
    ],
    "follow-up": [
      "Status check on recent implementation, customer reported positive results.",
      "Post-launch review completed, discussed performance metrics and optimization.",
      "Follow-up on support ticket resolution, confirmed issue was fully resolved.",
      "Customer satisfaction survey, gathered feedback for product improvement.",
      "Scheduled quarterly business review, discussed expansion opportunities."
    ],
    technical: [
      "API integration troubleshooting, resolved authentication configuration issues.",
      "System performance analysis completed, recommended optimization strategies.",
      "Database connectivity issues diagnosed and resolved with IT team.",
      "Security audit discussion, reviewed compliance requirements and implementation.",
      "Technical architecture review, planned infrastructure scaling approach."
    ]
  };

  return Array.from({ length: count }, (_, i) => {
    const date = subMinutes(
      subHours(
        subDays(new Date(), Math.floor(Math.random() * 30)),
        Math.floor(Math.random() * 24)
      ),
      Math.floor(Math.random() * 60)
    );
    
    const duration = Math.floor(Math.random() * 45) + 5; // 5-50 minutes
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const callType = callTypes[Math.floor(Math.random() * callTypes.length)];
    const cost = status === "completed" ? duration * RATE_PER_MINUTE : 0;
    
    let summary = "";
    if (status === "completed") {
      const templates = summaryTemplates[callType];
      summary = templates[Math.floor(Math.random() * templates.length)];
    } else if (status === "missed") {
      summary = "Call was not answered, voicemail left for customer callback.";
    } else {
      summary = "Call currently in progress...";
    }

    return {
      id: `call-${i + 1}`,
      date,
      duration: status === "missed" ? 0 : duration,
      caller: callers[Math.floor(Math.random() * callers.length)],
      status,
      cost,
      summary,
      callType
    };
  }).sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const mockCallLogs = generateMockCallLogs();

// Calculate summary statistics
export const calculateStats = (logs: CallLog[]) => {
  const completedCalls = logs.filter(log => log.status === "completed");
  const totalMinutes = completedCalls.reduce((sum, log) => sum + log.duration, 0);
  const totalCost = completedCalls.reduce((sum, log) => sum + log.cost, 0);
  const averageDuration = completedCalls.length > 0 ? totalMinutes / completedCalls.length : 0;

  return {
    totalCalls: logs.length,
    completedCalls: completedCalls.length,
    missedCalls: logs.filter(log => log.status === "missed").length,
    totalMinutes,
    totalCost,
    averageDuration
  };
};

// Export functions for CSV and Excel
export const exportToCSV = (logs: CallLog[]) => {
  const headers = ["Date", "Time", "Caller", "Duration (minutes)", "Status", "Call Type", "Cost", "Summary"];
  const csvContent = [
    headers.join(","),
    ...logs.map(log => [
      log.date.toLocaleDateString(),
      log.date.toLocaleTimeString(),
      `"${log.caller}"`,
      log.duration,
      log.status,
      log.callType,
      log.cost.toFixed(2),
      `"${log.summary}"`
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `call-logs-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export const exportToExcel = (logs: CallLog[]) => {
  // For demo purposes, we'll export as CSV with .xlsx extension
  // In a real app, you'd use a library like xlsx
  const headers = ["Date", "Time", "Caller", "Duration (minutes)", "Status", "Call Type", "Cost", "Summary"];
  const csvContent = [
    headers.join(","),
    ...logs.map(log => [
      log.date.toLocaleDateString(),
      log.date.toLocaleTimeString(),
      `"${log.caller}"`,
      log.duration,
      log.status,
      log.callType,
      log.cost.toFixed(2),
      `"${log.summary}"`
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `call-logs-${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
};