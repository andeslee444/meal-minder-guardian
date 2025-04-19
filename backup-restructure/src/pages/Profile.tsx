import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import AnimatedTransition from '@/components/ui/AnimatedTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  UserIcon,
  HomeIcon,
  HeartIcon,
  AlertCircleIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
  LockIcon,
  Check,
  Plus,
  PencilIcon,
  ImageIcon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const Profile = () => {
  const { userProfile, updateUserProfile, user } = useAppContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // Form state
  const [profileForm, setProfileForm] = useState({
    name: userProfile.name || '',
    username: userProfile.username || '',
    household: userProfile.household || 1,
    avatar_url: userProfile.avatar_url || '',
  });

  // File upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Diet and Allergies state
  const [dietaryPreferences, setDietaryPreferences] = useState(userProfile.diet || []);
  const [allergies, setAllergies] = useState(userProfile.allergies || []);
  const [newDiet, setNewDiet] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  // Settings state
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [expirationAlerts, setExpirationAlerts] = useState(true);

  // Update local form state when userProfile changes
  useEffect(() => {
    setProfileForm({
      name: userProfile.name || '',
      username: userProfile.username || '',
      household: userProfile.household || 1,
      avatar_url: userProfile.avatar_url || '',
    });
    setDietaryPreferences(userProfile.diet || []);
    setAllergies(userProfile.allergies || []);
  }, [userProfile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Handle image upload first if there's a selected image
    if (selectedImage) {
      await handleAvatarUpload();
    }

    updateUserProfile({
      name: profileForm.name,
      username: profileForm.username,
      household: profileForm.household,
      diet: dietaryPreferences,
      allergies: allergies,
      avatar_url: profileForm.avatar_url,
    });

    toast({
      title: 'Profile Updated',
      description: 'Your profile has been updated successfully.',
    });
  };

  const handleAvatarUpload = async () => {
    if (!selectedImage || !user) return;

    try {
      setIsUploading(true);

      // Create a unique filename
      const fileExt = selectedImage.name.split('.').pop();
      const filePath = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedImage);

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update the profile form with the new avatar URL
      setProfileForm({
        ...profileForm,
        avatar_url: urlData.publicUrl,
      });

      toast({
        title: 'Avatar Uploaded',
        description: 'Your profile picture has been updated.',
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);

      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'An error occurred while uploading your avatar.',
      });
    } finally {
      setIsUploading(false);
      setSelectedImage(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedImage(null);
      return;
    }

    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please select an image under 2MB.',
      });
      return;
    }

    setSelectedImage(file);
  };

  const handleAddDietaryPreference = () => {
    if (newDiet && !dietaryPreferences.includes(newDiet)) {
      setDietaryPreferences([...dietaryPreferences, newDiet]);
      setNewDiet('');
    }
  };

  const handleRemoveDietaryPreference = (diet: string) => {
    setDietaryPreferences(dietaryPreferences.filter((d: string) => d !== diet));
  };

  const handleAddAllergy = () => {
    if (newAllergy && !allergies.includes(newAllergy)) {
      setAllergies([...allergies, newAllergy]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    setAllergies(allergies.filter((a: string) => a !== allergy));
  };

  const dietarySuggestions = [
    'Vegetarian',
    'Vegan',
    'Gluten Free',
    'Low Carb',
    'Keto',
    'Pescatarian',
    'Dairy Free',
    'Low Sugar',
    'Low Sodium',
    'Halal',
    'Kosher',
  ];

  const allergySuggestions = [
    'Peanuts',
    'Tree Nuts',
    'Milk',
    'Eggs',
    'Fish',
    'Shellfish',
    'Soy',
    'Wheat',
    'Gluten',
    'Sesame',
    'Mustard',
    'Sulfites',
  ];

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      ? name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
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
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">
                    <UserIcon className="w-4 h-4 mr-2" /> Profile
                  </TabsTrigger>
                  <TabsTrigger value="diet">
                    <HeartIcon className="w-4 h-4 mr-2" /> Diet & Allergies
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
                      <form id="profile-form" onSubmit={handleProfileSubmit}>
                        <div className="grid gap-6">
                          <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="relative">
                              <Avatar className="h-24 w-24">
                                <AvatarImage
                                  src={
                                    selectedImage
                                      ? URL.createObjectURL(selectedImage)
                                      : profileForm.avatar_url || ''
                                  }
                                  alt={profileForm.name || 'User'}
                                />
                                <AvatarFallback className="text-2xl">
                                  {getInitials(profileForm.name || '')}
                                </AvatarFallback>
                              </Avatar>
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                                onClick={() => document.getElementById('avatar-upload')?.click()}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                              />
                            </div>
                            <div className="space-y-1 text-center md:text-left">
                              <h3 className="text-lg font-medium">
                                {profileForm.name || profileForm.username || user?.email || 'User'}
                              </h3>
                              <p className="text-sm text-muted-foreground">{user?.email}</p>
                              {selectedImage && (
                                <p className="text-xs text-muted-foreground">
                                  New image selected: {selectedImage.name}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              placeholder="Your name"
                              value={profileForm.name}
                              onChange={e =>
                                setProfileForm({ ...profileForm, name: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              placeholder="Your username"
                              value={profileForm.username}
                              onChange={e =>
                                setProfileForm({ ...profileForm, username: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="household">Household Size</Label>
                            <Select
                              value={profileForm.household.toString()}
                              onValueChange={value =>
                                setProfileForm({ ...profileForm, household: parseInt(value) })
                              }
                            >
                              <SelectTrigger id="household">
                                <SelectValue placeholder="Select household size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 person</SelectItem>
                                <SelectItem value="2">2 people</SelectItem>
                                <SelectItem value="3">3 people</SelectItem>
                                <SelectItem value="4">4 people</SelectItem>
                                <SelectItem value="5">5 people</SelectItem>
                                <SelectItem value="6">6+ people</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground mt-1">
                              This helps us suggest appropriate recipe portions.
                            </p>
                          </div>
                        </div>
                      </form>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" form="profile-form" disabled={isUploading}>
                        {isUploading ? 'Uploading...' : 'Save Changes'}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="diet" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Dietary Preferences & Allergies</CardTitle>
                      <CardDescription>
                        Customize your diet preferences and allergies for better recipe
                        recommendations.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label>Dietary Preferences</Label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {dietaryPreferences.map((diet: string) => (
                              <Badge
                                key={diet}
                                variant="secondary"
                                className="px-3 py-1 flex items-center gap-1"
                              >
                                {diet}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDietaryPreference(diet)}
                                  className="ml-1 text-muted-foreground hover:text-foreground rounded-full"
                                  aria-label={`Remove ${diet}`}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>
                              </Badge>
                            ))}
                            {dietaryPreferences.length === 0 && (
                              <p className="text-sm text-muted-foreground">
                                No dietary preferences added yet.
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Input
                              placeholder="Add dietary preference"
                              value={newDiet}
                              onChange={e => setNewDiet(e.target.value)}
                              className="flex-grow"
                            />
                            <Button type="button" onClick={handleAddDietaryPreference}>
                              <Plus className="w-4 h-4 mr-2" /> Add
                            </Button>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm text-muted-foreground mb-2">Suggestions:</p>
                            <div className="flex flex-wrap gap-2">
                              {dietarySuggestions
                                .filter(diet => !dietaryPreferences.includes(diet))
                                .slice(0, 8)
                                .map(diet => (
                                  <Badge
                                    key={diet}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-secondary"
                                    onClick={() => {
                                      if (!dietaryPreferences.includes(diet)) {
                                        setDietaryPreferences([...dietaryPreferences, diet]);
                                      }
                                    }}
                                  >
                                    {diet}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <Label>Food Allergies</Label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {allergies.map((allergy: string) => (
                              <Badge
                                key={allergy}
                                variant="destructive"
                                className="px-3 py-1 flex items-center gap-1"
                              >
                                {allergy}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAllergy(allergy)}
                                  className="ml-1 text-destructive-foreground hover:text-foreground rounded-full"
                                  aria-label={`Remove ${allergy}`}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>
                              </Badge>
                            ))}
                            {allergies.length === 0 && (
                              <p className="text-sm text-muted-foreground">
                                No allergies added yet.
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Input
                              placeholder="Add allergy"
                              value={newAllergy}
                              onChange={e => setNewAllergy(e.target.value)}
                              className="flex-grow"
                            />
                            <Button type="button" onClick={handleAddAllergy} variant="destructive">
                              <Plus className="w-4 h-4 mr-2" /> Add
                            </Button>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm text-muted-foreground mb-2">Common allergies:</p>
                            <div className="flex flex-wrap gap-2">
                              {allergySuggestions
                                .filter(allergy => !allergies.includes(allergy))
                                .slice(0, 8)
                                .map(allergy => (
                                  <Badge
                                    key={allergy}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={() => {
                                      if (!allergies.includes(allergy)) {
                                        setAllergies([...allergies, allergy]);
                                      }
                                    }}
                                  >
                                    {allergy}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={handleProfileSubmit}>Save Changes</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Application Settings</CardTitle>
                      <CardDescription>
                        Manage your notification preferences and application settings.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="darkMode">Dark Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Toggle between light and dark theme.
                          </p>
                        </div>
                        <Switch
                          id="darkMode"
                          checked={darkMode}
                          onCheckedChange={setDarkMode}
                          disabled
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notifications">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications for important updates.
                          </p>
                        </div>
                        <Switch
                          id="notifications"
                          checked={notifications}
                          onCheckedChange={setNotifications}
                          disabled
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="expirationAlerts">Expiration Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when items are about to expire.
                          </p>
                        </div>
                        <Switch
                          id="expirationAlerts"
                          checked={expirationAlerts}
                          onCheckedChange={setExpirationAlerts}
                          disabled
                        />
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <Label>Privacy</Label>
                        <div className="rounded-md border p-4 space-y-3">
                          <div className="flex items-start gap-4">
                            <LockIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium mb-1">Data Usage</h4>
                              <p className="text-sm text-muted-foreground">
                                Your data is stored securely in our database. KitchenBuddy does not
                                share your personal information with third parties.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                      <Button variant="outline" disabled>
                        Reset All Settings
                      </Button>
                      <Button
                        onClick={() => {
                          toast({
                            title: 'Settings Saved',
                            description: 'Your settings have been saved successfully.',
                          });
                        }}
                      >
                        Save Settings
                      </Button>
                    </CardFooter>
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
