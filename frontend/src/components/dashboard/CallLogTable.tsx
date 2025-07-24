import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, Phone, Clock, Calendar, ChevronDown, ChevronRight, FileText, Tag } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

interface CallLog {
  id: string;
  date: Date;
  duration: number; // in minutes
  caller: string;
  status: "completed" | "missed" | "ongoing";
  cost: number;
  summary: string;
  callType: "support" | "sales" | "consultation" | "follow-up" | "technical";
}

interface CallLogTableProps {
  callLogs: CallLog[];
  onExportCSV: () => void;
  onExportExcel: () => void;
}

export function CallLogTable({ callLogs, onExportCSV, onExportExcel }: CallLogTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());



  const toggleRowExpansion = (callId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(callId)) {
      newExpandedRows.delete(callId);
    } else {
      newExpandedRows.add(callId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getStatusVariant = (status: CallLog["status"]) => {
    switch (status) {
      case "completed":
        return "default";
      case "missed":
        return "destructive";
      case "ongoing":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getCallTypeVariant = (callType: CallLog["callType"]) => {
    switch (callType) {
      case "support":
        return "secondary";
      case "sales":
        return "default";
      case "consultation":
        return "outline";
      case "follow-up":
        return "secondary";
      case "technical":
        return "outline";
      default:
        return "outline";
    }
  };

  const getCallTypeColor = (callType: CallLog["callType"]) => {
    switch (callType) {
      case "support":
        return "text-blue-600";
      case "sales":
        return "text-green-600";
      case "consultation":
        return "text-purple-600";
      case "follow-up":
        return "text-orange-600";
      case "technical":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const truncateSummary = (summary: string, maxLength: number = 60) => {
    if (summary.length <= maxLength) return summary;
    return summary.substring(0, maxLength) + "...";
  };

  useEffect((() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched data:', data);
    
      });
  }), [])

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Call Activity Log
            </CardTitle>
            <CardDescription>
              Detailed view of your recent call activity with summaries
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCSV}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportExcel}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="w-[140px]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date & Time
                  </div>
                </TableHead>
                <TableHead>Caller</TableHead>
                <TableHead className="w-[120px]">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Type
                  </div>
                </TableHead>
                <TableHead className="min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Summary
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[100px] text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {callLogs.map((call) => (
                <Collapsible
                  key={call.id}
                  open={expandedRows.has(call.id)}
                  onOpenChange={() => toggleRowExpansion(call.id)}
                  asChild
                >
                  <>
                    <TableRow className="hover:bg-muted/50">
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-6 w-6"
                          >
                            {expandedRows.has(call.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {format(call.date, "MMM dd, HH:mm")}
                      </TableCell>
                      <TableCell className="font-medium">{call.caller}</TableCell>
                      <TableCell>
                        <Badge variant={getCallTypeVariant(call.callType)} className="capitalize">
                          {call.callType}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="text-sm text-muted-foreground">
                          {truncateSummary(call.summary)}
                          {call.summary.length > 60 && (
                            <button
                              onClick={() => toggleRowExpansion(call.id)}
                              className="text-primary hover:text-primary/80 ml-1 text-xs underline"
                            >
                              {expandedRows.has(call.id) ? "less" : "more"}
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatDuration(call.duration)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(call.status)} className="capitalize">
                          {call.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${call.cost.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell colSpan={7}>
                          <div className="py-3 px-4 bg-muted/30 rounded-lg border-l-4 border-primary">
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="font-medium text-sm mb-1">Call Summary</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {}
                                </p>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}