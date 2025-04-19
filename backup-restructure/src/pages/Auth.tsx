import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserContext } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CookingPotIcon,
  LogInIcon,
  UserPlusIcon,
  AlertCircleIcon,
  MailIcon,
  LockIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AnimatedTransition from '@/components/ui/AnimatedTransition';
import { createClient } from '@supabase/supabase-js';
import { directAuth, testApiKeyValidity, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/auth-helper';

// API key from environment for direct API call
const apiKey = import.meta.env.VITE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const apiUrl = import.meta.env.VITE_SUPABASE_URL;

// Direct authentication function bypassing the client
async function directAuthRequest(email: string, password: string) {
  console.log('Attempting direct API auth with key length:', apiKey ? apiKey.length : 0);
  console.log('API URL:', apiUrl);

  try {
    const response = await fetch(`${apiUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('Direct auth response:', { status: response.status, data });

    if (!response.ok) {
      throw new Error(data.error || 'Authentication failed');
    }

    return data;
  } catch (error) {
    console.error('Direct auth error:', error);
    throw error;
  }
}

// Simple function to just test if the API key is valid
async function testApiKey() {
  console.log('Testing API key validity...');

  try {
    // Using a simpler endpoint that only requires API key validation
    const response = await fetch(`${apiUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
    });

    console.log('API key test result:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
    });

    return response.ok;
  } catch (error) {
    console.error('API key test error:', error);
    return false;
  }
}

// Add a function to test both keys
async function testBothKeys() {
  console.log('Testing both API keys...');

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const serviceKey = import.meta.env.VITE_SERVICE_ROLE_KEY;

  // Test anon key
  try {
    const anonResponse = await fetch(`${apiUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    console.log('Anon key test result:', {
      status: anonResponse.status,
      ok: anonResponse.ok,
      statusText: anonResponse.statusText,
    });
  } catch (error) {
    console.error('Anon key test error:', error);
  }

  // Test service role key
  if (serviceKey) {
    try {
      const serviceResponse = await fetch(`${apiUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      });

      console.log('Service role key test result:', {
        status: serviceResponse.status,
        ok: serviceResponse.ok,
        statusText: serviceResponse.statusText,
      });
    } catch (error) {
      console.error('Service role key test error:', error);
    }
  } else {
    console.log('No service role key available for testing');
  }
}

// Enhance the attemptDirectAuth function to try both keys
async function attemptDirectAuth(email: string, password: string) {
  console.log('Attempting direct authentication with Supabase API...');
  const authUrl = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`;
  console.log('Using Auth URL:', authUrl);

  // Try with service role key if available
  const serviceKey = import.meta.env.VITE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    console.log('Trying with service role key first...');
    try {
      const headers = {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      };

      const body = JSON.stringify({ email, password });

      const response = await fetch(authUrl, {
        method: 'POST',
        headers,
        body,
      });

      const data = await response.json();

      console.log('Service role auth response status:', response.status, response.statusText);

      if (response.ok) {
        console.log('Service role auth successful!');
        return { success: true, data };
      }

      console.error('Service role auth failed:', data);
    } catch (error) {
      console.error('Service role auth error:', error);
    }
  }

  // Fall back to anon key
  console.log('Falling back to anon key...');
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  try {
    const headers = {
      'Content-Type': 'application/json',
      apikey: anonKey,
    };
    console.log('Request headers:', headers);

    const body = JSON.stringify({ email, password });
    console.log('Request payload:', { email, password: '********' });

    const response = await fetch(authUrl, {
      method: 'POST',
      headers,
      body,
    });

    const data = await response.json();

    console.log('Direct auth response status:', response.status, response.statusText);
    console.log(
      'Direct auth response headers:',
      Object.fromEntries([...response.headers.entries()])
    );

    if (!response.ok) {
      console.error('Auth error details:', data);
      return { success: false, error: data.error || 'Authentication failed', data: null };
    }

    console.log('Auth successful with data keys:', Object.keys(data));

    return { success: true, data };
  } catch (error) {
    console.error('Direct auth error:', error);
    return { success: false, error, data: null };
  }
}

// Add direct client test function
async function testDirectClient() {
  console.log('Testing with fresh Supabase client...');

  try {
    // Create a fresh client with the exact URL and key from env vars
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log('Creating fresh client with:', {
      url,
      keyLength: key ? key.length : 0,
      keyStart: key ? key.substring(0, 10) : 'missing',
    });

    const freshClient = createClient(url, key);

    // Try a simple query that doesn't require auth
    const { data, error } = await freshClient.from('profiles').select('count').limit(1);

    console.log('Fresh client test result:', {
      success: !error,
      data,
      error,
    });

    return !error;
  } catch (err) {
    console.error('Fresh client test error:', err);
    return false;
  }
}

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [useDirectAuth, setUseDirectAuth] = useState(true);
  const { session, setSession } = useUserContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (session) {
      console.log('User already logged in, redirecting to home', {
        userId: session?.user?.id,
        hasUser: !!session?.user,
      });
      navigate('/');
    }
  }, [session, navigate]);

  useEffect(() => {
    // Test our hardcoded API key
    testApiKeyValidity().then(isValid => {
      console.log('Hardcoded API key is valid:', isValid);
    });
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error('No user data returned from signup');
      }

      // Then, create the profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: signUpData.user.id,
        email: signUpData.user.email,
        username: username || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.signOut();
        throw profileError;
      }

      toast({
        title: 'Account created!',
        description: 'Please check your email for the confirmation link.',
      });

      // Switch to login tab after successful signup
      setActiveTab('login');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        variant: 'destructive',
        title: 'Error signing up',
        description: error.message || 'An error occurred during signup.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      console.log('Attempting login with email:', email);
      console.log('Trying direct fetch API first');

      // Use direct fetch without the Supabase client
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      console.log('Direct fetch response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
        data: response.ok ? { user: data.user ? 'User data exists' : 'No user data' } : data,
      });

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Authentication failed');
      }

      console.log('Authentication successful!');

      // Create a properly structured session object that matches the Supabase Auth Session format
      const session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in || 3600,
        expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
        token_type: data.token_type || 'bearer',
        user: data.user || null,
        provider_token: data.provider_token || null,
        provider_refresh_token: data.provider_refresh_token || null,
      };

      console.log('Created session object with user:', session.user ? 'User exists' : 'No user');

      // Set the session in the UserContext
      setSession(session);

      // Also activate the Supabase built-in session handling
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });

      toast({
        title: 'Welcome back!',
        description: "You've successfully signed in.",
      });

      navigate('/');
    } catch (error: any) {
      console.error('Login error details:', error);
      setError(error.message || 'An error occurred during login');
      toast({
        variant: 'destructive',
        title: 'Error signing in',
        description: error.message || 'An error occurred during login.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <AnimatedTransition className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-16rem)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full"
          >
            <div className="mb-2 text-xs text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUseDirectAuth(!useDirectAuth)}
                className="text-muted-foreground hover:text-foreground"
              >
                {useDirectAuth ? 'Using Direct API' : 'Using Supabase Client'}
              </Button>
            </div>

            <div className="text-center mb-6">
              <div className="flex justify-center mb-2">
                <CookingPotIcon className="h-12 w-12 text-kitchen-500" />
              </div>
              <h1 className="text-2xl font-display font-semibold">Welcome to KitchenBuddy</h1>
              <p className="text-muted-foreground mt-1">
                Your personal kitchen management assistant
              </p>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">
                      <LogInIcon className="w-4 h-4 mr-2" /> Login
                    </TabsTrigger>
                    <TabsTrigger value="signup">
                      <UserPlusIcon className="w-4 h-4 mr-2" /> Sign Up
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsContent value="login" className="mt-0">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-login">Email</Label>
                        <div className="relative">
                          <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email-login"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password-login">Password</Label>
                        <div className="relative">
                          <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password-login"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="mt-0">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-signup">Email</Label>
                        <div className="relative">
                          <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email-signup"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="username-signup">Username</Label>
                        <div className="relative">
                          <UserPlusIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="username-signup"
                            type="text"
                            placeholder="johndoe"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password-signup">Password</Label>
                        <div className="relative">
                          <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password-signup"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Password must be at least 6 characters long
                          </p>
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-0">
                <div className="w-full border-t pt-4 text-center text-sm text-muted-foreground">
                  {activeTab === 'login' ? (
                    <p>
                      Don't have an account?{' '}
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => setActiveTab('signup')}
                      >
                        Sign up
                      </Button>
                    </p>
                  ) : (
                    <p>
                      Already have an account?{' '}
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => setActiveTab('login')}
                      >
                        Sign in
                      </Button>
                    </p>
                  )}
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </AnimatedTransition>

      <Footer />
    </div>
  );
};

export default Auth;
