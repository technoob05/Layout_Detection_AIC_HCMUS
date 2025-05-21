import { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  MessageSquare, 
  Sparkles, 
  BookOpen, 
  RefreshCw,
  Send,
  Plus,
  Headphones,
  Network,
  Settings,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

import { usePdfNotebook } from '../hooks/usePdfNotebook';
import { SourcePanel } from './SourcePanel';
import { ChatPanel } from './ChatPanel';
import { SummaryPanel } from './SummaryPanel';
import { AudioOverviewPanel } from './AudioOverviewPanel';
import { MindMapPanel } from './MindMapPanel';
import { SlidesPanel } from './SlidesPanel';

interface PdfNotebookProps {
  pdfContent: string;
  pdfTitle: string;
  pdfFile?: File;
}

export function PdfNotebook({ pdfContent, pdfTitle, pdfFile }: PdfNotebookProps) {
  const {
    currentSession,
    loading,
    sendMessage,
    generateSummary,
    generateAudioOverview,
    generateMindMap,
    generateSlides,
    setSelectedSource,
    state
  } = usePdfNotebook(pdfContent, pdfTitle);

  const [inputMessage, setInputMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [sourcePanelWidth, setSourcePanelWidth] = useState(260);
  const [studioPanelWidth, setStudioPanelWidth] = useState(320);
  const [isSourcePanelCollapsed, setIsSourcePanelCollapsed] = useState(false);
  const [isStudioPanelCollapsed, setIsStudioPanelCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mobileActivePanel, setMobileActivePanel] = useState<'sources' | 'chat' | 'studio'>('chat');
  const sourceDragRef = useRef<HTMLDivElement>(null);
  const studioDragRef = useRef<HTMLDivElement>(null);

  // Check if we're in mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);

  // Setup panel resizing
  useEffect(() => {
    const sourceResizer = sourceDragRef.current;
    const studioResizer = studioDragRef.current;
    
    if (!sourceResizer || !studioResizer) return;
    
    let isSourceDragging = false;
    let isStudioDragging = false;
    
    const onMouseDown = (panel: 'source' | 'studio') => (e: MouseEvent) => {
      e.preventDefault();
      if (panel === 'source') {
        isSourceDragging = true;
      } else {
        isStudioDragging = true;
      }
    };
    
    const onMouseUp = () => {
      isSourceDragging = false;
      isStudioDragging = false;
    };
    
    const onMouseMove = (e: MouseEvent) => {
      if (isSourceDragging) {
        const newWidth = e.clientX;
        setSourcePanelWidth(Math.max(200, Math.min(newWidth, 400)));
      } else if (isStudioDragging) {
        const newWidth = window.innerWidth - e.clientX;
        setStudioPanelWidth(Math.max(250, Math.min(newWidth, 450)));
      }
    };
    
    sourceResizer.addEventListener('mousedown', onMouseDown('source'));
    studioResizer.addEventListener('mousedown', onMouseDown('studio'));
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    
    return () => {
      sourceResizer.removeEventListener('mousedown', onMouseDown('source'));
      studioResizer.removeEventListener('mousedown', onMouseDown('studio'));
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;
    
    sendMessage(inputMessage);
    setInputMessage('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (pdfContent && state.isAutoSummaryEnabled && !currentSession?.summary) {
      generateSummary();
    }
  }, [pdfContent, state.isAutoSummaryEnabled, currentSession?.summary, generateSummary]);

  if (isMobileView) {
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Mobile Navigation */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex gap-2">
            <Button 
              variant={mobileActivePanel === 'sources' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setMobileActivePanel('sources')}
              className="h-8"
            >
              <FileText className="h-4 w-4 mr-1" />
              Sources
            </Button>
            <Button 
              variant={mobileActivePanel === 'chat' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setMobileActivePanel('chat')}
              className="h-8"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Chat
            </Button>
            <Button 
              variant={mobileActivePanel === 'studio' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setMobileActivePanel('studio')}
              className="h-8"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Studio
            </Button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Sources Panel */}
          {mobileActivePanel === 'sources' && (
            <div className="h-full flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <h2 className="font-semibold flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Sources
                </h2>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <SourcePanel
                pdfContent={pdfContent}
                pdfTitle={pdfTitle}
                selectedSourceId={state.selectedSourceId}
                onSelectSource={setSelectedSource}
                highlightedText={state.highlightedText}
              />
            </div>
          )}
          
          {/* Chat Panel */}
          {mobileActivePanel === 'chat' && (
            <div className="h-full flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <h2 className="font-semibold flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </h2>
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>New conversation</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Chat settings</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden flex flex-col">
                <ChatPanel
                  messages={currentSession?.messages || []}
                  loading={loading}
                  onSourceClick={setSelectedSource}
                />
                
                {/* Message Input */}
                <div className="p-3 border-t mt-auto">
                  <form onSubmit={handleSendMessage} className="relative">
                    <Textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={handleTextareaChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask a question about the document..."
                      className="resize-none pr-12 min-h-[60px] max-h-[120px]"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className={cn(
                        "absolute right-2 bottom-2 h-8 w-8",
                        !inputMessage.trim() && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={!inputMessage.trim() || loading}
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                  {!currentSession?.messages.length && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => sendMessage("Summarize this document")}
                      >
                        Summarize document
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => sendMessage("What are the key points?")}
                      >
                        Key points
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => sendMessage("Explain the main concepts")}
                      >
                        Main concepts
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => {
                          generateSlides();
                          setMobileActivePanel('studio');
                          setActiveTab('slides');
                        }}
                      >
                        <ImageIcon className="h-3 w-3 mr-1" />
                        Visual slides
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Studio Panel */}
          {mobileActivePanel === 'studio' && (
            <div className="h-full flex flex-col">
              <div className="p-3 border-b">
                <h2 className="font-semibold flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Studio
                </h2>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="summary" className="flex-1 flex flex-col h-full" value={activeTab} onValueChange={setActiveTab}>
                  <div className="border-b">
                    <TabsList className="h-10 w-full rounded-none border-b-0 bg-transparent p-0">
                      <TabsTrigger
                        value="summary"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none flex-1 h-full"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Summary
                      </TabsTrigger>
                      <TabsTrigger
                        value="audio"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none flex-1 h-full"
                      >
                        <Headphones className="h-4 w-4 mr-2" />
                        Audio
                      </TabsTrigger>
                      <TabsTrigger
                        value="slides"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none flex-1 h-full"
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Slides
                      </TabsTrigger>
                      <TabsTrigger
                        value="mindmap"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none flex-1 h-full"
                      >
                        <Network className="h-4 w-4 mr-2" />
                        Mindmap
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <TabsContent value="summary" className="m-0 p-4 h-full">
                      <SummaryPanel
                        summary={currentSession?.summary}
                        isLoading={loading && activeTab === 'summary'}
                        onGenerate={generateSummary}
                      />
                    </TabsContent>
                    
                    <TabsContent value="audio" className="m-0 p-4 h-full">
                      <AudioOverviewPanel
                        audioOverview={currentSession?.audioOverview}
                        isLoading={loading && activeTab === 'audio'}
                        onGenerate={generateAudioOverview}
                      />
                    </TabsContent>
                    
                    <TabsContent value="slides" className="m-0 p-4 h-full">
                      <SlidesPanel
                        slideCollection={currentSession?.slideCollection}
                        isLoading={loading && activeTab === 'slides'}
                        onGenerate={generateSlides}
                      />
                    </TabsContent>
                    
                    <TabsContent value="mindmap" className="m-0 p-4 h-full">
                      <MindMapPanel
                        mindMap={currentSession?.mindMap}
                        isLoading={loading && activeTab === 'mindmap'}
                        onGenerate={generateMindMap}
                      />
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sources Panel - Resizable */}
      <div 
        className={cn(
          "flex flex-col border-r transition-all", 
          isSourcePanelCollapsed ? "w-12" : `w-[${sourcePanelWidth}px]`
        )}
        style={{ width: isSourcePanelCollapsed ? "48px" : `${sourcePanelWidth}px` }}
      >
        <div className="p-4 border-b flex items-center justify-between">
          {!isSourcePanelCollapsed && (
            <>
              <h2 className="font-semibold flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Sources
              </h2>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </>
          )}
          {isSourcePanelCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 mx-auto"
              onClick={() => setIsSourcePanelCollapsed(false)}
            >
              <FileText className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {!isSourcePanelCollapsed && (
          <SourcePanel
            pdfContent={pdfContent}
            pdfTitle={pdfTitle}
            selectedSourceId={state.selectedSourceId}
            onSelectSource={setSelectedSource}
            highlightedText={state.highlightedText}
          />
        )}
        
        {/* Resizer handle */}
        <div 
          ref={sourceDragRef}
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/40 z-10"
        />
        
        {/* Collapse/Expand button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2 h-6 w-6"
          onClick={() => setIsSourcePanelCollapsed(!isSourcePanelCollapsed)}
        >
          {isSourcePanelCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </h2>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New conversation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Chat settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <ChatPanel
          messages={currentSession?.messages || []}
          loading={loading}
          onSourceClick={setSelectedSource}
        />
        
        {/* Message Input */}
        <div className="p-4 border-t mt-auto">
          <form onSubmit={handleSendMessage} className="relative">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the document..."
              className="resize-none pr-12 min-h-[60px] max-h-[200px]"
            />
            <Button 
              type="submit" 
              size="icon" 
              className={cn(
                "absolute right-2 bottom-2 h-8 w-8",
                !inputMessage.trim() && "opacity-50 cursor-not-allowed"
              )}
              disabled={!inputMessage.trim() || loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          {!currentSession?.messages.length && (
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-secondary"
                onClick={() => sendMessage("Summarize this document")}
              >
                Summarize document
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-secondary"
                onClick={() => sendMessage("What are the key points?")}
              >
                Key points
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-secondary"
                onClick={() => sendMessage("Explain the main concepts")}
              >
                Main concepts
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-secondary"
                onClick={() => {
                  generateSlides();
                  setActiveTab("slides");
                }}
              >
                <ImageIcon className="h-3 w-3 mr-1" />
                Generate visual slides
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Studio Panel - Resizable */}
      <div 
        className={cn(
          "flex flex-col border-l transition-all", 
          isStudioPanelCollapsed ? "w-12" : `w-[${studioPanelWidth}px]`
        )}
        style={{ width: isStudioPanelCollapsed ? "48px" : `${studioPanelWidth}px` }}
      >
        <div className="p-4 border-b">
          {!isStudioPanelCollapsed && (
            <h2 className="font-semibold flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              Studio
            </h2>
          )}
          {isStudioPanelCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 mx-auto"
              onClick={() => setIsStudioPanelCollapsed(false)}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {!isStudioPanelCollapsed && (
          <Tabs defaultValue="summary" className="flex-1 flex flex-col" value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b">
              <TabsList className="h-12 w-full rounded-none border-b-0 bg-transparent p-0">
                <TabsTrigger
                  value="summary"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none flex-1 h-full"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Summary
                </TabsTrigger>
                <TabsTrigger
                  value="audio"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none flex-1 h-full"
                >
                  <Headphones className="h-4 w-4 mr-2" />
                  Audio
                </TabsTrigger>
                <TabsTrigger
                  value="slides"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none flex-1 h-full"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Slides
                </TabsTrigger>
                <TabsTrigger
                  value="mindmap"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none flex-1 h-full"
                >
                  <Network className="h-4 w-4 mr-2" />
                  Mindmap
                </TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="flex-1">
              <TabsContent value="summary" className="m-0 p-4">
                <SummaryPanel
                  summary={currentSession?.summary}
                  isLoading={loading && activeTab === 'summary'}
                  onGenerate={generateSummary}
                />
              </TabsContent>
              
              <TabsContent value="audio" className="m-0 p-4">
                <AudioOverviewPanel
                  audioOverview={currentSession?.audioOverview}
                  isLoading={loading && activeTab === 'audio'}
                  onGenerate={generateAudioOverview}
                />
              </TabsContent>
              
              <TabsContent value="slides" className="m-0 p-4">
                <SlidesPanel
                  slideCollection={currentSession?.slideCollection}
                  isLoading={loading && activeTab === 'slides'}
                  onGenerate={generateSlides}
                />
              </TabsContent>
              
              <TabsContent value="mindmap" className="m-0 p-4">
                <MindMapPanel
                  mindMap={currentSession?.mindMap}
                  isLoading={loading && activeTab === 'mindmap'}
                  onGenerate={generateMindMap}
                />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
        
        {/* Resizer handle */}
        <div 
          ref={studioDragRef}
          className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/40 z-10"
        />
        
        {/* Collapse/Expand button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute left-2 top-2 h-6 w-6"
          onClick={() => setIsStudioPanelCollapsed(!isStudioPanelCollapsed)}
        >
          {isStudioPanelCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 