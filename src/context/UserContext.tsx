import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database } from '@/integrations/supabase/types';
import { captureError } from '@/lib/error-tracking';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  hasConnectionError: boolean;
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

// Maximum time to wait for initial session loading (in ms)
const SESSION_LOAD_TIMEOUT = 3000;

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSessionState] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasConnectionError, setHasConnectionError] = useState(false);

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
    // Set a timeout to ensure we don't block rendering indefinitely
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        log.error('Session loading timed out');
        setIsLoading(false);
        setHasConnectionError(true);
      }
    }, SESSION_LOAD_TIMEOUT);

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        log.info(session ? 'Initial session loaded' : 'No initial session');
        setSession(session);
        clearTimeout(timeoutId);
      })
      .catch(error => {
        log.error('Error getting initial session:', error);
        setIsLoading(false);
        setHasConnectionError(true);
        clearTimeout(timeoutId);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      log.info(`Auth state changed: ${_event}`);
      setSession(session);
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // Fetch profile when session or user changes
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        log.info(`Fetching profile for user: ${user.id}`);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*') // Fetches all columns, including new ones
            .eq('id', user.id)
            .single();

          if (error) {
            // Only log as error if it's not a "No rows found" error
            if (error.code !== 'PGRST116') {
              log.error('Error fetching profile:', error);
              setProfile(null); // Clear profile on error
              return;
            }
            log.info('No profile found, will create one with defaults');
          }

          if (data) {
            log.info('Profile loaded successfully');
            setProfile(data);
          } else {
            // Try to create a profile if none exists, including default values
            try {
              const defaultUsername =
                user.email?.split('@')[0] || `user_${user.id.substring(0, 6)}`;
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: user.id,
                  email: user.email || '',
                  // Use metadata if available, otherwise generate a default
                  username: user.user_metadata?.username || defaultUsername,
                  name: user.user_metadata?.full_name || null,
                  household: 1, // Default household size
                  // Add empty preferences for backward compatibility
                  // These may not be in the current schema but are handled safely
                  // preferences: {},
                  // dietary_restrictions: [],
                  // allergies: [],
                  avatar_url: user.user_metadata?.avatar_url || null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .select()
                .single();

              if (insertError) {
                log.error('Error creating profile:', insertError);

                // Special handling for constraint violations which might happen if the profile was created
                // in between our check and insert (race condition)
                if (insertError.code === '23505') {
                  // Unique constraint violation
                  log.info('Constraint violation, retrying profile fetch');
                  fetchProfile(); // Retry fetch
                  return;
                }

                setProfile(null);
              } else if (newProfile) {
                log.info('Created new profile');
                setProfile(newProfile);
              }
            } catch (err) {
              log.error('Error in profile creation attempt:', err);
              captureError(err);
              setProfile(null);
            }
          }
        } catch (err) {
          log.error('Unexpected error in profile management:', err);
          captureError(err);
          setProfile(null);
        }
      };

      fetchProfile().catch(err => {
        log.error('Error in profile fetching:', err);
        captureError(err);
      });
    } else {
      log.verbose('No user, clearing profile');
      setProfile(null);
    }
  }, [user, session?.access_token]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) {
      log.error('Update profile called without user ID');
      throw new Error('User not available for profile update.');
    }

    log.info('Updating profile with:', updates);

    // Prepare updates, ensure id and email are not included
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    delete updateData.id; // Cannot update id
    delete updateData.email; // Should not update email here
    delete updateData.created_at; // Should not update created_at

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData) // Use the filtered updateData
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        log.error('Error updating profile:', error);
        captureError(error);
        throw error; // Re-throw error to be caught by the caller
      }

      if (data) {
        log.info('Profile updated successfully in DB, updating context state');
        setProfile(data);
      } else {
        log.error('Profile update returned no data');
        // Refetch profile to ensure consistency
        const { data: refetchedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (refetchedProfile) {
          setProfile(refetchedProfile);
        }
      }
    } catch (err) {
      log.error('Exception during profile update:', err);
      captureError(err);
      throw err;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        hasConnectionError,
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
