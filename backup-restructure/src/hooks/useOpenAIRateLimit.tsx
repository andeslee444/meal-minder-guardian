import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useOpenAIRateLimit = (dailyLimit: number = 50) => {
  const { toast } = useToast();
  const [dailyRequestCount, setDailyRequestCount] = useState<number>(0);
  const todayStr = new Date().toDateString();

  // Load saved usage data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('openaiApiUsage');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData.date === todayStr) {
        setDailyRequestCount(parsedData.count);
      } else {
        resetDailyCount();
      }
    }
  }, [todayStr]);

  // Save usage data whenever it changes
  useEffect(() => {
    localStorage.setItem(
      'openaiApiUsage',
      JSON.stringify({
        date: todayStr,
        count: dailyRequestCount,
      })
    );
  }, [dailyRequestCount, todayStr]);

  // Reset daily count (usually for a new day)
  const resetDailyCount = () => {
    setDailyRequestCount(0);
    localStorage.setItem(
      'openaiApiUsage',
      JSON.stringify({
        date: todayStr,
        count: 0,
      })
    );
  };

  // Check if we've hit rate limits
  const checkRateLimits = async (): Promise<void> => {
    if (dailyRequestCount >= dailyLimit) {
      const errorMsg = `Daily OpenAI API limit of ${dailyLimit} requests reached. Please try again tomorrow.`;
      toast({
        title: 'API Limit Reached',
        description: errorMsg,
        variant: 'destructive',
      });
      throw new Error(errorMsg);
    }
    return Promise.resolve();
  };

  // Track a new request
  const trackRequest = () => {
    setDailyRequestCount(prev => prev + 1);
  };

  // Check if the API limit has been reached
  const isApiLimitReached = () => {
    return dailyRequestCount >= dailyLimit;
  };

  return {
    dailyRequestCount,
    resetDailyCount,
    checkRateLimits,
    trackRequest,
    isApiLimitReached,
  };
};
