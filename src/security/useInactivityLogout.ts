import { useEffect, useRef, useCallback, useState } from 'react';
import { refreshSession } from './auth';

const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour (60 minutes)
const WARNING_BEFORE_MS = 60 * 1000; // Show warning 60 seconds before logout

interface UseInactivityLogoutOptions {
  isAuthenticated: boolean;
  onLogout: () => void;
}

interface InactivityState {
  showWarning: boolean;
  secondsRemaining: number;
}

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];

export function useInactivityLogout({
  isAuthenticated,
  onLogout,
}: UseInactivityLogoutOptions): InactivityState {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const handleLogout = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    onLogout();
  }, [clearAllTimers, onLogout]);

  const resetTimers = useCallback(() => {
    if (!isAuthenticated) return;

    clearAllTimers();
    setShowWarning(false);
    setSecondsRemaining(60);
    refreshSession();

    // Warning timer fires before the main logout
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      let secs = 60;
      setSecondsRemaining(secs);

      countdownRef.current = setInterval(() => {
        secs -= 1;
        setSecondsRemaining(secs);
        if (secs <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
        }
      }, 1000);
    }, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS);

    // Main logout timer
    logoutTimerRef.current = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT_MS);
  }, [isAuthenticated, clearAllTimers, handleLogout]);

  // Register activity listeners
  useEffect(() => {
    if (!isAuthenticated) {
      clearAllTimers();
      setShowWarning(false);
      return;
    }

    resetTimers();

    const handleActivity = () => resetTimers();
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    );

    return () => {
      clearAllTimers();
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, [isAuthenticated, resetTimers, clearAllTimers]);

  return { showWarning, secondsRemaining };
}
