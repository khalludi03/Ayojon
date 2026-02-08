import type { QueryClient } from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/header/Header";
import { VendorHeader } from "@/components/layout/header/VendorHeader";
import { AdminHeader } from "@/components/layout/header/AdminHeader";
import { Footer } from "@/components/layout/footer/Footer";
import { ToastProvider } from "@/components/ui/toast";
import { AppBreadcrumb } from "@/components/layout/AppBreadcrumb";
import { ProductModal } from "@/components/product/ProductModal";
import { orpc } from "@/utils/orpc";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTheme } from "@/stores/theme-store";

import appCss from "../index.css?url";
export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Ayojon - Your Event Marketplace",
      },
      {
        name: "description",
        content: "Discover and rent event supplies from trusted vendors. Decorations, furniture, catering equipment, and more for weddings, birthdays, corporate events.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  const location = useLocation();
  const isVendorRoute = location.pathname.startsWith('/vendor');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Sync theme with document element once mounted to handle hydration properly
  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  const renderHeader = () => {
    if (isAdminRoute) return <AdminHeader />;
    if (isVendorRoute) return <VendorHeader />;
    return <Header />;
  };

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
          {renderHeader()}
          <main className="flex-1">
            <AppBreadcrumb />
            <Outlet />
          </main>
          {!isVendorRoute && !isAdminRoute && <Footer />}
          <ProductModal />
        </ToastProvider>
        <Toaster richColors />
        <TanStackRouterDevtools position="bottom-left" />
        <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
