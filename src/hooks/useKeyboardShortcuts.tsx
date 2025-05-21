import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Notification } from "@/components/ui/notification-toast";

// Define different shortcut scopes
export type ShortcutScope = "global" | "editor" | "viewer" | "chat";

// Define keyboard shortcut command
export interface KeyboardShortcut {
  id: string;
  key: string;
  label: string;
  scope: ShortcutScope;
  action: () => void;
  withCtrl?: boolean;
  withShift?: boolean;
  withAlt?: boolean;
}

// Define default keyboard shortcuts
export const defaultShortcuts: KeyboardShortcut[] = [
  {
    id: "home",
    key: "h",
    label: "Go to Home",
    scope: "global",
    withCtrl: true,
    action: () => {} // Will be filled by the hook
  },
  {
    id: "translate",
    key: "t",
    label: "New Translation",
    scope: "global",
    withCtrl: true,
    action: () => {} // Will be filled by the hook
  },
  {
    id: "chat",
    key: "c",
    label: "PDF Chat",
    scope: "global",
    withCtrl: true,
    action: () => {} // Will be filled by the hook
  },
  {
    id: "history",
    key: "h",
    label: "History",
    scope: "global",
    withAlt: true,
    action: () => {} // Will be filled by the hook
  },
  {
    id: "settings",
    key: ",",
    label: "Settings",
    scope: "global",
    withCtrl: true,
    action: () => {} // Will be filled by the hook
  },
  {
    id: "help",
    key: "?",
    label: "Show Shortcuts",
    scope: "global",
    action: () => {} // Will be filled by the hook
  },
];

// Properties for the useKeyboardShortcuts hook
export interface UseKeyboardShortcutsProps {
  scope?: ShortcutScope;
  enabled?: boolean;
  shortcuts?: KeyboardShortcut[];
}

// Main hook for handling keyboard shortcuts
export function useKeyboardShortcuts({
  scope = "global",
  enabled = true,
  shortcuts = [],
}: UseKeyboardShortcutsProps = {}) {
  const navigate = useNavigate();
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  
  // Combine default shortcuts with any custom shortcuts
  const allShortcuts = [...defaultShortcuts, ...shortcuts].map(shortcut => {
    // Clone the shortcut to avoid mutating the original
    const clone = { ...shortcut };
    
    // Override default actions for navigation-related shortcuts
    switch (shortcut.id) {
      case "home":
        clone.action = () => navigate("/");
        break;
      case "translate":
        clone.action = () => navigate("/translate");
        break;
      case "chat":
        clone.action = () => navigate("/chat");
        break;
      case "history":
        clone.action = () => navigate("/history");
        break;
      case "settings":
        clone.action = () => navigate("/settings");
        break;
      case "help":
        clone.action = () => setShowShortcutsHelp(true);
        break;
    }
    
    return clone;
  });
  
  // Handle key presses
  useEffect(() => {
    // Skip if not enabled
    if (!enabled) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input or textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }
      
      // Find matching shortcut
      const matchingShortcut = allShortcuts.find(shortcut => {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.withCtrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.withShift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.withAlt ? event.altKey : !event.altKey;
        const scopeMatches = shortcut.scope === scope || shortcut.scope === "global";
        
        return keyMatches && ctrlMatches && shiftMatches && altMatches && scopeMatches;
      });
      
      // Execute matching shortcut action
      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
        
        // Show notification for shortcut used
        Notification.info(`Shortcut: ${matchingShortcut.label}`, {
          duration: 2000,
        });
      }
    };
    
    // Attach event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [allShortcuts, enabled, navigate, scope]);
  
  // Return values and utilities from the hook
  return {
    shortcuts: allShortcuts.filter(s => s.scope === scope || s.scope === "global"),
    showShortcutsHelp,
    setShowShortcutsHelp,
    
    // Function to generate a human-readable shortcut key combination
    getShortcutDisplay: (shortcut: KeyboardShortcut) => {
      const parts = [];
      
      if (shortcut.withCtrl) parts.push("Ctrl");
      if (shortcut.withAlt) parts.push("Alt");
      if (shortcut.withShift) parts.push("Shift");
      
      parts.push(shortcut.key.toUpperCase());
      
      return parts.join(" + ");
    }
  };
} 