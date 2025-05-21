import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronDown, ChevronUp, List, Bookmark, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SummaryPoint {
  id: string;
  content: string;
  importance: 'high' | 'medium' | 'low';
}

interface SummarySection {
  id: string;
  title: string;
  content: string;
  keyPoints: SummaryPoint[];
}

interface Summary {
  id: string;
  title: string;
  description?: string;
  sections: SummarySection[];
}

interface SummaryViewProps {
  summaries: Summary[];
}

export function SummaryView({ summaries }: SummaryViewProps) {
  const { theme } = useTheme();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [currentSummaryIndex, setCurrentSummaryIndex] = useState(0);

  // Handle empty summaries array
  if (summaries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No summaries available yet. Generate materials to create summaries.</p>
      </div>
    );
  }

  const currentSummary = summaries[currentSummaryIndex];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const isSectionExpanded = (sectionId: string) => {
    return expandedSections[sectionId] ?? false;
  };

  // Get theme-specific classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'matrix':
        return {
          highlight: 'matrix-text',
          badgeHighImportance: 'bg-green-900 text-green-300',
          badgeMediumImportance: 'bg-blue-900 text-blue-300',
          badgeLowImportance: 'bg-gray-800 text-gray-300',
          badgeVariant: 'matrix' as const
        };
      case 'synthwave':
        return {
          highlight: 'gradient-text',
          badgeHighImportance: 'bg-pink-900 text-pink-300',
          badgeMediumImportance: 'bg-purple-900 text-purple-300',
          badgeLowImportance: 'bg-gray-800 text-gray-300',
          badgeVariant: 'synthwave' as const
        };
      case 'cyberpunk':
        return {
          highlight: 'text-yellow-500',
          badgeHighImportance: 'bg-yellow-900 text-yellow-300',
          badgeMediumImportance: 'bg-blue-900 text-blue-300',
          badgeLowImportance: 'bg-gray-800 text-gray-300',
          badgeVariant: 'cyberpunk' as const
        };
      case 'nord':
        return {
          highlight: 'text-blue-400',
          badgeHighImportance: 'bg-blue-900 text-blue-300',
          badgeMediumImportance: 'bg-teal-900 text-teal-300',
          badgeLowImportance: 'bg-gray-800 text-gray-300',
          badgeVariant: 'nord' as const
        };
      default:
        return {
          highlight: 'text-primary',
          badgeHighImportance: 'bg-primary/90 text-primary-foreground',
          badgeMediumImportance: 'bg-secondary text-secondary-foreground',
          badgeLowImportance: 'bg-muted text-muted-foreground',
          badgeVariant: 'default' as const
        };
    }
  };

  const themeClasses = getThemeClasses();

  const renderImportanceBadge = (importance: 'high' | 'medium' | 'low') => {
    let content = '';
    let className = '';
    
    switch (importance) {
      case 'high':
        content = 'Key Concept';
        className = themeClasses.badgeHighImportance;
        break;
      case 'medium':
        content = 'Important';
        className = themeClasses.badgeMediumImportance;
        break;
      case 'low':
        content = 'Supporting Detail';
        className = themeClasses.badgeLowImportance;
        break;
    }
    
    return (
      <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", className)}>
        {content}
      </span>
    );
  };

  // Summary selection buttons
  const renderSummarySelectors = () => {
    if (summaries.length <= 1) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Available Summaries:</h3>
        <div className="flex flex-wrap gap-2">
          {summaries.map((summary, index) => (
            <Button
              key={summary.id}
              size="sm"
              variant={currentSummaryIndex === index ? "default" : "outline"}
              onClick={() => setCurrentSummaryIndex(index)}
            >
              {summary.title || `Summary ${index + 1}`}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {renderSummarySelectors()}
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className={cn("size-5", themeClasses.highlight)} />
          {currentSummary.title}
        </h2>
        {currentSummary.description && (
          <p className="text-muted-foreground mt-1">{currentSummary.description}</p>
        )}
      </div>
      
      <Tabs defaultValue="sections">
        <TabsList className="mb-4">
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <List className="size-4" />
            Detailed Summary
          </TabsTrigger>
          <TabsTrigger value="keypoints" className="flex items-center gap-2">
            <Bookmark className="size-4" />
            Key Points
          </TabsTrigger>
          <TabsTrigger value="full" className="flex items-center gap-2">
            <FileText className="size-4" />
            Full Text
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sections" className="mt-0">
          <div className="space-y-4">
            {currentSummary.sections.map((section) => (
              <Card key={section.id} className="overflow-hidden">
                <CardHeader 
                  className={cn(
                    "cursor-pointer py-3"
                  )}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">{section.title}</CardTitle>
                    {isSectionExpanded(section.id) ? (
                      <ChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                
                {isSectionExpanded(section.id) && (
                  <CardContent className="pt-0">
                    <div className="mb-3 text-muted-foreground">
                      {section.content}
                    </div>
                    
                    {section.keyPoints.length > 0 && (
                      <div className="pt-3 border-t">
                        <h4 className="font-medium text-sm mb-2">Key Points:</h4>
                        <ul className="space-y-2">
                          {section.keyPoints.map((point) => (
                            <li key={point.id} className="flex items-start gap-2">
                              <div className="min-w-[100px] mt-1">
                                {renderImportanceBadge(point.importance)}
                              </div>
                              <div className="text-sm">{point.content}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="keypoints" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Key Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {currentSummary.sections.map((section) => (
                  <div key={section.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <h3 className="font-medium mb-2">{section.title}</h3>
                    <ul className="space-y-2">
                      {section.keyPoints
                        .filter(point => point.importance === 'high')
                        .map((point) => (
                          <li key={point.id} className="flex items-start gap-2">
                            <div className="min-w-[100px] mt-1">
                              {renderImportanceBadge(point.importance)}
                            </div>
                            <div className="text-sm">{point.content}</div>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="full" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] rounded-md">
                <div className="p-6 space-y-4">
                  {currentSummary.sections.map((section) => (
                    <div key={section.id} className="space-y-2">
                      <h3 className={cn("font-semibold text-lg", themeClasses.highlight)}>
                        {section.title}
                      </h3>
                      <p className="text-sm">{section.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 