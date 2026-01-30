import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";

export function AppBreadcrumb() {
  const location = useLocation();
  const pathname = location.pathname;

  // Do not render breadcrumbs on the homepage
  if (pathname === "/") {
    return null;
  }

  const paths = pathname.split("/").filter((path) => path);

  const formatSegment = (segment: string) => {
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Determine if we need to condense for mobile (more than 2 levels deep)
  // Example: Home > Level 1 > Level 2 > Level 3 (Current)
  // We want mobile to show: Home > ... > Level 2 > Level 3
  // paths would be ['level-1', 'level-2', 'level-3'] (length 3)
  const shouldCondense = paths.length > 2;

  return (
    <Breadcrumb className="mb-6 px-4 md:px-0">
      <BreadcrumbList>
        {/* Home is always the first item */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {/* Mobile Ellipsis: Show only on small screens if path is deep */}
        {shouldCondense && (
          <>
            <BreadcrumbItem className="md:hidden">
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator className="md:hidden" />
          </>
        )}

        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          const href = `/${paths.slice(0, index + 1).join("/")}`;
          
          // Hide intermediate items on mobile if we are condensing
          // Keep the last 2 items visible always
          const isHiddenOnMobile = shouldCondense && index < paths.length - 2;

          return (
            <React.Fragment key={path}>
              <BreadcrumbItem className={isHiddenOnMobile ? "hidden md:inline-flex" : ""}>
                {isLast ? (
                  <BreadcrumbPage className="font-semibold">
                    {formatSegment(path)}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={href}>{formatSegment(path)}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              
              {!isLast && (
                <BreadcrumbSeparator 
                  className={isHiddenOnMobile ? "hidden md:list-item" : ""} 
                />
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
