import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatSession, ChatState, SessionData, ChatPreferences, PdfSource } from '../types';
import { createPdfReasoningGraph } from '../api/langGraphApi';
import { createSessionStore } from '../api/sessionStore';

const DEFAULT_THREAD_ID = 'default';

// Default chat preferences
const DEFAULT_PREFERENCES: ChatPreferences = {
  sourceVisibility: 'onHover',
  temperature: 0.7,
  maxTokens: 1000,
  includeCitations: true,
  conversationStyle: 'balanced'
};

export function usePdfChat(pdfContent?: string) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const reasoningGraphRef = useRef<any>(null);
  const sessionStoreRef = useRef(createSessionStore<ChatState>());

  // Load sessions from storage on component mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        // For localStorage-based implementation, this gets all sessions
        if ('getAllSessions' in sessionStoreRef.current) {
          const allSessions = await (sessionStoreRef.current as any).getAllSessions();
          if (allSessions && allSessions.length > 0) {
            setSessions(allSessions);
            
            // Select the most recent session if one exists
            const mostRecent = allSessions.reduce((prev: ChatSession, current: ChatSession) => 
              current.updatedAt > prev.updatedAt ? current : prev
            );
            setCurrentSessionId(mostRecent.id);
          }
        } else {
          // For implementations without getAllSessions, we'd need to get by ID
          // This would be implemented differently for server-based stores
          const sessionIds = await sessionStoreRef.current.list?.() || [];
          const sessionsData = await Promise.all(
            sessionIds.map(async (id) => {
              const data = await sessionStoreRef.current.get(id);
              return data?.session;
            })
          );
          
          const validSessions = sessionsData.filter(Boolean) as ChatSession[];
          if (validSessions.length > 0) {
            setSessions(validSessions);
            
            // Select the most recent session
            const mostRecent = validSessions.reduce((prev, current) => 
              current.updatedAt > prev.updatedAt ? current : prev
            );
            setCurrentSessionId(mostRecent.id);
          }
        }
      } catch (error) {
        console.error('Failed to load chat sessions:', error);
      }
    };
    
    loadSessions();
  }, []);

  // Initialize reasoning graph when PDF content is provided
  useEffect(() => {
    if (pdfContent) {
      reasoningGraphRef.current = createPdfReasoningGraph(pdfContent);
    }
  }, [pdfContent]);

  // Get the current session
  const currentSession = useCallback(() => {
    return sessions.find(session => session.id === currentSessionId) || null;
  }, [sessions, currentSessionId]);

  // Create a new chat session
  const createSession = useCallback(async (title: string = 'New Chat', pdfId?: string, threadId: string = DEFAULT_THREAD_ID) => {
    const sessionId = uuidv4();
    const now = new Date();
    
    const newSession: ChatSession = {
      id: sessionId,
      title,
      messages: [],
      state: {
        pdfId,
        lastActive: now,
        preferences: { ...DEFAULT_PREFERENCES } // Add default preferences
      },
      createdAt: now,
      updatedAt: now,
      threadId
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    
    // Save to persistent storage
    await sessionStoreRef.current.save(sessionId, {
      session: newSession,
      state: newSession.state
    });
    
    return sessionId;
  }, []);

  // Add a message to a session
  const addMessage = useCallback(async (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      id: uuidv4(),
      ...message,
      timestamp: new Date()
    };
    
    // Update local state
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? {
              ...session,
              messages: [...session.messages, newMessage],
              updatedAt: new Date(),
              state: {
                ...session.state,
                lastActive: new Date()
              }
            } 
          : session
      )
    );
    
    // Update in persistent storage
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      const updatedSession = {
        ...session,
        messages: [...session.messages, newMessage],
        updatedAt: new Date(),
        state: {
          ...session.state,
          lastActive: new Date()
        }
      };
      
      await sessionStoreRef.current.save(sessionId, {
        session: updatedSession,
        state: updatedSession.state
      });
    }
    
    return newMessage;
  }, [sessions]);

  // Send a message and get a response
  const sendMessage = useCallback(async (content: string, sessionId: string = currentSessionId || '') => {
    if (!sessionId) {
      sessionId = await createSession();
    }
    
    // Add user message
    await addMessage(sessionId, {
      role: 'user',
      content
    });
    
    setLoading(true);
    
    try {
      let response = '';
      let sources: PdfSource[] = [];
      
      // Get current session preferences
      const session = sessions.find(s => s.id === sessionId);
      const preferences = session?.state.preferences || DEFAULT_PREFERENCES;
      
      // Process with LangGraph if available
      if (reasoningGraphRef.current && pdfContent) {
        // Pass preferences to the reasoning graph
        if (preferences.temperature) {
          reasoningGraphRef.current.setOption('temperature', preferences.temperature);
        }
        
        if (preferences.conversationStyle) {
          reasoningGraphRef.current.setOption('conversation_style', preferences.conversationStyle);
        }
        
        if (preferences.maxTokens) {
          reasoningGraphRef.current.setOption('max_tokens', preferences.maxTokens);
        }
        
        // Process the query
        const result = await reasoningGraphRef.current.processQueryWithSources(content, preferences.includeCitations);
        response = result.response;
        sources = result.sources || [];
      } else {
        response = "I'm sorry, but I don't have access to the PDF content. Please upload a PDF first.";
      }
      
      // Add assistant response with sources
      await addMessage(sessionId, {
        role: 'assistant',
        content: response,
        sources: sources.length > 0 ? sources : undefined
      });
      
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      await addMessage(sessionId, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.'
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentSessionId, createSession, addMessage, pdfContent, sessions]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    // Remove from local state
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    
    // If we deleted the current session, select another one
    if (sessionId === currentSessionId) {
      setCurrentSessionId(sessions.length > 1 ? sessions[0].id : null);
    }
    
    // Remove from persistent storage
    if (sessionStoreRef.current.delete) {
      await sessionStoreRef.current.delete(sessionId);
    }
  }, [sessions, currentSessionId]);

  // Clear all messages in a session
  const clearSessionMessages = useCallback(async (sessionId: string) => {
    // Update local state
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? {
              ...session,
              messages: [],
              updatedAt: new Date()
            } 
          : session
      )
    );
    
    // Update in persistent storage
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      const updatedSession = {
        ...session,
        messages: [],
        updatedAt: new Date()
      };
      
      await sessionStoreRef.current.save(sessionId, {
        session: updatedSession,
        state: updatedSession.state
      });
    }
  }, [sessions]);

  // Rename a session
  const renameSession = useCallback(async (sessionId: string, newTitle: string) => {
    // Update local state
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? {
              ...session,
              title: newTitle,
              updatedAt: new Date()
            } 
          : session
      )
    );
    
    // Update in persistent storage
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      const updatedSession = {
        ...session,
        title: newTitle,
        updatedAt: new Date()
      };
      
      await sessionStoreRef.current.save(sessionId, {
        session: updatedSession,
        state: updatedSession.state
      });
    }
  }, [sessions]);

  // Update session state
  const updateSessionState = useCallback(async (sessionId: string, newState: Partial<ChatState>) => {
    // Update local state
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? {
              ...session,
              state: {
                ...session.state,
                ...newState
              },
              updatedAt: new Date()
            } 
          : session
      )
    );
    
    // Update in persistent storage
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      const updatedSession = {
        ...session,
        state: {
          ...session.state,
          ...newState
        },
        updatedAt: new Date()
      };
      
      await sessionStoreRef.current.save(sessionId, {
        session: updatedSession,
        state: updatedSession.state
      });
    }
  }, [sessions]);

  // Update session preferences
  const updateSessionPreferences = useCallback(async (sessionId: string, preferences: Partial<ChatPreferences>) => {
    // Update local state
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? {
              ...session,
              state: {
                ...session.state,
                preferences: {
                  ...(session.state.preferences || DEFAULT_PREFERENCES),
                  ...preferences
                }
              },
              updatedAt: new Date()
            } 
          : session
      )
    );
    
    // Update in persistent storage
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      const updatedSession = {
        ...session,
        state: {
          ...session.state,
          preferences: {
            ...(session.state.preferences || DEFAULT_PREFERENCES),
            ...preferences
          }
        },
        updatedAt: new Date()
      };
      
      await sessionStoreRef.current.save(sessionId, {
        session: updatedSession,
        state: updatedSession.state
      });
    }
  }, [sessions]);

  // Load a specific session
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const sessionData = await sessionStoreRef.current.get(sessionId);
      if (sessionData) {
        // If we don't already have this session in local state, add it
        if (!sessions.some(s => s.id === sessionId)) {
          setSessions(prev => [sessionData.session, ...prev]);
        }
        setCurrentSessionId(sessionId);
        return sessionData.session;
      }
      return null;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }, [sessions]);

  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    currentSession: currentSession(),
    loading,
    createSession,
    sendMessage,
    deleteSession,
    clearSessionMessages,
    renameSession,
    updateSessionState,
    updateSessionPreferences,
    loadSession,
    DEFAULT_PREFERENCES
  };
}
