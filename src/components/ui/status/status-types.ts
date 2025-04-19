export type StatusType = 'error' | 'warning' | 'info' | 'success';

export interface StatusMessage {
  id: string;
  type: StatusType;
  message: string;
  source: string;
  details?: string;
  timestamp: Date;
  read: boolean;
}

export type StatusListener = (messages: StatusMessage[]) => void;
