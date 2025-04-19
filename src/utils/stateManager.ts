import { logger } from './logger';
import { performanceMonitor } from './performance';
import { errorHandler } from './errorHandler';

type StateChangeCallback<T> = (newState: T, oldState: T) => void;

interface StateOptions {
  persist?: boolean;
  storageKey?: string;
  debounceTime?: number;
}

class StateManager {
  private static instance: StateManager;
  private states: Map<string, any> = new Map();
  private callbacks: Map<string, Set<StateChangeCallback<any>>> = new Map();
  private options: Map<string, StateOptions> = new Map();
  private readonly DEFAULT_DEBOUNCE_TIME = 1000; // 1 second

  private constructor() {}

  static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  createState<T>(
    key: string,
    initialState: T,
    options: StateOptions = {}
  ): [T, (newState: T) => void] {
    const {
      persist = false,
      storageKey = `state_${key}`,
      debounceTime = this.DEFAULT_DEBOUNCE_TIME,
    } = options;

    // Store options
    this.options.set(key, { persist, storageKey, debounceTime });

    // Initialize state from storage if persisting
    if (persist) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          initialState = JSON.parse(stored);
          logger.debug('state', `Loaded persisted state for ${key}`, { initialState });
        }
      } catch (error) {
        errorHandler.handleError(error, {
          component: 'StateManager',
          action: 'load_state',
          metadata: { key },
        });
      }
    }

    // Set initial state
    this.states.set(key, initialState);
    this.callbacks.set(key, new Set());

    // Create debounced setter
    const setState = this.createDebouncedSetter(key, debounceTime);

    return [initialState, setState];
  }

  private createDebouncedSetter<T>(key: string, debounceTime: number): (newState: T) => void {
    let timeoutId: NodeJS.Timeout | null = null;
    let pendingState: T | null = null;

    return (newState: T) => {
      pendingState = newState;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        if (pendingState !== null) {
          this.updateState(key, pendingState);
          pendingState = null;
        }
      }, debounceTime);
    };
  }

  private updateState<T>(key: string, newState: T): void {
    const oldState = this.states.get(key);
    this.states.set(key, newState);

    // Notify callbacks
    const callbacks = this.callbacks.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(newState, oldState);
        } catch (error) {
          errorHandler.handleError(error, {
            component: 'StateManager',
            action: 'state_callback',
            metadata: { key },
          });
        }
      });
    }

    // Persist if needed
    const options = this.options.get(key);
    if (options?.persist) {
      try {
        localStorage.setItem(options.storageKey || `state_${key}`, JSON.stringify(newState));
      } catch (error) {
        errorHandler.handleError(error, {
          component: 'StateManager',
          action: 'persist_state',
          metadata: { key },
        });
      }
    }
  }

  getState<T>(key: string): T | null {
    return this.states.get(key) || null;
  }

  subscribe<T>(key: string, callback: StateChangeCallback<T>): () => void {
    const callbacks = this.callbacks.get(key);
    if (!callbacks) {
      throw new Error(`No state found for key: ${key}`);
    }

    callbacks.add(callback);

    return () => {
      callbacks.delete(callback);
    };
  }

  private getStateOptions(key: string): StateOptions | undefined {
    return this.options.get(key);
  }

  clearState(key: string): void {
    this.states.delete(key);
    this.callbacks.delete(key);
    this.options.delete(key);
    logger.info('state', `Cleared state for key: ${key}`);
  }

  clearAllStates(): void {
    this.states.clear();
    this.callbacks.clear();
    this.options.clear();
    logger.info('state', 'Cleared all states');
  }

  // Method to destroy the manager instance (useful for testing)
  destroy(): void {
    this.clearAllStates();
    // @ts-ignore
    StateManager.instance = null;
  }
}

export const stateManager = StateManager.getInstance();
