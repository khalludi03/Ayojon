// Countdown Timer Hook

import { useCallback, useEffect, useState } from 'react'
import { formatCountdown, getTimeRemaining } from '@/lib/utils'

interface CountdownState {
  hours: string
  minutes: string
  seconds: string
  totalSeconds: number
  isExpired: boolean
}

/**
 * Countdown timer hook for deal timers
 */
export function useCountdown(endDate: string | Date): CountdownState {
  const calculateTimeLeft = useCallback((): CountdownState => {
    const totalSeconds = getTimeRemaining(endDate)
    const isExpired = totalSeconds <= 0

    if (isExpired) {
      return {
        hours: '00',
        minutes: '00',
        seconds: '00',
        totalSeconds: 0,
        isExpired: true,
      }
    }

    const formatted = formatCountdown(totalSeconds)
    return {
      ...formatted,
      totalSeconds,
      isExpired: false,
    }
  }, [endDate])

  const [timeLeft, setTimeLeft] = useState<CountdownState>(() =>
    calculateTimeLeft(),
  )
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch
    setMounted(true)

    const updateTimer = () => {
      const newTimeLeft = calculateTimeLeft()

      // Only update state if the total seconds changed to prevent unnecessary re-renders
      // or infinite loops if endDate is unstable.
      setTimeLeft((prev) => {
        if (
          prev.totalSeconds === newTimeLeft.totalSeconds &&
          prev.isExpired === newTimeLeft.isExpired
        ) {
          return prev
        }
        return newTimeLeft
      })

      return newTimeLeft.isExpired
    }

    // Update immediately after mount
    const isExpired = updateTimer()
    if (isExpired) return

    // Then update every second
    const timer = setInterval(() => {
      const expired = updateTimer()
      if (expired) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate]) // Use endDate as dependency instead of calculateTimeLeft

  return timeLeft
}

/**
 * Hook for daily countdown (resets at midnight)
 */
export function useDailyCountdown(): CountdownState {
  const getMidnight = () => {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    return midnight.toISOString()
  }

  const [endDate, setEndDate] = useState(getMidnight)

  // Reset at midnight
  useEffect(() => {
    const checkMidnight = setInterval(() => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setEndDate(getMidnight())
      }
    }, 60000) // Check every minute

    return () => clearInterval(checkMidnight)
  }, [])

  return useCountdown(endDate)
}
