import { useState, useRef, useEffect } from 'react';
import { usePdfChat } from '../hooks/usePdfChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  SendHorizontal, 
  Sparkles, 
  Bot, 
  User, 
  Loader,
  AlertCircle, 
  Eraser,
  Clock,
  Save,
  MoreVertical,
  Trash,
  Edit,
  ChevronDown,
  HistoryIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface PdfChatProps {
  pdfContent: string;
  pdfTitle: string;
  modernUI?: boolean;
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

export function PdfChat({ pdfContent, pdfTitle, modernUI = false }: PdfChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Use a more general ref type to accommodate both textarea and input
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  
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
    loadSession
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
    const textarea = inputRef.current as HTMLTextAreaElement | null;
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
  
  return (
    <div className={cn(
      "flex",
      modernUI ? "h-full" : "h-[600px] bg-background border rounded-lg overflow-hidden"
    )}>
      {/* Session history sidebar */}
      {modernUI && showSessionHistory && (
        <div className="w-64 border-r p-3 flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Chat History</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setShowSessionHistory(false)}
            >
              <ChevronDown className="h-4 w-4" />
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
          
          <div className="space-y-2 overflow-y-auto flex-1">
            {sessions.map(session => (
              <div 
                key={session.id}
                className={cn(
                  "p-2 rounded-md cursor-pointer flex flex-col group relative",
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
      <div className={cn(
        "flex flex-col flex-1",
        modernUI && "h-full"
      )}>
        {/* Chat header */}
        {!modernUI ? (
          <div className="p-4 border-b flex justify-between items-center bg-card">
            <div>
              <h3 className="font-medium text-lg">Chat with PDF</h3>
              <p className="text-sm text-muted-foreground">{pdfTitle}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear Chat
            </Button>
          </div>
        ) : (
          <div className="p-3 border-b flex justify-between items-center">
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
        )}
        
        {/* Messages container */}
        <div className={cn(
          "flex-1 overflow-y-auto space-y-4",
          modernUI ? "p-4 pb-0" : "p-4"
        )}>
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
                    onClick={() => sendMessage("What are the key points in the third section?")}
                  >
                    <span className="mr-2 text-primary">•</span>
                    "What are the key points in the third section?"
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
                  modernUI && "animate-fade-in-up",
                  modernUI && index === 0 && "delay-100",
                  modernUI && index === 1 && "delay-200",
                  modernUI && index === 2 && "delay-300"
                )}
              >
                {modernUI && message.role !== 'user' && (
                  <Avatar className="size-8 rounded-md">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn(
                  "max-w-[85%] rounded-lg p-4 relative",
                  message.role === 'user' 
                    ? modernUI 
                      ? "bg-primary/10 text-foreground" 
                      : "bg-primary text-primary-foreground"
                    : modernUI
                      ? "bg-muted"
                      : "bg-muted"
                )}>
                  <div className="whitespace-pre-wrap">
                    {message.content}
                    {/* Show typing animation if loading and this is the last assistant message */}
                    {loading && message.role === 'assistant' && index === (currentSession?.messages.length ?? 0) - 1 && <TypingAnimation />}
                  </div>
                  <div className={cn(
                    "text-xs mt-2 opacity-70 text-right",
                    modernUI && "opacity-0 group-hover:opacity-70 transition-opacity"
                  )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                {modernUI && message.role === 'user' && (
                  <Avatar className="size-8 rounded-md">
                    <AvatarFallback className="bg-primary/10 text-foreground">
                      <User className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          
          {loading && modernUI && (
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
        <div className={cn(
          modernUI ? "p-4 border-t mt-auto" : "p-4 border-t"
        )}>
          <form onSubmit={handleSubmit} className="relative">
            {modernUI ? (
              <>
                <Textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
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
                  <div>Press <kbd className="px-1.5 py-0.5 bg-muted-foreground/20 rounded text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-muted-foreground/20 rounded text-xs">Shift+Enter</kbd> for new line</div>
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
              </>
            ) : (
              <div className="flex space-x-2">
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask a question about your PDF..."
                  className="flex-1 py-2 px-4 rounded-md bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !inputMessage.trim()}>
                  {loading ? 'Thinking...' : 'Send'}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
