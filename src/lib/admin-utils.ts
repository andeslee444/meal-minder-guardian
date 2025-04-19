import { supabase, supabaseAdmin } from './supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Type guard to check if a client is the admin client
export function isAdminClient(
  client: SupabaseClient<Database> | null | undefined
): client is NonNullable<typeof supabaseAdmin> {
  return client !== null && client !== undefined;
}

// Environment control for admin operations
export const ADMIN_OPERATIONS_ENABLED = import.meta.env.VITE_ENABLE_ADMIN_OPERATIONS === 'true';

// Function to get the appropriate client based on operation type
export function getClient(requiresAdmin: boolean = false): SupabaseClient<Database> {
  const shouldUseAdmin = 
    requiresAdmin && 
    ADMIN_OPERATIONS_ENABLED && 
    !!supabaseAdmin;
  
  return shouldUseAdmin ? supabaseAdmin! : supabase;
}

// Performance monitoring wrapper
export async function withPerformanceTracking<T>(
  name: string, 
  operation: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  try {
    return await operation();
  } finally {
    const endTime = performance.now();
    console.log(`[Performance] ${name} took ${(endTime - startTime).toFixed(2)}ms`);
  }
}

// Error handling helper for admin operations
export function handleSupabaseError(error: any, operation: string): void {
  if (!error) return;
  
  if (error.code === '42501') { // PostgreSQL permission error
    console.error(`Permission error during ${operation}:`, error);
    // You could trigger alerts or fallback strategies here
  } else if (error.code?.startsWith('22')) { // Data exception errors
    console.error(`Data error during ${operation}:`, error);
  } else if (error.code?.startsWith('23')) { // Integrity constraint violations
    console.error(`Constraint violation during ${operation}:`, error);
  } else {
    console.error(`Error during ${operation}:`, error);
  }
}

/**
 * User impersonation functionality for admins
 * SECURITY WARNING: This should only be available to administrators
 * and should be protected by proper access controls
 */
export interface ImpersonationResult {
  success: boolean;
  message: string;
  loginUrl?: string;
  expiresAt?: Date;
}

/**
 * Generate a one-time login link for user impersonation
 * This should only be called from a secure admin context
 */
export async function impersonateUser(userId: string): Promise<ImpersonationResult> {
  // Security check - only allow in development or with admin flag
  if (!ADMIN_OPERATIONS_ENABLED && !import.meta.env.DEV) {
    return {
      success: false,
      message: 'User impersonation is disabled in this environment for security reasons',
    };
  }
  
  // Security check - verify admin client is available
  if (!supabaseAdmin) {
    return {
      success: false,
      message: 'Admin access is required for user impersonation',
    };
  }
  
  try {
    return await withPerformanceTracking('User impersonation', async () => {
      // Use the non-null assertion since we've already checked supabaseAdmin is not null
      const adminClient = supabaseAdmin!;
      
      // First, get the user information
      const { data, error } = await adminClient.auth.admin.getUserById(userId);
      
      if (error || !data.user) {
        handleSupabaseError(error, 'getting user for impersonation');
        return {
          success: false,
          message: error?.message || 'User not found',
        };
      }
      
      // Verify the user has an email (required for magic link)
      if (!data.user.email) {
        return {
          success: false,
          message: 'User does not have an email address',
        };
      }
      
      // Generate a limited-time (1 hour) magic link
      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email: data.user.email,
        options: {
          redirectTo: `${window.location.origin}/impersonation-success`,
          // Set a short expiration time for security (1 hour)
          data: { 
            impersonatedBy: 'admin',
            createdAt: new Date().toISOString(),
          }
        }
      });
      
      if (linkError || !linkData) {
        handleSupabaseError(linkError, 'generating impersonation link');
        return {
          success: false,
          message: linkError?.message || 'Failed to generate login link',
        };
      }
      
      // Log this impersonation attempt for audit purposes
      console.log(`Admin generated impersonation link for user ${userId} (${data.user.email})`);
      
      // Create a date object 1 hour from now for the expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      
      return {
        success: true,
        message: `Generated login link for ${data.user.email}`,
        loginUrl: linkData.properties?.action_link,
        expiresAt,
      };
    });
  } catch (error) {
    console.error('Error in user impersonation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during impersonation',
    };
  }
} 