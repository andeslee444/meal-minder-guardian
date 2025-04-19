import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  PackageIcon,
  CookingPotIcon,
  LineChartIcon,
  UserIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  LogInIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { name: 'Home', path: '/', icon: HomeIcon },
  { name: 'Inventory', path: '/inventory', icon: PackageIcon },
  { name: 'Recipes', path: '/recipes', icon: CookingPotIcon },
  { name: 'Expenses', path: '/expenses', icon: LineChartIcon },
];

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, session, setSession } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const prevStatusRef = React.useRef('');

  // Create a safe userProfile object with fallbacks for undefined values
  const userProfile = profile || {
    id: user?.id || '',
    email: user?.email || '',
    username: user?.user_metadata?.username || null,
    avatar_url: null,
    created_at: '',
    updated_at: '',
  };

  // Debug the user state only in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Only log when the profile status changes
      const profileStatus = {
        loggedIn: !!user,
        hasProfile: !!profile,
      };

      // Use a stable JSON representation to avoid excessive logging
      const statusKey = JSON.stringify(profileStatus);

      // Use the ref declared at the component level
      if (prevStatusRef.current !== statusKey) {
        console.log('[Header] User state changed:', profileStatus);
        prevStatusRef.current = statusKey;
      }
    }
  }, [user, profile, session]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      // Clear session from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Also manually clear the session in the UserContext
      setSession(null);

      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });

      navigate('/');
    } catch (error: any) {
      // Only log detailed error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('[Header] Logout error:', error);
      }

      toast({
        variant: 'destructive',
        title: 'Error logging out',
        description: error.message || 'An error occurred during logout.',
      });
    }
  };

  const getInitials = (username: string | null, email?: string | null) => {
    if (username) {
      return username
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    }
    return email?.charAt(0)?.toUpperCase() || 'U';
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white/80 backdrop-blur-lg border-b header-shadow' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center space-x-2" aria-label="KitchenBuddy Home">
          <CookingPotIcon className="w-6 h-6 text-kitchen-500" />
          <span className="text-xl font-display font-semibold tracking-tight">KitchenBuddy</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map(item => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                'relative px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === item.path
                  ? 'text-kitchen-700'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <div className="flex items-center space-x-1.5">
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </div>
              {location.pathname === item.path && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-kitchen-500 rounded-full"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={userProfile?.avatar_url || ''}
                      alt={userProfile?.username || 'User'}
                    />
                    <AvatarFallback>
                      {getInitials(userProfile?.username, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userProfile?.username || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/auth">
                <LogInIcon className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </Button>
      </div>

      <motion.div
        className={cn(
          'md:hidden absolute top-16 left-0 right-0 bg-white/95 dark:bg-card/95 backdrop-blur-lg border-b overflow-hidden',
          mobileMenuOpen ? 'block' : 'hidden'
        )}
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: mobileMenuOpen ? 'auto' : 0,
          opacity: mobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <nav className="container mx-auto px-4 py-3 flex flex-col space-y-1">
          {navItems.map(item => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                location.pathname === item.path
                  ? 'bg-muted text-kitchen-700'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}

          {user ? (
            <>
              <Link
                to="/profile"
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === '/profile'
                    ? 'bg-muted text-kitchen-700'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserIcon className="w-5 h-5" />
                <span>Profile</span>
              </Link>

              <button
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium w-full text-left text-destructive hover:bg-destructive/10"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOutIcon className="w-5 h-5" />
                <span>Log out</span>
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              <LogInIcon className="w-5 h-5" />
              <span>Sign In</span>
            </Link>
          )}
        </nav>
      </motion.div>
    </header>
  );
};

export default Header;
