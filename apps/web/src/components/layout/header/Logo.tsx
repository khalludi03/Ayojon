import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

export function Logo() {
  const [mounted, setMounted] = useState(false)
  const { data: session } = authClient.useSession()
  const user = session?.user as any

  useEffect(() => {
    setMounted(true)
  }, [])

  let redirectPath = '/'

  if (mounted && user) {
    if (user.role === 'admin') {
      redirectPath = '/admin/dashboard'
    } else if (user.role === 'vendor' && user.vendorStatus === 'approved') {
      redirectPath = '/vendor/dashboard'
    } else if (user.vendorStatus === 'pending') {
      redirectPath = '/vendor/application-pending'
    } else if (user.vendorStatus === 'rejected') {
      redirectPath = '/vendor/application-rejected'
    }
  }

  return (
    <Link to={redirectPath} className="flex items-center gap-1.5 sm:gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] sm:h-9 sm:w-9">
        <span className="text-base font-bold text-white sm:text-lg">A</span>
      </div>
      <span className="text-lg font-bold text-[hsl(var(--foreground))] sm:text-xl">
        <span className="text-[hsl(var(--primary))]">Ayojon</span>
      </span>
    </Link>
  )
}
