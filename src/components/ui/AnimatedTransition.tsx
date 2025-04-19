import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

type AnimatedTransitionProps = {
  children: React.ReactNode;
  className?: string;
};

export const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({ children, className }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('fadeOut');

      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
      }, 300); // Match this to your animation duration

      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation]);

  return (
    <div
      className={cn(
        'min-h-[calc(100vh-4rem)] w-full transition-all duration-300 ease-in-out',
        transitionStage === 'fadeIn' ? 'animate-scale-in' : 'animate-scale-out',
        className
      )}
    >
      {children}
    </div>
  );
};

export default AnimatedTransition;
