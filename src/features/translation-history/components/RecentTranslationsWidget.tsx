import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink, FileText, Languages, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { Notification } from "@/components/ui/notification-toast";

// Mock data - In a real app, this would come from an API or state management
interface TranslationItem {
  id: string;
  title: string;
  sourceLanguage: string;
  targetLanguage: string;
  date: string;
  isFavorite: boolean;
}

const mockRecentTranslations: TranslationItem[] = [
  {
    id: "t1",
    title: "Financial Report Q3",
    sourceLanguage: "English",
    targetLanguage: "Japanese",
    date: "2024-11-28",
    isFavorite: true
  },
  {
    id: "t2",
    title: "Product Manual v2.3",
    sourceLanguage: "English",
    targetLanguage: "Spanish",
    date: "2024-11-27",
    isFavorite: false
  },
  {
    id: "t3",
    title: "Legal Contract - NDA",
    sourceLanguage: "German",
    targetLanguage: "English",
    date: "2024-11-26",
    isFavorite: false
  }
];

interface RecentTranslationsWidgetProps {
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

export function RecentTranslationsWidget({ 
  limit = 3, 
  showViewAll = true,
  className
}: RecentTranslationsWidgetProps) {
  const { theme } = useTheme();
  const [translations, setTranslations] = useState<TranslationItem[]>(mockRecentTranslations);
  
  // Function to toggle favorite status
  const toggleFavorite = (id: string) => {
    setTranslations(translations.map(item => {
      if (item.id === id) {
        const newStatus = !item.isFavorite;
        
        // Show notification
        if (newStatus) {
          Notification.success(`"${item.title}" added to favorites`, {
            description: "You can access your favorites from the settings page."
          });
        } else {
          Notification.info(`"${item.title}" removed from favorites`);
        }
        
        return { ...item, isFavorite: newStatus };
      }
      return item;
    }));
  };
  
  // Get the theme-specific classes
  const getThemeSpecificClasses = () => {
    switch (theme) {
      case "matrix":
        return "matrix-text";
      case "synthwave":
        return "gradient-text";
      default:
        return "";
    }
  };

  return (
    <Card className={cn("overflow-hidden transition-all", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={cn("text-xl", getThemeSpecificClasses())}>Recent Translations</CardTitle>
            <CardDescription>
              Quick access to your latest translated documents
            </CardDescription>
          </div>
          {showViewAll && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/history" className="flex items-center gap-1">
                <span>View all</span>
                <ExternalLink className="size-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {translations.slice(0, limit).length > 0 ? (
          <div className="space-y-3">
            {translations.slice(0, limit).map((translation) => (
              <div 
                key={translation.id}
                className={cn(
                  "group flex items-center gap-3 p-3 rounded-lg transition-all",
                  theme === "dark" ? "hover:bg-primary/10" : "hover:bg-accent",
                  theme === "synthwave" ? "hover:bg-primary/20" : "",
                  theme === "matrix" ? "hover:bg-primary/10" : "",
                  theme === "cyberpunk" ? "hover:bg-accent" : ""
                )}
              >
                <div className={cn(
                  "bg-primary/10 rounded-md p-2 flex-shrink-0 transition-all",
                  "group-hover:bg-primary/20 group-hover:scale-105"
                )}>
                  <FileText className={cn("size-5 text-primary", getThemeSpecificClasses())} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <Link to={`/history/${translation.id}`} className="block group-hover:opacity-90 transition-opacity">
                    <h4 className={cn(
                      "text-sm font-medium truncate",
                      getThemeSpecificClasses()
                    )}>
                      {translation.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Languages className="size-3" />
                        {translation.sourceLanguage} → {translation.targetLanguage}
                      </span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="size-3" />
                        {new Date(translation.date).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "flex-shrink-0 h-8 w-8 opacity-70 group-hover:opacity-100 transition-all",
                    translation.isFavorite ? "opacity-100" : ""
                  )}
                  onClick={() => toggleFavorite(translation.id)}
                  title={translation.isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star 
                    className={cn(
                      "size-4 transition-all", 
                      translation.isFavorite 
                        ? "fill-primary text-primary" 
                        : "text-muted-foreground"
                    )} 
                  />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <FileText className="size-12 mx-auto mb-3 opacity-30" />
            <h4 className="text-base font-medium mb-1">No translations yet</h4>
            <p className="text-sm mb-4">Your recent translations will appear here</p>
            <Button variant="outline" size="sm" className="rounded-full px-4" asChild>
              <Link to="/translate">Start translating</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 