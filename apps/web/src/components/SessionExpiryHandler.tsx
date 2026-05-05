import { useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSession } from '@/lib/session-context'

export default function SessionExpiryHandler() {
  const { session } = useSession() || {}
  const navigate = useNavigate()
  const prevHadSession = useRef(!!session)

  useEffect(() => {
    // If session just expired, redirect and show toast
    if (!session && prevHadSession.current) {
      import('sonner').then(({ toast }) => {
        toast.info('Session expired. Please sign in again.')
      })
      navigate({ to: '/login' })
    }
    prevHadSession.current = !!session
  }, [session, navigate])
  return null
}
