import { useState, useEffect } from 'react';
import { FileText, ChevronDown, ChevronUp, PlusCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SourcePanelProps {
  pdfContent: string;
  pdfTitle: string;
  selectedSourceId: string | null;
  onSelectSource: (sourceId: string, text?: string) => void;
  highlightedText: string | null;
}

interface PdfSource {
  id: string;
  title: string;
  content: string;
  pageNumber: number;
}

export function SourcePanel({ 
  pdfContent, 
  pdfTitle, 
  selectedSourceId, 
  onSelectSource,
  highlightedText 
}: SourcePanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sources, setSources] = useState<PdfSource[]>([]);
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);

  // Create fake page sources from the PDF content (in a real app, this would parse the PDF properly)
  useEffect(() => {
    if (!pdfContent) return;
    
    // Split the content into pages (simplified approach)
    const pageSize = 2000; // characters per "page"
    const pageCount = Math.ceil(pdfContent.length / pageSize);
    
    const sourcesData: PdfSource[] = Array.from({ length: pageCount }, (_, i) => {
      const startIdx = i * pageSize;
      const endIdx = Math.min((i + 1) * pageSize, pdfContent.length);
      const pageContent = pdfContent.substring(startIdx, endIdx);
      
      return {
        id: `page-${i + 1}`,
        title: `${pdfTitle} - Page ${i + 1}`,
        content: pageContent,
        pageNumber: i + 1
      };
    });
    
    setSources(sourcesData);
  }, [pdfContent, pdfTitle]);

  // Filter sources based on search term
  const filteredSources = searchTerm
    ? sources.filter(source => 
        source.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sources;

  // Toggle source expansion
  const toggleExpand = (sourceId: string) => {
    setExpandedSourceId(expandedSourceId === sourceId ? null : sourceId);
  };

  // Highlight text in content
  const highlightTextInContent = (content: string, highlight: string | null) => {
    if (!highlight) return content;
    
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = content.split(regex);
    
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark> : part
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search sources..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredSources.map(source => (
            <div 
              key={source.id}
              className={cn(
                "border rounded-md overflow-hidden transition-all",
                selectedSourceId === source.id ? "border-primary" : "border-border",
                expandedSourceId === source.id ? "shadow-sm" : ""
              )}
            >
              <div 
                className={cn(
                  "p-3 flex items-start gap-2 cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedSourceId === source.id && "bg-muted"
                )}
                onClick={() => onSelectSource(source.id)}
              >
                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm truncate">{source.title}</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 ml-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(source.id);
                      }}
                    >
                      {expandedSourceId === source.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Page {source.pageNumber}
                  </div>
                </div>
              </div>
              
              {expandedSourceId === source.id && (
                <div className="p-3 border-t bg-muted/30 text-sm max-h-[300px] overflow-y-auto">
                  <div className="whitespace-pre-wrap">
                    {highlightTextInContent(source.content, highlightedText)}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {filteredSources.length === 0 && (
            <div className="text-center p-4 text-muted-foreground">
              {searchTerm ? "No matching sources found" : "No sources available"}
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t">
        <Button variant="outline" size="sm" className="w-full" disabled={!pdfContent}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add source
        </Button>
      </div>
    </div>
  );
} 