/**
 * TypeScript definitions for Tawk.to JavaScript API
 * Reference: https://developer.tawk.to/jsapi/
 */

export interface TawkAPI {
  onLoad?: () => void;
  onStatusChange?: (status: 'online' | 'away' | 'offline') => void;
  onChatMaximized?: () => void;
  onChatMinimized?: () => void;
  onChatHidden?: () => void;
  onChatStarted?: () => void;
  onChatEnded?: () => void;
  setAttributes?: (
    attributes: Record<string, string | number | boolean>,
    callback?: (error?: Error | null) => void
  ) => void;
  addEvent?: (
    event: string,
    metadata?: Record<string, unknown>,
    callback?: (error?: Error | null) => void
  ) => void;
  addTags?: (tags: string[], callback?: (error?: Error | null) => void) => void;
  removeTags?: (tags: string[], callback?: (error?: Error | null) => void) => void;
  maximize?: () => void;
  minimize?: () => void;
  toggle?: () => void;
  popup?: () => void;
  showWidget?: () => void;
  hideWidget?: () => void;
  toggleVisibility?: () => void;
  isChatMaximized?: () => boolean;
  isChatMinimized?: () => boolean;
  isChatHidden?: () => boolean;
  isChatOngoing?: () => boolean;
  visitor?: {
    name?: string;
    email?: string;
    hash?: string;
  };
}

declare global {
  interface Window {
    Tawk_API?: TawkAPI;
    Tawk_LoadStart?: Date;
  }
}
