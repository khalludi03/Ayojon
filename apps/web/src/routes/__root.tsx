import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext, useLocation 
} from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import * as Sentry from '@sentry/react'
import appCss from '../index.css?url'
import type { QueryClient } from '@tanstack/react-query'


import type { orpc } from '@/utils/orpc'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/layout/header/Header'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { VendorLayout } from '@/components/layout/VendorLayout'
import { Footer } from '@/components/layout/footer/Footer'
import { ToastProvider } from '@/components/ui/toast'
import { AppBreadcrumb } from '@/components/layout/AppBreadcrumb'
import { ProductModal } from '@/components/product/ProductModal'
import { useTheme } from '@/stores/theme-store'


export interface RouterAppContext {
  orpc: typeof orpc
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Ayojon - Your Event Marketplace',
      },
      {
        name: 'description',
        content:
          'Discover and rent event supplies from trusted vendors. Decorations, furniture, catering equipment, and more for weddings, birthdays, corporate events.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: Sentry.withErrorBoundary(RootDocument, {
    fallback: ({ error, resetError }) => (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">{error.message}</p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Try again
        </button>
      </div>
    ),
  }),
})

function RootDocument() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  // Vendor management routes use the VendorLayout (sidebar)
  // The public vendor store page (/vendor/:vendorId) uses the regular customer layout
  const reservedVendorRoutes = [
    '/vendor/dashboard',
    '/vendor/products',
    '/vendor/orders',
    '/vendor/settings',
    '/vendor/application-pending',
    '/vendor/application-rejected',
  ]
  const isVendorManagementRoute = reservedVendorRoutes.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(route + '/'),
  )

  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Sync theme with document element once mounted to handle hydration properly
  useEffect(() => {
    setMounted(true)
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
  }, [theme])

  // Admin and Vendor routes use sidebar layouts
  const renderContent = () => {
    if (isAdminRoute) {
      return (
        <AdminLayout>
          <Outlet />
        </AdminLayout>
      )
    }

    if (isVendorManagementRoute) {
      return (
        <VendorLayout>
          <Outlet />
        </VendorLayout>
      )
    }

    // Regular customer routes
    return (
      <>
        <Header />
        <main className="flex-1">
          <AppBreadcrumb />
          <Outlet />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <html lang="en" className={mounted ? theme : ''} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('ayojon-theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var activeTheme = theme || (supportDarkMode ? 'dark' : 'light');

                  if (activeTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <HeadContent />
      </head>
      <body className="min-h-screen flex flex-col">
        <ToastProvider>
          {renderContent()}
          <ProductModal />
        </ToastProvider>
        <Toaster richColors />
        <Scripts />
      </body>
    </html>
  )
}
