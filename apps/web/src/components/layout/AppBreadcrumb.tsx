import React, { useEffect } from 'react'
import { Link, useLocation, useMatches } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useCategories } from '@/hooks/use-categories'

export function AppBreadcrumb() {
  const location = useLocation()
  const pathname = location.pathname
  const matches = useMatches()
  const { data: categories } = useCategories()

  // Do not render breadcrumbs on the homepage, vendor routes, or admin routes
  if (
    pathname === '/' ||
    pathname.startsWith('/vendor') ||
    pathname.startsWith('/admin')
  ) {
    return null
  }

  // Check if we're on a product page
  const productMatch = matches.find(
    (match) => match.routeId === '/product/$productSlug',
  )
  const productData = productMatch?.loaderData as any
  const paths = pathname.split('/').filter((path) => path)
  const isCategoryPage = paths[0] === 'category' && paths.length === 2

  const formatSegment = (segment: string) => {
    return segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  // If on product page and have product data, show custom breadcrumb
  if (productData?.product) {
    const product = productData.product
    const category = categories?.find(
      (cat: any) => cat.id === product.categoryId,
    )

    return (
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 py-3 sm:py-4">
        <div className="mx-auto max-w-7xl px-2 sm:px-4">
          <Breadcrumb>
            <BreadcrumbList>
              {/* Home */}
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to="/"
                    className="text-xs sm:text-sm transition-colors hover:text-[hsl(var(--primary))]"
                  >
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-[hsl(var(--muted-foreground))]" />

              {/* Category */}
              {category && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link
                        to={`/category/${category.slug}`}
                        className="text-xs sm:text-sm transition-colors hover:text-[hsl(var(--primary))]"
                      >
                        {category.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-[hsl(var(--muted-foreground))]" />
                </>
              )}

              {/* Product Title */}
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs sm:text-sm font-semibold text-[hsl(var(--foreground))] line-clamp-1">
                  {product.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    )
  }

  // Default breadcrumb for other pages
  const categorySlug = isCategoryPage ? paths[1] : null
  const currentCategory =
    categorySlug && categories
      ? categories.find((cat: any) => cat.slug === categorySlug)
      : null

  // For category pages, show only: Home > Category Name (skip the "category" segment)
  if (isCategoryPage) {
    const displayName =
      currentCategory?.name || formatSegment(categorySlug || '')

    return (
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 py-3 sm:py-4">
        <div className="mx-auto max-w-7xl px-2 sm:px-4">
          <Breadcrumb>
            <BreadcrumbList>
              {/* Home */}
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to="/"
                    className="text-xs sm:text-sm transition-colors hover:text-[hsl(var(--primary))]"
                  >
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-[hsl(var(--muted-foreground))]" />

              {/* Category Name */}
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs sm:text-sm font-semibold text-[hsl(var(--foreground))]">
                  {displayName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    )
  }

  // Determine if we need to condense for mobile (more than 2 levels deep)
  // Example: Home > Level 1 > Level 2 > Level 3 (Current)
  // We want mobile to show: Home > ... > Level 2 > Level 3
  // paths would be ['level-1', 'level-2', 'level-3'] (length 3)
  const shouldCondense = paths.length > 2

  return (
    <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 py-3 sm:py-4">
      <div className="mx-auto max-w-7xl px-2 sm:px-4">
        <Breadcrumb>
          <BreadcrumbList>
            {/* Home is always the first item */}
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to="/"
                  className="text-xs sm:text-sm transition-colors hover:text-[hsl(var(--primary))]"
                >
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-[hsl(var(--muted-foreground))]" />

            {/* Mobile Ellipsis: Show only on small screens if path is deep */}
            {shouldCondense && (
              <>
                <BreadcrumbItem className="md:hidden">
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
                <BreadcrumbSeparator className="md:hidden text-[hsl(var(--muted-foreground))]" />
              </>
            )}

            {paths.map((path, index) => {
              const isLast = index === paths.length - 1
              const href = `/${paths.slice(0, index + 1).join('/')}`

              // Hide intermediate items on mobile if we are condensing
              // Keep the last 2 items visible always
              const isHiddenOnMobile =
                shouldCondense && index < paths.length - 2

              // For category pages, use the actual category name instead of formatted slug
              const displayName = formatSegment(path)

              return (
                <React.Fragment key={path}>
                  <BreadcrumbItem
                    className={isHiddenOnMobile ? 'hidden md:inline-flex' : ''}
                  >
                    {isLast ? (
                      <BreadcrumbPage className="text-xs sm:text-sm font-semibold text-[hsl(var(--foreground))]">
                        {displayName}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          to={href}
                          className="text-xs sm:text-sm transition-colors hover:text-[hsl(var(--primary))]"
                        >
                          {displayName}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>

                  {!isLast && (
                    <BreadcrumbSeparator
                      className={
                        isHiddenOnMobile
                          ? 'hidden md:list-item text-[hsl(var(--muted-foreground))]'
                          : 'text-[hsl(var(--muted-foreground))]'
                      }
                    />
                  )}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  )
}
