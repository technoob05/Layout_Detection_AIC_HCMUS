import { ChatSession, ChatState, SessionData, SessionStore } from '../types';

// Local storage key for sessions
const STORAGE_KEY = 'pdf_chat_sessions';

/**
 * LocalStorageSessionStore - A session store implementation using localStorage
 * This is suitable for browser environments but should be replaced with a server-based
 * solution in production for better persistence and multi-device support
 */
export class LocalStorageSessionStore<S = ChatState> implements SessionStore<S> {
  // Get a session by ID
  async get(sessionId: string): Promise<SessionData<S> | undefined> {
    try {
      const storedSessions = localStorage.getItem(STORAGE_KEY);
      if (!storedSessions) return undefined;

      const sessions = JSON.parse(storedSessions) as ChatSession[];
      const session = sessions.find(s => s.id === sessionId);
      
      if (!session) return undefined;
      
      // Convert date strings back to Date objects
      const sessionWithDates = {
        ...session,
        messages: session.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })),
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt)
      };

      // Return in the SessionData format
      return {
        session: sessionWithDates,
        state: session.state as S
      };
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      return undefined;
    }
  }

  // Save a session
  async save(sessionId: string, sessionData: SessionData<S>): Promise<void> {
    try {
      const storedSessions = localStorage.getItem(STORAGE_KEY);
      let sessions: ChatSession[] = storedSessions ? JSON.parse(storedSessions) : [];
      
      // Find and update existing session or add new session
      const existingIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (existingIndex >= 0) {
        // Update existing session
        sessions[existingIndex] = {
          ...sessionData.session,
          state: sessionData.state as unknown as ChatState,
          updatedAt: new Date()
        };
      } else {
        // Add new session
        sessions.push({
          ...sessionData.session,
          state: sessionData.state as unknown as ChatState,
          id: sessionId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  // Delete a session
  async delete(sessionId: string): Promise<void> {
    try {
      const storedSessions = localStorage.getItem(STORAGE_KEY);
      if (!storedSessions) return;

      const sessions = JSON.parse(storedSessions) as ChatSession[];
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }

  // List all session IDs
  async list(): Promise<string[]> {
    try {
      const storedSessions = localStorage.getItem(STORAGE_KEY);
      if (!storedSessions) return [];

      const sessions = JSON.parse(storedSessions) as ChatSession[];
      return sessions.map(s => s.id);
    } catch (error) {
      console.error('Failed to list sessions:', error);
      return [];
    }
  }

  // Get all sessions
  async getAllSessions(): Promise<ChatSession[]> {
    try {
      const storedSessions = localStorage.getItem(STORAGE_KEY);
      if (!storedSessions) return [];

      const sessions = JSON.parse(storedSessions) as ChatSession[];
      
      // Convert date strings back to Date objects
      return sessions.map(session => ({
        ...session,
        messages: session.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })),
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to get all sessions:', error);
      return [];
    }
  }
}

/**
 * IndexedDBSessionStore - A session store implementation using IndexedDB
 * This can handle larger amounts of data than localStorage
 * For a production environment, this would be replaced with a server-based solution
 */
export class IndexedDBSessionStore<S = ChatState> implements SessionStore<S> {
  private dbName = 'pdf_chat_db';
  private storeName = 'sessions';
  private version = 1;
  
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = (event) => {
        reject(`IndexedDB error: ${(event.target as IDBRequest).error}`);
      };
      
      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }
  
  async get(sessionId: string): Promise<SessionData<S> | undefined> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(sessionId);
        
        request.onerror = () => {
          reject(request.error);
        };
        
        request.onsuccess = () => {
          const data = request.result;
          if (!data) {
            resolve(undefined);
            return;
          }
          
          // Convert date strings back to Date objects
          const sessionWithDates = {
            session: {
              ...data.session,
              messages: data.session.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              })),
              createdAt: new Date(data.session.createdAt),
              updatedAt: new Date(data.session.updatedAt)
            },
            state: data.state as S
          };
          
          resolve(sessionWithDates);
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Failed to retrieve session from IndexedDB:', error);
      return undefined;
    }
  }
  
  async save(sessionId: string, sessionData: SessionData<S>): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const data = {
          id: sessionId,
          session: {
            ...sessionData.session,
            updatedAt: new Date()
          },
          state: sessionData.state
        };
        
        const request = store.put(data);
        
        request.onerror = () => {
          reject(request.error);
        };
        
        request.onsuccess = () => {
          resolve();
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Failed to save session to IndexedDB:', error);
    }
  }
  
  async delete(sessionId: string): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(sessionId);
        
        request.onerror = () => {
          reject(request.error);
        };
        
        request.onsuccess = () => {
          resolve();
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Failed to delete session from IndexedDB:', error);
    }
  }
  
  async list(): Promise<string[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAllKeys();
        
        request.onerror = () => {
          reject(request.error);
        };
        
        request.onsuccess = () => {
          resolve(request.result as string[]);
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error('Failed to list sessions from IndexedDB:', error);
      return [];
    }
  }
}

// Factory function to create the appropriate session store based on environment
export function createSessionStore<S = ChatState>(): SessionStore<S> {
  // Use IndexedDB if available, otherwise fallback to localStorage
  if (typeof indexedDB !== 'undefined') {
    return new IndexedDBSessionStore<S>();
  }
  return new LocalStorageSessionStore<S>();
} 