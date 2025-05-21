import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguagePair } from "../types";
import { cn } from "@/lib/utils";

interface LanguagePairsChartProps {
  title?: string;
  data: LanguagePair[];
  className?: string;
}

export function LanguagePairsChart({ 
  title = "Popular Language Pairs",
  data,
  className
}: LanguagePairsChartProps) {
  // Get the maximum count to calculate relative bar widths
  const maxCount = data.length > 0 ? Math.max(...data.map(pair => pair.count)) : 1;
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No language pair data available
            </p>
          ) : (
            data.slice(0, 5).map((pair, index) => (
              <div key={`${pair.source}-${pair.target}`} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {pair.source} → {pair.target}
                  </span>
                  <span className="text-muted-foreground">{pair.count}</span>
                </div>
                
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      index === 0 ? "bg-primary" : "bg-primary/70"
                    )}
                    style={{ width: `${(pair.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 