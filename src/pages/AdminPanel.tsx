import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getClient, impersonateUser, withPerformanceTracking, ADMIN_OPERATIONS_ENABLED } from '@/lib/admin-utils';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useUserContext } from '@/context/UserContext';
import { AlertCircle, AlertTriangle, Eye } from 'lucide-react';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';

interface User {
  id: string;
  email: string;
  created_at: string;
  username?: string | null;
  avatar_url?: string | null;
  updated_at?: string;
}

const AdminPanel = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [impersonationLink, setImpersonationLink] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { session } = useUserContext();

  const isAdmin = session?.user?.app_metadata?.role === 'admin' || import.meta.env.DEV;

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const client = getClient(true);
      const { data, error } = await withPerformanceTracking('Fetch users', async () => 
        client.from('profiles').select('*').order('created_at', { ascending: false })
      );

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: 'destructive',
        title: 'Error fetching users',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async (id: string) => {
    if (!isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to perform this action.',
      });
      return;
    }

    setLoading(true);
    setError(null);
    setImpersonationLink(null);

    try {
      const result = await impersonateUser(id);
      
      if (!result.success) {
        setError(result.message);
        return;
      }
      
      if (result.loginUrl) {
        setImpersonationLink(result.loginUrl);
        toast({
          title: 'Link Generated',
          description: `The link will expire at ${result.expiresAt?.toLocaleString()}`,
        });
      }
    } catch (error) {
      console.error('Error generating impersonation link:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleManualImpersonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;
    
    await handleImpersonate(userId);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to access the admin panel.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        
        {!ADMIN_OPERATIONS_ENABLED && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Admin Operations Disabled</AlertTitle>
            <AlertDescription>
              Admin operations are currently disabled. Set VITE_ENABLE_ADMIN_OPERATIONS=true in your environment to enable them.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="impersonate">Impersonate User</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading users...</p>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Username
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map(user => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {user.username || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleImpersonate(user.id)}
                                disabled={loading || !ADMIN_OPERATIONS_ENABLED}
                              >
                                <Eye className="h-4 w-4 mr-2" /> Impersonate
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={fetchUsers} disabled={loading}>
                  Refresh Users
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="impersonate">
            <Card>
              <CardHeader>
                <CardTitle>Impersonate User</CardTitle>
                <CardDescription>
                  Generate a one-time login link to impersonate a user.
                  Only use this functionality for legitimate support purposes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualImpersonate} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      value={userId}
                      onChange={e => setUserId(e.target.value)}
                      placeholder="Enter user ID"
                      disabled={loading || !ADMIN_OPERATIONS_ENABLED}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading || !userId || !ADMIN_OPERATIONS_ENABLED}
                  >
                    Generate Impersonation Link
                  </Button>
                </form>
                
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {impersonationLink && (
                  <div className="mt-4 p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                    <h3 className="font-semibold mb-2">Login Link Generated</h3>
                    <p className="text-sm mb-2">
                      This link will work only once and will expire in 1 hour:
                    </p>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border overflow-x-auto">
                      <code className="text-sm break-all">{impersonationLink}</code>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          navigator.clipboard.writeText(impersonationLink);
                          toast({
                            title: 'Copied!',
                            description: 'Link copied to clipboard',
                          });
                        }}
                      >
                        Copy Link
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(impersonationLink, '_blank')}
                      >
                        Open Link
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel; 