import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'

import SignInForm from '@/components/sign-in-form'
import SignUpForm from '@/components/sign-up-form'
import { getUser } from '@/functions/get-user'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const session = await getUser()
    if (session) {
      const user = session.user as any
      // Redirect already-logged-in users to their dashboard
      if (user.role === 'admin') {
        throw redirect({ to: '/admin/dashboard' })
      }
      if (user.role === 'vendor') {
        throw redirect({ to: '/vendor/dashboard' })
      }
      // Regular customers go to home
      throw redirect({ to: '/' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(true)

  return showSignIn ? (
    <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
  ) : (
    <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
  )
}
