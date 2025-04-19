import { create } from 'zustand';

export type StatusType = 'error' | 'warning' | 'info' | 'success';

export interface StatusMessage {
  id: string;
  type: StatusType;
  message: string;
  source: string;
  timestamp: number;
  isRead: boolean;
  metadata?: Record<string, unknown>;
}

interface StatusState {
  messages: StatusMessage[];
  maxMessages: number;
  addMessage: (message: Omit<StatusMessage, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  clearMessages: () => void;
  removeMessage: (id: string) => void;
}

export const useStatusStore = create<StatusState>(set => ({
  messages: [],
  maxMessages: 50,
  addMessage: message =>
    set(state => {
      const newMessage: StatusMessage = {
        ...message,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        isRead: false,
      };

      // Remove oldest message if we're at the limit
      const messages = [...state.messages, newMessage];
      if (messages.length > state.maxMessages) {
        messages.shift();
      }

      return { messages };
    }),
  markAsRead: id =>
    set(state => ({
      messages: state.messages.map(msg => (msg.id === id ? { ...msg, isRead: true } : msg)),
    })),
  clearMessages: () => set({ messages: [] }),
  removeMessage: id =>
    set(state => ({
      messages: state.messages.filter(msg => msg.id !== id),
    })),
}));
