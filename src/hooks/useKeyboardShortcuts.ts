import { useEffect } from "react";

interface KeyboardShortcutConfig {
  key: string;
  ctrlOrCmd?: boolean;
  shift?: boolean;
  handler: () => void;
  disabled?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (shortcut.disabled) continue;

        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrlOrCmd = shortcut.ctrlOrCmd ? event.ctrlKey || event.metaKey : true;
        const matchesShift = shortcut.shift ? event.shiftKey : !event.shiftKey;

        if (matchesKey && matchesCtrlOrCmd && matchesShift) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
