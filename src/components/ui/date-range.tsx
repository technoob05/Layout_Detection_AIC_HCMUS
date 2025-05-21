import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { useState } from "react";

export function DateRange({
  className,
  onRangeChange
}: {
  className?: string;
  onRangeChange?: (range: { from: Date; to: Date }) => void;
}) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  const handleRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    if (onRangeChange) {
      onRangeChange(range);
    }
  };

  // Apply predefined date ranges
  const applyRange = (days: number) => {
    const to = new Date();
    const from = addDays(to, -days);
    handleRangeChange({ from, to });
  };

  return (
    <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
      <div className="relative">
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 size-4" />
          {dateRange.from ? (
            <>
              {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
            </>
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </div>

      <div className="flex gap-1">
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "text-xs",
            dateRange.from && 
            addDays(dateRange.to, -7).getTime() <= dateRange.from.getTime() && 
            dateRange.to.getTime() >= dateRange.from.getTime() && 
            "bg-muted"
          )}
          onClick={() => applyRange(7)}
        >
          7d
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "text-xs",
            dateRange.from && 
            addDays(dateRange.to, -30).getTime() <= dateRange.from.getTime() && 
            dateRange.to.getTime() >= dateRange.from.getTime() && 
            "bg-muted"
          )}
          onClick={() => applyRange(30)}
        >
          30d
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "text-xs",
            dateRange.from && 
            addDays(dateRange.to, -90).getTime() <= dateRange.from.getTime() && 
            dateRange.to.getTime() >= dateRange.from.getTime() && 
            "bg-muted"
          )}
          onClick={() => applyRange(90)}
        >
          90d
        </Button>
      </div>
    </div>
  );
} 