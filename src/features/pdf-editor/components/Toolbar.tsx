import { AnnotationType } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

// Icons
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  HighlighterIcon,
  UnderlineIcon,
  StrikethroughIcon,
  TypeIcon,
  PencilIcon,
  SquareIcon,
  CircleIcon,
  ArrowUpRight,
  Languages,
  Sidebar,
  Save,
  Upload
} from 'lucide-react';

interface ToolbarProps {
  currentPage: number;
  totalPages: number;
  scale: number;
  selectedTool: AnnotationType | null;
  isEditing: boolean;
  sourceLanguage: string;
  targetLanguage: string;
  availableLanguages: { code: string; name: string; }[];
  showSidebar: boolean;
  onPageChange: (page: number) => void;
  onScaleChange: (scale: number) => void;
  onToolSelect: (tool: AnnotationType | null) => void;
  onLanguageChange: (source: string, target: string) => void;
  toggleSidebar: () => void;
}

export function Toolbar({
  currentPage,
  totalPages,
  scale,
  selectedTool,
  sourceLanguage,
  targetLanguage,
  availableLanguages,
  showSidebar,
  onPageChange,
  onScaleChange,
  onToolSelect,
  onLanguageChange,
  toggleSidebar
}: ToolbarProps) {
  const toolOptions: { type: AnnotationType | null, icon: ReactNode, tooltip: string }[] = [
    { type: null, icon: <RotateCcw className="size-4" />, tooltip: 'Select Mode' },
    { type: 'highlight', icon: <HighlighterIcon className="size-4" />, tooltip: 'Highlight Text' },
    { type: 'underline', icon: <UnderlineIcon className="size-4" />, tooltip: 'Underline Text' },
    { type: 'strikethrough', icon: <StrikethroughIcon className="size-4" />, tooltip: 'Strikethrough Text' },
    { type: 'text', icon: <TypeIcon className="size-4" />, tooltip: 'Add Text Note' },
    { type: 'drawing', icon: <PencilIcon className="size-4" />, tooltip: 'Freehand Drawing' },
    { type: 'rectangle', icon: <SquareIcon className="size-4" />, tooltip: 'Draw Rectangle' },
    { type: 'ellipse', icon: <CircleIcon className="size-4" />, tooltip: 'Draw Ellipse' },
    { type: 'arrow', icon: <ArrowUpRight className="size-4" />, tooltip: 'Draw Arrow' },
    { type: 'translation', icon: <Languages className="size-4" />, tooltip: 'Translate Selection' }
  ];

  return (
    <div className="flex items-center justify-between gap-2 p-2 border-b bg-card">
      {/* Page Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="size-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (!isNaN(page) && page >= 1 && page <= totalPages) {
                onPageChange(page);
              }
            }}
            className="w-16 text-center"
          />
          <span className="text-sm text-muted-foreground">/ {totalPages}</span>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      
      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onScaleChange(scale - 0.1)}
          disabled={scale <= 0.25}
        >
          <ZoomOut className="size-4" />
        </Button>
        
        <span className="text-sm w-16 text-center">
          {Math.round(scale * 100)}%
        </span>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onScaleChange(scale + 0.1)}
          disabled={scale >= 3}
        >
          <ZoomIn className="size-4" />
        </Button>
      </div>
      
      {/* Annotation Tools */}
      <div className="flex items-center gap-1">
        {toolOptions.map((tool) => (
          <TooltipProvider key={tool.tooltip}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedTool === tool.type ? "secondary" : "outline"}
                  size="icon"
                  onClick={() => onToolSelect(tool.type)}
                  className={cn(
                    "size-8",
                    selectedTool === tool.type && "bg-primary/20" 
                  )}
                >
                  {tool.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tool.tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      
      {/* Language Selection */}
      <div className="flex items-center gap-2">
        <Select value={sourceLanguage} onValueChange={(value) => onLanguageChange(value, targetLanguage)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Languages</SelectLabel>
              {availableLanguages.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={targetLanguage} onValueChange={(value) => onLanguageChange(sourceLanguage, value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Target" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Languages</SelectLabel>
              {availableLanguages.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      {/* Sidebar Toggle & Save */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className={cn(showSidebar && "bg-primary/20")}
        >
          <Sidebar className="size-4" />
        </Button>
        
        <Button variant="outline" size="icon">
          <Save className="size-4" />
        </Button>
        
        <Button variant="outline" size="icon">
          <Upload className="size-4" />
        </Button>
      </div>
    </div>
  );
} 