// Countdown Timer Hook

import { useCallback, useEffect, useState } from 'react';
import { formatCountdown, getTimeRemaining } from '@/lib/utils';

interface CountdownState {
  hours: string;
  minutes: string;
  seconds: string;
  totalSeconds: number;
  isExpired: boolean;
}

/**
 * Countdown timer hook for deal timers
 */
export function useCountdown(endDate: string | Date): CountdownState {
  const calculateTimeLeft = useCallback((): CountdownState => {
    const totalSeconds = getTimeRemaining(endDate);
    const isExpired = totalSeconds <= 0;

    if (isExpired) {
      return {
        hours: '00',
        minutes: '00',
        seconds: '00',
        totalSeconds: 0,
        isExpired: true,
      };
    }

    const formatted = formatCountdown(totalSeconds);
    return {
      ...formatted,
      totalSeconds,
      isExpired: false,
    };
  }, [endDate]);

  const [timeLeft, setTimeLeft] = useState<CountdownState>(calculateTimeLeft);

  useEffect(() => {
    // Update immediately
    setTimeLeft(calculateTimeLeft());

    // Then update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Stop the timer if expired
      if (newTimeLeft.isExpired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return timeLeft;
}

/**
 * Hook for daily countdown (resets at midnight)
 */
export function useDailyCountdown(): CountdownState {
  const getMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.toISOString();
  };

  const [endDate, setEndDate] = useState(getMidnight);

  // Reset at midnight
  useEffect(() => {
    const checkMidnight = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setEndDate(getMidnight());
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkMidnight);
  }, []);

  return useCountdown(endDate);
}
