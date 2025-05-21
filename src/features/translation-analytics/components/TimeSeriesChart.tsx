import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeSeriesData } from "../types";
import { cn } from "@/lib/utils";

interface TimeSeriesChartProps {
  title?: string;
  data: TimeSeriesData[];
  className?: string;
}

export function TimeSeriesChart({ 
  title = "Translations Over Time",
  data,
  className
}: TimeSeriesChartProps) {
  // Get the maximum count for scaling
  const maxCount = data.length > 0 ? Math.max(...data.map(item => item.count)) : 1;
  
  // Calculate chart dimensions
  const chartHeight = 140;
  const barWidth = 100 / data.length;
  
  // Format the date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No time series data available
          </p>
        ) : (
          <div className="relative" style={{ height: `${chartHeight}px` }}>
            <div className="absolute inset-0 flex items-end justify-between">
              {data.map((item, index) => {
                const height = maxCount > 0 ? (item.count / maxCount) * chartHeight : 0;
                
                return (
                  <div 
                    key={item.date} 
                    className="group relative h-full flex flex-col justify-end"
                    style={{ width: `${barWidth}%` }}
                  >
                    <div 
                      className="w-full bg-primary/70 rounded-t"
                      style={{ height: `${height}px` }}
                    />
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-background border border-border shadow-md rounded px-2 py-1 text-xs whitespace-nowrap">
                        <p className="font-medium">{formatDate(item.date)}</p>
                        <p className="text-muted-foreground">{item.count} translations</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* X-axis labels - only show a few for readability */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between mt-2 pt-2 border-t border-border">
              {data.filter((_, i) => i % 5 === 0 || i === data.length - 1).map(item => (
                <div key={item.date} className="text-xs text-muted-foreground">
                  {formatDate(item.date)}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 