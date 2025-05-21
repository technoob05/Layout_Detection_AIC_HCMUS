import { 
  Share2, 
  Settings, 
  MoreVertical, 
  Download, 
  Trash,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NotebookToolbarProps {
  pdfFile: File | null;
  title: string;
  onRemovePdf: () => void;
  className?: string;
}

export function NotebookToolbar({ 
  pdfFile, 
  title, 
  onRemovePdf,
  className 
}: NotebookToolbarProps) {
  const handleDownloadPdf = () => {
    if (!pdfFile) return;
    
    const url = URL.createObjectURL(pdfFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = pdfFile.name;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-2 h-14 border-b bg-background z-10",
      className
    )}>
      {/* Left side - Source info */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <FileText className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-medium truncate max-w-[300px]">{title}</h1>
        </div>
      </div>
      
      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {pdfFile && (
          <>
            <Button variant="ghost" size="icon" onClick={handleDownloadPdf}>
              <Download className="size-4" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={onRemovePdf}>
              <Trash className="size-4" />
            </Button>
            
            <Button variant="ghost" size="icon">
              <Share2 className="size-4" />
            </Button>
            
            <Button variant="ghost" size="icon">
              <Settings className="size-4" />
            </Button>
          </>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>Help & feedback</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>About</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 