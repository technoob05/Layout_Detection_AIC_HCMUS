import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '@/components/ui/notification-toast';

interface Command {
  command: string;
  aliases?: string[];
  action: () => void;
  description: string;
}

interface VoiceCommandOptions {
  enabled?: boolean;
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onListening?: (listening: boolean) => void;
}

interface VoiceCommandHook {
  isListening: boolean;
  toggleListening: () => void;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  commands: Command[];
  isSupported: boolean;
}

export function useVoiceCommands({
  enabled = true,
  lang = 'en-US',
  continuous = true,
  interimResults = true,
  onListening,
}: VoiceCommandOptions = {}): VoiceCommandHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  // Define available commands
  const commands: Command[] = [
    {
      command: 'go to home',
      aliases: ['go home', 'open home', 'show home'],
      action: () => navigate('/'),
      description: 'Navigate to homepage',
    },
    {
      command: 'translate',
      aliases: ['translate document', 'start translation', 'new translation'],
      action: () => navigate('/translate'),
      description: 'Open translation page',
    },
    {
      command: 'history',
      aliases: ['show history', 'translation history', 'past translations'],
      action: () => navigate('/history'),
      description: 'Show translation history',
    },
    {
      command: 'chat',
      aliases: ['chat with pdf', 'start chat', 'pdf chat'],
      action: () => navigate('/chat'),
      description: 'Open PDF chat',
    },
    {
      command: 'settings',
      aliases: ['open settings', 'show settings'],
      action: () => navigate('/settings'),
      description: 'Open settings page',
    },
    {
      command: 'change theme',
      aliases: ['switch theme', 'toggle theme'],
      action: () => navigate('/settings'),
      description: 'Change application theme',
    },
    {
      command: 'extract text',
      aliases: ['extract', 'extract from pdf'],
      action: () => navigate('/extract'),
      description: 'Extract text from PDF',
    },
    {
      command: 'analytics',
      aliases: ['show analytics', 'open analytics', 'statistics'],
      action: () => navigate('/analytics'),
      description: 'View translation analytics',
    },
    {
      command: 'stop listening',
      aliases: ['stop voice', 'turn off voice', 'disable voice'],
      action: () => stopListening(),
      description: 'Stop voice recognition',
    },
    {
      command: 'help',
      aliases: ['voice help', 'show commands', 'what can i say'],
      action: () => {
        try {
          Notification.info('Available Voice Commands', {
            description: 'Try saying: "go home", "translate", "history", "chat", "settings", "help"',
            duration: 8000,
          });
        } catch (error) {
          console.error("Error showing notification:", error);
        }
      },
      description: 'Show available commands',
    },
  ];

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition && enabled) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = interimResults;
      recognitionRef.current.lang = lang;
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        stopListening();
      }
    };
  }, [continuous, enabled, interimResults, lang]);

  // Process speech recognition results
  const processResult = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    
    // Find matching command
    for (const cmd of commands) {
      // Check main command
      if (lowerTranscript.includes(cmd.command)) {
        console.log(`Voice command detected: ${cmd.command}`);
        cmd.action();
        try {
          Notification.success(`Voice Command: "${cmd.command}"`, {
            description: cmd.description,
            duration: 2000,
          });
        } catch (error) {
          console.error("Error showing notification:", error);
        }
        return;
      }
      
      // Check aliases
      if (cmd.aliases) {
        for (const alias of cmd.aliases) {
          if (lowerTranscript.includes(alias)) {
            console.log(`Voice command detected: ${alias}`);
            cmd.action();
            try {
              Notification.success(`Voice Command: "${alias}"`, {
                description: cmd.description,
                duration: 2000,
              });
            } catch (error) {
              console.error("Error showing notification:", error);
            }
            return;
          }
        }
      }
    }
  }, [commands]);

  // Configure speech recognition handlers
  useEffect(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;

    recognition.onstart = () => {
      setIsListening(true);
      if (onListening) onListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (onListening) onListening(false);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
      
      if (finalTranscript) {
        processResult(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (onListening) onListening(false);
      
      if (event.error === 'not-allowed') {
        try {
          Notification.error('Microphone Access Denied', {
            description: 'Please allow microphone access to use voice commands',
            duration: 5000,
          });
        } catch (error) {
          console.error("Error showing notification:", error);
        }
      }
    };
  }, [onListening, processResult]);

  // Start listening function
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening && isSupported) {
      try {
        recognitionRef.current.start();
        try {
          Notification.info('Voice Commands Active', {
            description: 'Try saying "help" to see available commands',
            duration: 3000,
          });
        } catch (error) {
          console.error("Error showing notification:", error);
        }
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  }, [isListening, isSupported]);

  // Stop listening function
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        try {
          Notification.info('Voice Commands Disabled', {
            duration: 2000,
          });
        } catch (error) {
          console.error("Error showing notification:", error);
        }
      } catch (error) {
        console.error('Failed to stop speech recognition:', error);
      }
    }
  }, [isListening]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    toggleListening,
    startListening,
    stopListening,
    transcript,
    commands,
    isSupported,
  };
} 