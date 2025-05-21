import { RefreshCw, BookOpen, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { PdfSummary } from '../types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SummaryPanelProps {
  summary: PdfSummary | undefined;
  isLoading: boolean;
  onGenerate: () => void;
}

export function SummaryPanel({ summary, isLoading, onGenerate }: SummaryPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center h-full">
        <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
        <h3 className="font-medium text-lg mb-2">Generating Summary</h3>
        <p className="text-muted-foreground text-sm">
          Analyzing the document and extracting key information...
        </p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center h-full">
        <BookOpen className="h-8 w-8 text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-2">No Summary Available</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Generate a summary to quickly understand the main points of this document.
        </p>
        <Button onClick={onGenerate}>
          Generate Summary
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">{summary.title || "Document Summary"}</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={onGenerate}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="whitespace-pre-wrap text-sm">
          {summary.content}
        </div>
      </ScrollArea>
    </div>
  );
} 