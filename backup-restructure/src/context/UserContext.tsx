import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  updateUserProfile: (updates: Partial<Profile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Debug levels
const DEBUG = {
  NONE: 0,
  ERROR: 1,
  INFO: 2,
  VERBOSE: 3,
};

// Set your desired debug level
const CURRENT_DEBUG_LEVEL = DEBUG.ERROR;

// Logging utility
const log = {
  error: (message: string, data?: any) => {
    if (CURRENT_DEBUG_LEVEL >= DEBUG.ERROR) {
      console.error(`[UserContext] ${message}`, data || '');
    }
  },
  info: (message: string, data?: any) => {
    if (CURRENT_DEBUG_LEVEL >= DEBUG.INFO) {
      console.log(`[UserContext] ${message}`, data || '');
    }
  },
  verbose: (message: string, data?: any) => {
    if (CURRENT_DEBUG_LEVEL >= DEBUG.VERBOSE) {
      console.log(`[UserContext] ${message}`, data || '');
    }
  },
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSessionState] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Custom session setter that also updates the user
  const setSession = (newSession: Session | null) => {
    log.info(newSession ? 'Session set' : 'Session cleared');
    setSessionState(newSession);
    setUser(newSession?.user ?? null);

    // When session is set to null, also clear profile
    if (newSession === null) {
      setProfile(null);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      log.info(session ? 'Initial session loaded' : 'No initial session');
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      log.info(`Auth state changed: ${_event}`);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile when session or user changes
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        log.info(`Fetching profile for user: ${user.id}`);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          log.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          log.info('Profile loaded successfully');
          setProfile(data);
        } else {
          log.info('No profile found, creating one');
          // Try to create a profile if none exists
          try {
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email || '',
                username: user.user_metadata?.username || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (insertError) {
              log.error('Error creating profile:', insertError);
            } else if (newProfile) {
              log.info('Created new profile');
              setProfile(newProfile);
            }
          } catch (err) {
            log.error('Error in profile creation:', err);
          }
        }
      };

      fetchProfile();
    } else {
      log.verbose('No user, clearing profile');
      setProfile(null);
    }
  }, [user, session?.access_token]); // Add session token as dependency to re-fetch when token changes

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) return;

    log.info('Updating profile');
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        id: user.id,
        email: user.email || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      log.error('Error updating profile:', error);
      return;
    }

    if (data) {
      log.info('Profile updated successfully');
      setProfile(data);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        setSession,
        updateUserProfile: updateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Add alias for backward compatibility
export const useUserContext = useUser;
