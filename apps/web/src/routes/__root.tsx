import type { AppRouter } from "@my-better-t-app/api/routers/index";
import type { QueryClient } from "@tanstack/react-query";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/header/Header";
import { Footer } from "@/components/layout/footer/Footer";
import { ToastProvider } from "@/components/ui/toast";
import { AppBreadcrumb } from "@/components/layout/AppBreadcrumb";
import { ProductModal } from "@/components/product/ProductModal";

import appCss from "../index.css?url";
export interface RouterAppContext {
  trpc: TRPCOptionsProxy<AppRouter>;
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
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('ayojon-theme') || localStorage.getItem('zynex-theme') || 'light';
                  var root = document.documentElement;

                  // Apply theme immediately without transitions
                  root.classList.remove('light', 'dark');
                  root.classList.add(theme);
                } catch (e) {
                  console.error('Failed to apply theme:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ToastProvider>
          <Header />
          <main className="flex-1">
            <AppBreadcrumb />
            <Outlet />
          </main>
          <Footer />
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
