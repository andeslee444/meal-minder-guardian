import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import AnimatedTransition from '@/components/ui/AnimatedTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserIcon, HeartIcon, BellIcon, LockIcon, Plus, PencilIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Database } from '@/integrations/supabase/types';
type UserProfileType = Database['public']['Tables']['profiles']['Row'];

const Profile = () => {
  const { profile: userProfile, updateUserProfile, user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // Form state - only include valid fields from UserProfileType
  const [profileForm, setProfileForm] = useState<Partial<UserProfileType>>({
    username: '',
    avatar_url: '',
  });

  // File upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Update local form state when userProfile from context changes
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        username: userProfile.username ?? '',
        avatar_url: userProfile.avatar_url ?? '',
      });
    }
  }, [userProfile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let uploadedAvatarUrl = profileForm.avatar_url;
    if (selectedImage) {
      uploadedAvatarUrl = (await handleAvatarUpload()) ?? profileForm.avatar_url;
    }

    const updates: Partial<UserProfileType> = {
      username: profileForm.username,
      avatar_url: uploadedAvatarUrl,
    };

    if (!user?.id) {
      toast({ title: 'Error', description: 'User not found', variant: 'destructive' });
      return;
    }

    try {
      await updateUserProfile(updates);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: 'Update Failed',
        description: error?.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    }
  };

  const handleAvatarUpload = async (): Promise<string | null> => {
    if (!selectedImage || !user) return null;

    try {
      setIsUploading(true);

      const fileExt = selectedImage.name.split('.').pop();
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedImage, { upsert: true }); // Use upsert to overwrite

      if (error) throw error;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update the profile form state immediately for preview
      setProfileForm(prev => ({ ...prev, avatar_url: publicUrl }));

      // No toast here, let handleProfileSubmit show success message
      return publicUrl; // Return the URL
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'An error occurred while uploading your avatar.',
      });
      return null;
    } finally {
      setIsUploading(false);
      // Keep selected image until profile saved
      // setSelectedImage(null);
    }
  };

  // Get initials for avatar fallback - use username or email
  const getInitials = (username?: string | null) => {
    return username
      ? username.charAt(0).toUpperCase()
      : user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <AnimatedTransition className="flex-1 pt-16">
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-3xl font-display font-semibold mb-4">Account Settings</h1>
              <p className="text-muted-foreground mb-8">
                Personalize your KitchenBuddy experience and preferences.
              </p>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">
                    <UserIcon className="w-4 h-4 mr-2" /> Profile
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <BellIcon className="w-4 h-4 mr-2" /> Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal information to personalize your experience.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-20 w-20">
                            <AvatarImage
                              src={profileForm.avatar_url || undefined}
                              alt={profileForm.username || 'User Avatar'}
                            />
                            <AvatarFallback>{getInitials(profileForm.username)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Label htmlFor="avatar">Profile Picture</Label>
                            <Input
                              id="avatar"
                              type="file"
                              accept="image/*"
                              onChange={e => setSelectedImage(e.target.files?.[0] || null)}
                              className="mt-1"
                            />
                            {selectedImage && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                                onClick={() => handleAvatarUpload()}
                                disabled={isUploading}
                              >
                                {isUploading ? 'Uploading...' : 'Upload New Picture'}
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={profileForm.username || ''}
                            onChange={e =>
                              setProfileForm({ ...profileForm, username: e.target.value })
                            }
                            placeholder="Your unique username"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" type="email" value={user?.email || ''} disabled />
                          <p className="text-xs text-muted-foreground">
                            Email cannot be changed here.
                          </p>
                        </div>

                        <CardFooter className="px-0 pt-6">
                          <Button type="submit">Save Changes</Button>
                        </CardFooter>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Application Settings</CardTitle>
                      <CardDescription>
                        Manage your notification preferences and other settings.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="notifications" className="flex flex-col space-y-1">
                          <span>Email Notifications</span>
                          <span className="font-normal leading-snug text-muted-foreground">
                            Receive emails about new recipes and updates.
                          </span>
                        </Label>
                        <Switch id="notifications" onCheckedChange={checked => {}} />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="weekly-summary" className="flex flex-col space-y-1">
                          <span>Weekly Summary Email</span>
                          <span className="font-normal leading-snug text-muted-foreground">
                            Get a summary of your activity and new suggestions each week.
                          </span>
                        </Label>
                        <Switch id="weekly-summary" onCheckedChange={checked => {}} />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                          <span>Dark Mode</span>
                          <span className="font-normal leading-snug text-muted-foreground">
                            Toggle the application theme.
                          </span>
                        </Label>
                        <Switch id="dark-mode" onCheckedChange={checked => {}} />
                      </div>
                      <Separator />
                      <div>
                        <Button variant="destructive">Delete Account</Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          Permanently delete your account and all associated data. This action
                          cannot be undone.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </AnimatedTransition>
      <Footer />
    </div>
  );
};

export default Profile;
