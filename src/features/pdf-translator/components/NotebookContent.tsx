import { useEffect, useState } from "react";
import { PdfPreview } from "./PdfPreview";
import { EnhancedPdfChat } from "./EnhancedPdfChat";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Play, Pause, GitBranch, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { AudioOverview, MindMapNode } from "../types";

interface NotebookContentProps {
  pdfFile: File;
  notebook: any; // Using any for now, but would be better to type this
  sidebarExpanded: boolean;
  className?: string;
}

export function NotebookContent({ 
  pdfFile, 
  notebook,
  sidebarExpanded,
  className 
}: NotebookContentProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Handle audio playback
  useEffect(() => {
    // In a real implementation, this would control an audio player
    return () => {
      // Cleanup audio player on unmount
    };
  }, [isPlaying]);
  
  // Select the right content based on active view
  const renderContent = () => {
    switch (notebook.activeView) {
      case 'chat':
        return (
          <div className="h-full">
            <EnhancedPdfChat 
              pdfContent={notebook.pdfChat.pdfContent} 
              pdfTitle={notebook.pdfTitle} 
            />
          </div>
        );
        
      case 'sources':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 h-full overflow-auto">
            <Card className="p-4 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
              <h2 className="text-lg font-semibold mb-4">PDF Document</h2>
              <div className="flex-1">
                <PdfPreview file={pdfFile} className="h-full" />
              </div>
            </Card>
            
            <Card className="p-4 overflow-auto h-[calc(100vh-8rem)]">
              <h2 className="text-lg font-semibold mb-4">Document Overview</h2>
              
              {notebook.isGeneratingSummary ? (
                <div className="flex items-center justify-center h-40">
                  <Loader className="size-6 text-muted-foreground animate-spin mr-2" />
                  <span className="text-muted-foreground">Generating summary...</span>
                </div>
              ) : notebook.pdfSummary ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-muted-foreground">Overview</h3>
                    <p className="mt-2">{notebook.pdfSummary.overview}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-muted-foreground">Key Points</h3>
                    <ul className="mt-2 space-y-2">
                      {notebook.pdfSummary.keyPoints.map((point: string, index: number) => (
                        <li key={index} className="flex">
                          <span className="text-primary mr-2">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-muted-foreground">Topics</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {notebook.pdfSummary.topics.map((topic: string, index: number) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-primary/10 text-primary"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-center py-6">
                  No summary available
                </div>
              )}
            </Card>
          </div>
        );
        
      case 'audio':
        return (
          <div className="h-full p-4 overflow-auto">
            <Card className="p-6 max-w-3xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6">Audio Overview</h2>
              
              {notebook.audioOverview.isGenerating ? (
                <div className="flex items-center justify-center h-40">
                  <Loader className="size-6 text-muted-foreground animate-spin mr-2" />
                  <span className="text-muted-foreground">Generating audio overview...</span>
                </div>
              ) : notebook.audioOverview.transcript ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-center bg-muted p-8 rounded-lg">
                    <Button 
                      size="lg" 
                      className="size-16 rounded-full"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="size-6" />
                      ) : (
                        <Play className="size-6 ml-1" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Transcript</h3>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <p className="whitespace-pre-line">
                        {notebook.audioOverview.transcript}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No audio overview available</p>
                  <Button onClick={() => notebook.generateAudioOverview()}>
                    Generate Audio Overview
                  </Button>
                </div>
              )}
            </Card>
          </div>
        );
        
      case 'mindmap':
        return (
          <div className="h-full p-4 overflow-auto">
            <Card className="p-6 h-[calc(100vh-8rem)]">
              <h2 className="text-2xl font-semibold mb-6">Mind Map</h2>
              
              {notebook.isGeneratingMindMap ? (
                <div className="flex items-center justify-center h-40">
                  <Loader className="size-6 text-muted-foreground animate-spin mr-2" />
                  <span className="text-muted-foreground">Generating mind map...</span>
                </div>
              ) : notebook.mindMap ? (
                <div className="h-full flex items-center justify-center">
                  <SimpleMindMap node={notebook.mindMap} />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No mind map available</p>
                  <Button onClick={() => notebook.generateMindMap()}>
                    Generate Mind Map
                  </Button>
                </div>
              )}
            </Card>
          </div>
        );
        
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Select a view from the sidebar</p>
          </div>
        );
    }
  };
  
  return (
    <div className={cn("h-full", className)}>
      {renderContent()}
    </div>
  );
}

// Simple mind map visualization component
function SimpleMindMap({ node }: { node: MindMapNode }) {
  if (!node) return null;
  
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-auto p-4">
      <div className="bg-primary/10 p-6 rounded-xl border border-primary/20 z-10">
        <h3 className="text-xl font-medium text-center">{node.label}</h3>
        
        {node.children && node.children.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {node.children.map((child) => (
              <div 
                key={child.id}
                className="bg-background p-4 rounded-lg border shadow-sm"
              >
                <h4 className="text-md font-medium mb-2">{child.label}</h4>
                
                {child.children && child.children.length > 0 && (
                  <ul className="space-y-1 text-sm">
                    {child.children.map((subChild) => (
                      <li key={subChild.id} className="flex">
                        <span className="text-primary mr-2">•</span>
                        <span>{subChild.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 