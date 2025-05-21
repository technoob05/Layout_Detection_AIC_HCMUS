import { useState, useRef } from "react";
import { usePdfNotebook } from "../hooks/usePdfNotebook";
import { FileUploadArea } from "./FileUploadArea";
import { NotebookToolbar } from "./NotebookToolbar";
import { NotebookSidebar } from "./NotebookSidebar";
import { NotebookContent } from "./NotebookContent";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X, Upload, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotebookLmLayoutProps {
  className?: string;
}

export function NotebookLmLayout({ className }: NotebookLmLayoutProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfContent, setPdfContent] = useState<string>("");
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const notebook = usePdfNotebook(pdfFile || undefined, pdfContent);
  
  const handleFileSelect = async (file: File) => {
    setPdfFile(file);
    
    // Read file as text for processing
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setPdfContent(text);
    };
    reader.readAsText(file);
  };
  
  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfContent("");
  };
  
  return (
    <div className={cn("flex flex-col h-screen", className)}>
      {/* Toolbar (Top bar) */}
      <NotebookToolbar 
        pdfFile={pdfFile}
        title={pdfFile ? notebook.pdfTitle : "Upload a PDF to begin"}
        onRemovePdf={handleRemovePdf}
      />
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {pdfFile && (
          <NotebookSidebar 
            expanded={isSourcesExpanded}
            onToggleExpand={() => setIsSourcesExpanded(!isSourcesExpanded)}
            sourceGuide={notebook.sourceGuide}
            isLoading={notebook.isGeneratingSourceGuide}
            activeView={notebook.activeView}
            onChangeView={notebook.setActiveView}
            availableViews={notebook.availableViews}
          />
        )}
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-muted/30">
          {pdfFile ? (
            <NotebookContent
              pdfFile={pdfFile}
              notebook={notebook}
              sidebarExpanded={isSourcesExpanded}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <FileUploadArea 
                onFileSelect={handleFileSelect} 
                maxFileSize={10}
                acceptedFileTypes={[".pdf"]}
                className="max-w-xl mx-auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 