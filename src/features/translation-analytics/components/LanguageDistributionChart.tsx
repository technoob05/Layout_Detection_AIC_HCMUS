import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageUsage } from "../types";
import { cn } from "@/lib/utils";

interface LanguageDistributionChartProps {
  title: string;
  data: LanguageUsage[];
  className?: string;
}

export function LanguageDistributionChart({ 
  title,
  data,
  className
}: LanguageDistributionChartProps) {
  // Generate a unique color for each language (these are pastel colors)
  const getBackgroundColor = (index: number) => {
    const colors = [
      'bg-blue-200 dark:bg-blue-900',
      'bg-green-200 dark:bg-green-900',
      'bg-violet-200 dark:bg-violet-900',
      'bg-yellow-200 dark:bg-yellow-900',
      'bg-red-200 dark:bg-red-900',
      'bg-indigo-200 dark:bg-indigo-900',
      'bg-pink-200 dark:bg-pink-900',
      'bg-cyan-200 dark:bg-cyan-900',
      'bg-orange-200 dark:bg-orange-900',
      'bg-emerald-200 dark:bg-emerald-900',
    ];
    
    return colors[index % colors.length];
  };
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No language data available
          </p>
        ) : (
          <>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {data.slice(0, 6).map((item, index) => (
                <div key={item.language} className="flex items-center space-x-2">
                  <div className={cn("size-3 rounded-full", getBackgroundColor(index))} />
                  <span className="text-xs">{item.language} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
            
            {/* Donut chart */}
            <div className="relative">
              <div className="flex items-center justify-center">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="60" 
                    fill="none" 
                    stroke="#e5e7eb" 
                    strokeWidth="20"
                    className="dark:stroke-gray-800"
                  />
                  
                  {/* Generate pie segments */}
                  {data.slice(0, 6).map((item, index, array) => {
                    // Calculate stroke dash properties
                    const circumference = 2 * Math.PI * 60;
                    const offset = array
                      .slice(0, index)
                      .reduce((sum, curr) => sum + curr.percentage, 0);
                    
                    return (
                      <circle
                        key={item.language}
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        strokeWidth="20"
                        className={getBackgroundColor(index)}
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (circumference * item.percentage) / 100}
                        style={{
                          transformOrigin: 'center',
                          transform: `rotate(${offset * 3.6}deg)`,
                        }}
                      />
                    );
                  })}
                  
                  {/* Center circle */}
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="40" 
                    className="fill-background" 
                  />
                </svg>
                
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-medium">{data.length}</span>
                  <span className="text-xs text-muted-foreground">Languages</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 