import { useState } from 'react';
import { Bot, User, FileText, ChevronDown, ChevronUp, Info, MessageSquare, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '../../pdf-translator/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatPanelProps {
  messages: ChatMessage[];
  loading?: boolean;
  onSourceClick?: (sourceId: string, text?: string) => void;
}

export function ChatPanel({ messages, loading = false, onSourceClick }: ChatPanelProps) {
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);

  // Toggle message sources visibility
  const toggleSources = (messageId: string) => {
    setExpandedMessageId(expandedMessageId === messageId ? null : messageId);
  };

  // Handle source click
  const handleSourceClick = (source: any) => {
    if (onSourceClick) {
      // Extract page number from the source to determine sourceId
      const sourceId = `page-${source.page}`;
      onSourceClick(sourceId, source.text);
    }
  };

  return (
    <ScrollArea className="flex-1 pb-4">
      <div className="p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4 max-w-md">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-medium">Ask questions about your PDF</h3>
              <p className="text-muted-foreground">
                Chat with your document to get quick answers, summaries, and explanations.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role !== 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={cn(
                'group flex flex-col max-w-[85%]',
                message.role === 'user' ? 'items-end' : 'items-start'
              )}>
                <div className={cn(
                  'rounded-lg py-2 px-3',
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted border'
                )}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                
                {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                  <div className="mt-1.5">
                    <div className="flex items-center gap-1.5">
                      <Badge 
                        variant="outline" 
                        className="text-xs gap-1 cursor-pointer hover:bg-secondary transition-colors"
                        onClick={() => toggleSources(message.id)}
                      >
                        <FileText className="h-3 w-3" />
                        {message.sources.length} {message.sources.length === 1 ? 'source' : 'sources'}
                        {expandedMessageId === message.id ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </Badge>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-xs">
                              Sources are sections from the document that were used to generate this response
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {expandedMessageId === message.id && (
                      <div className="mt-2 space-y-2">
                        {message.sources.map((source, idx) => (
                          <div 
                            key={idx} 
                            className="p-2 text-sm rounded-md bg-muted/50 border border-muted cursor-pointer hover:bg-muted"
                            onClick={() => handleSourceClick(source)}
                          >
                            <div className="flex items-center gap-1 mb-1 text-xs text-muted-foreground">
                              <FileText className="h-3 w-3" />
                              <span>Page {source.page}</span>
                              {source.confidence && (
                                <span className="text-xs bg-primary/10 rounded-full px-2 py-0.5 ml-auto">
                                  {source.confidence}% confidence
                                </span>
                              )}
                            </div>
                            <p className="text-xs line-clamp-2">{source.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="rounded-lg py-2 px-3 bg-muted border max-w-[85%]">
              <div className="flex items-center gap-1.5">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
} 