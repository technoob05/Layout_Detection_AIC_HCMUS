import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { TranslationMetric } from "../types";

interface MetricCardProps {
  metric: TranslationMetric;
  formatValue?: (value: number) => string;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ 
  metric, 
  formatValue = (value) => value.toString(), 
  icon, 
  className 
}: MetricCardProps) {
  const { label, value, change } = metric;
  
  const isPositiveChange = change && change > 0;
  const isNegativeChange = change && change < 0;
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold">{formatValue(value)}</h3>
              
              {change !== undefined && (
                <div 
                  className={cn(
                    "text-xs font-medium flex items-center gap-0.5",
                    isPositiveChange && "text-green-500",
                    isNegativeChange && "text-red-500"
                  )}
                >
                  {isPositiveChange && <ArrowUpIcon className="size-3" />}
                  {isNegativeChange && <ArrowDownIcon className="size-3" />}
                  {change}%
                </div>
              )}
            </div>
          </div>
          
          {icon && (
            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 