import { useState, useRef, useEffect } from 'react';
import { usePdfChat } from '../hooks/usePdfChat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  SendHorizontal, 
  Sparkles, 
  Bot, 
  User, 
  Clock,
  Save,
  MoreVertical,
  Trash,
  Edit,
  ChevronDown,
  HistoryIcon,
  Settings,
  FileText,
  Quote,
  Info,
  Sliders,
  Terminal,
  X,
  CornerDownLeft,
  Maximize2,
  Minimize2,
  Check,
  Eraser
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatMessage, ChatPreferences, PdfSource } from '../types';

interface EnhancedPdfChatProps {
  pdfContent: string;
  pdfTitle: string;
}

// Typing animation component
function TypingAnimation() {
  return (
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

// Source citation component
function SourceCitation({ source, index }: { source: PdfSource, index: number }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className={cn(
      "relative px-3 py-2 bg-muted/50 text-sm rounded-md mb-2 border-l-2 border-primary/30 hover:border-primary transition-colors",
      expanded && "border-l-4 border-primary"
    )}>
      <div className="flex items-start gap-2">
        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-primary text-xs font-medium shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="font-medium flex items-center gap-1 mb-1">
            <FileText className="h-3 w-3" /> 
            <span>Page {source.page}</span>
            <span className="text-xs bg-primary/10 rounded-full px-2 py-0.5 ml-1">
              {source.confidence}% confidence
            </span>
          </div>
          <div className={cn(
            "text-muted-foreground line-clamp-2",
            expanded && "line-clamp-none"
          )}>
            {source.text}
          </div>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        className="absolute right-1 top-1 h-6 w-6 p-0"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
      </Button>
    </div>
  );
}

// Preferences Dialog
function PreferencesDialog({ 
  open, 
  onOpenChange, 
  preferences,
  onUpdatePreferences 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  preferences: ChatPreferences;
  onUpdatePreferences: (preferences: Partial<ChatPreferences>) => void;
}) {
  const [localPreferences, setLocalPreferences] = useState<ChatPreferences>({...preferences});
  
  // Reset local preferences when dialog opens
  useEffect(() => {
    setLocalPreferences({...preferences});
  }, [open, preferences]);
  
  const handleSave = () => {
    onUpdatePreferences(localPreferences);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chat Preferences</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="sources" className="mt-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="model">Model</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sources" className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="citations">Include citations</Label>
                <Switch 
                  id="citations" 
                  checked={localPreferences.includeCitations} 
                  onCheckedChange={(checked) => setLocalPreferences(prev => ({...prev, includeCitations: checked}))}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                When enabled, responses will include citations to specific parts of the PDF document
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Source visibility</Label>
              <Select 
                value={localPreferences.sourceVisibility}
                onValueChange={(value: any) => setLocalPreferences(prev => ({...prev, sourceVisibility: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Always visible</SelectItem>
                  <SelectItem value="onHover">Show on hover</SelectItem>
                  <SelectItem value="onClick">Show on click</SelectItem>
                  <SelectItem value="never">Never show</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Control when source citations are displayed in the chat
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="model" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Temperature</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm">Precise</span>
                <div className="flex-1">
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.1" 
                    value={localPreferences.temperature} 
                    onChange={(e) => setLocalPreferences(prev => ({
                      ...prev, 
                      temperature: parseFloat(e.target.value)
                    }))}
                    className="w-full"
                  />
                </div>
                <span className="text-sm">Creative</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Controls the randomness of responses. Lower values are more focused and deterministic.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Max response length</Label>
              <Select 
                value={localPreferences.maxTokens?.toString()}
                onValueChange={(value) => setLocalPreferences(prev => ({...prev, maxTokens: parseInt(value)}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">Short (500 tokens)</SelectItem>
                  <SelectItem value="1000">Medium (1000 tokens)</SelectItem>
                  <SelectItem value="2000">Long (2000 tokens)</SelectItem>
                  <SelectItem value="4000">Very long (4000 tokens)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="style" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Conversation style</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['concise', 'balanced', 'creative'] as const).map((style) => (
                  <Button
                    key={style}
                    type="button"
                    variant={localPreferences.conversationStyle === style ? "default" : "outline"}
                    onClick={() => setLocalPreferences(prev => ({...prev, conversationStyle: style}))}
                    className="h-auto py-4 px-2 flex flex-col items-center gap-2 justify-between"
                  >
                    {style === 'concise' && <Terminal className="h-4 w-4" />}
                    {style === 'balanced' && <Sliders className="h-4 w-4" />}
                    {style === 'creative' && <Sparkles className="h-4 w-4" />}
                    <span className="capitalize">{style}</span>
                    {localPreferences.conversationStyle === style && (
                      <Check className="h-3 w-3 absolute top-1 right-1" />
                    )}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Concise provides brief, to-the-point responses. Creative offers more elaborate and expressive responses. Balanced is in between.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
          <Button onClick={handleSave}>Save preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EnhancedPdfChat({ pdfContent, pdfTitle }: EnhancedPdfChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [showSourcesFor, setShowSourcesFor] = useState<string | null>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  
  const {
    currentSession,
    sessions,
    loading,
    sendMessage,
    createSession,
    currentSessionId,
    setCurrentSessionId,
    clearSessionMessages,
    deleteSession,
    renameSession,
    updateSessionState,
    updateSessionPreferences,
    loadSession,
    DEFAULT_PREFERENCES
  } = usePdfChat(pdfContent);
  
  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentSession?.messages]);
  
  // Create a new session if none exists
  useEffect(() => {
    if (!currentSessionId) {
      createSession(`Chat with ${pdfTitle}`);
    } else if (currentSession && pdfContent) {
      // Update PDF info in session state if needed
      if (
        currentSession.state.pdfTitle !== pdfTitle ||
        !currentSession.state.lastActive
      ) {
        updateSessionState(currentSessionId, {
          pdfTitle,
          lastActive: new Date()
        });
      }
    }
  }, [currentSessionId, createSession, pdfTitle, currentSession, pdfContent, updateSessionState]);
  
  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle submitting a message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || loading) return;
    
    await sendMessage(inputMessage.trim());
    setInputMessage('');
    
    // Refocus input after sending
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };
  
  // Handle clearing messages
  const handleClear = () => {
    if (currentSessionId) {
      clearSessionMessages(currentSessionId);
    }
  };

  // Handle deleting a session
  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
  };

  // Handle switching to a different session
  const handleSwitchSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  // Handle creating a new session
  const handleNewSession = () => {
    createSession(`Chat with ${pdfTitle}`);
  };

  // Handle starting session title editing
  const handleStartEditTitle = (sessionId: string, currentTitle: string) => {
    setEditingTitle(sessionId);
    setNewTitle(currentTitle);
  };

  // Handle saving session title
  const handleSaveTitle = (sessionId: string) => {
    if (newTitle.trim()) {
      renameSession(sessionId, newTitle.trim());
    }
    setEditingTitle(null);
  };

  // Handle key press in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Handle auto-resize of textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    
    // Auto-resize
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Handle updating preferences
  const handleUpdatePreferences = (newPreferences: Partial<ChatPreferences>) => {
    if (currentSessionId) {
      updateSessionPreferences(currentSessionId, newPreferences);
    }
  };
  
  // Toggle sources visibility for a message
  const toggleSources = (messageId: string) => {
    if (showSourcesFor === messageId) {
      setShowSourcesFor(null);
    } else {
      setShowSourcesFor(messageId);
    }
  };
  
  // Helper to determine if sources should be shown for a message
  const shouldShowSources = (message: ChatMessage) => {
    const preference = currentSession?.state.preferences?.sourceVisibility || 'onHover';
    
    if (!message.sources || message.sources.length === 0) return false;
    if (preference === 'never') return false;
    if (preference === 'always') return true;
    if (preference === 'onClick') return showSourcesFor === message.id;
    
    // Default is onHover - we'll handle this with CSS
    return false;
  };
  
  return (
    <div className="flex h-full dark:bg-gradient-to-tr from-gray-900 to-gray-800">
      {/* Session history sidebar */}
      {showSessionHistory && (
        <div className="w-72 border-r p-3 flex flex-col h-full overflow-hidden bg-background/80 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium flex items-center gap-1.5">
              <HistoryIcon className="h-4 w-4" />
              Chat History
            </h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setShowSessionHistory(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full justify-start mb-4"
            onClick={handleNewSession}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            New Chat
          </Button>
          
          <div className="space-y-1.5 overflow-y-auto flex-1">
            {sessions.map(session => (
              <div 
                key={session.id}
                className={cn(
                  "p-2.5 rounded-md cursor-pointer flex flex-col group relative",
                  session.id === currentSessionId 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted"
                )}
                onClick={() => handleSwitchSession(session.id)}
              >
                <div className="flex justify-between items-start">
                  {editingTitle === session.id ? (
                    <div className="flex-1 flex">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-transparent border rounded-sm px-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                        onBlur={() => handleSaveTitle(session.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveTitle(session.id);
                          }
                        }}
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-5 w-5 ml-1"
                        onClick={() => handleSaveTitle(session.id)}
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium truncate flex-1">
                        {session.title}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 ml-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditTitle(session.id, session.title);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }} className="text-destructive">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
                
                <div className="flex items-center mt-1 text-xs text-muted-foreground space-x-2">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDate(session.state.lastActive || session.updatedAt)}
                  </span>
                  {session.messages.length > 0 && (
                    <Badge variant="outline" className="text-[10px] h-4">
                      {session.messages.length} msgs
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Main chat area */}
      <div className="flex flex-col flex-1 h-full">
        {/* Chat header */}
        <div className="p-3 border-b flex justify-between items-center backdrop-blur-sm bg-background/80">
          <div className="flex items-center">
            {!showSessionHistory && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 mr-2"
                onClick={() => setShowSessionHistory(true)}
              >
                <HistoryIcon className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h3 className="font-medium">{currentSession?.title || 'Chat with PDF'}</h3>
              <p className="text-xs text-muted-foreground">{pdfTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setPreferencesOpen(true)}
              title="Chat preferences"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {currentSession && (
                  <DropdownMenuItem onClick={() => handleStartEditTitle(currentSession.id, currentSession.title)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Rename chat
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleClear}>
                  <Eraser className="h-4 w-4 mr-2" />
                  Clear messages
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleNewSession}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  New chat
                </DropdownMenuItem>
                {currentSession && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteSession(currentSession.id)}
                      className="text-destructive"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete chat
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 pb-0">
          {currentSession?.messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-4 max-w-md animate-fade-in-up">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
                  <Sparkles className="size-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium">Ask questions about your PDF</h3>
                <p className="text-muted-foreground">
                  This AI can analyze the PDF contents and answer your specific questions.
                  Try asking:
                </p>
                <div className="grid gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start group sidebar-button"
                    onClick={() => sendMessage("What is the main topic of this document?")}
                  >
                    <span className="mr-2 text-primary">•</span>
                    "What is the main topic of this document?"
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start group sidebar-button"
                    onClick={() => sendMessage("Can you summarize this document for me?")}
                  >
                    <span className="mr-2 text-primary">•</span>
                    "Can you summarize this document for me?"
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start group sidebar-button"
                    onClick={() => sendMessage("Extract all the key facts from this document.")}
                  >
                    <span className="mr-2 text-primary">•</span>
                    "Extract all the key facts from this document."
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            currentSession?.messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "group flex items-start gap-3 transition-opacity message-container",
                  message.role === 'user' ? "justify-end" : "justify-start",
                  "animate-fade-in-up",
                  index === 0 && "delay-100",
                  index === 1 && "delay-200",
                  index === 2 && "delay-300"
                )}
              >
                {message.role !== 'user' && (
                  <Avatar className="size-8 rounded-md">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className="flex flex-col max-w-[85%]">
                  <div className={cn(
                    "rounded-lg p-4 relative",
                    message.role === 'user' 
                      ? "bg-primary/10 text-foreground" 
                      : "bg-muted"
                  )}>
                    <div className="whitespace-pre-wrap">
                      {message.content}
                      {/* Show typing animation if loading and this is the last assistant message */}
                      {loading && message.role === 'assistant' && index === (currentSession?.messages.length ?? 0) - 1 && <TypingAnimation />}
                    </div>
                    <div className={cn(
                      "text-xs mt-2 opacity-70 text-right flex items-center justify-end gap-2",
                      "opacity-0 group-hover:opacity-70 transition-opacity"
                    )}>
                      {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                        <button 
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                          onClick={() => toggleSources(message.id)}
                          title="Show sources"
                        >
                          <Quote className="h-3 w-3" />
                          <span>{message.sources.length} {message.sources.length === 1 ? 'source' : 'sources'}</span>
                        </button>
                      )}
                      <span>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Source citations */}
                  {message.role === 'assistant' && message.sources && 
                   (shouldShowSources(message) || showSourcesFor === message.id) && (
                    <div className="mt-2 pl-2 space-y-1 animate-in slide-in-from-left duration-200">
                      <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        <span>Sources from PDF document:</span>
                      </div>
                      {message.sources.map((source, idx) => (
                        <SourceCitation key={idx} source={source} index={idx} />
                      ))}
                    </div>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <Avatar className="size-8 rounded-md">
                    <AvatarFallback className="bg-primary/10 text-foreground">
                      <User className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex items-center gap-3 animate-fade-in">
              <Avatar className="size-8 rounded-md">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Bot className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input form */}
        <div className="p-4 border-t mt-auto backdrop-blur-sm bg-background/80">
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your PDF..."
              className="resize-none pr-12 max-h-32 py-3"
              disabled={loading}
              rows={1}
            />
            <Button 
              type="submit" 
              size="icon"
              className="absolute right-2 bottom-2 size-8 rounded-full"
              disabled={loading || !inputMessage.trim()}
            >
              <SendHorizontal className="size-4" />
            </Button>
            
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" />
                <span>Press <kbd className="px-1.5 py-0.5 bg-muted-foreground/20 rounded text-xs">Enter</kbd> to send</span>
                <span className="mx-1">•</span>
                <span><kbd className="px-1.5 py-0.5 bg-muted-foreground/20 rounded text-xs">Shift+Enter</kbd> for new line</span>
              </div>
              {!showSessionHistory && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSessionHistory(true)}
                  className="h-6 text-xs gap-1"
                >
                  <HistoryIcon className="size-3" />
                  Chat history
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Preferences Dialog */}
      {currentSession && (
        <PreferencesDialog
          open={preferencesOpen}
          onOpenChange={setPreferencesOpen}
          preferences={currentSession.state.preferences || DEFAULT_PREFERENCES}
          onUpdatePreferences={handleUpdatePreferences}
        />
      )}
    </div>
  );
} 