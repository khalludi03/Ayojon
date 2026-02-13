import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { orpcClient } from '@/utils/orpc'
import { ProductDetailPage } from '@/components/product/ProductDetailPage'

export const Route = createFileRoute('/product/$productSlug')({
  component: RouteComponent,
  loader: async ({ params }) => {
    console.log(
      `[ProductLoader] Loading product for slug: "${params.productSlug}"`,
    )
    try {
      const baseUrl =
        typeof window !== 'undefined'
          ? window.location.origin
          : 'http://localhost:3000'
      const apiUrl = `${baseUrl}/api/product.getProductBySlug?slug=${encodeURIComponent(params.productSlug)}`
      console.log(`[ProductLoader] Fetching from: ${apiUrl}`)

      const product = await orpcClient.product.getProductBySlug({
        slug: params.productSlug,
      })

      if (!product) {
        console.warn(
          `[ProductLoader] Product NOT FOUND for slug: "${params.productSlug}"`,
        )
        throw notFound()
      }

      console.log(`[ProductLoader] Product found: "${product.title}"`)

      let relatedProducts: Array<any> = []
      try {
        const relatedResponse = await orpcClient.product.getProducts({
          category: product.categoryId,
          limit: 8,
        })
        relatedProducts = (relatedResponse.data || []).filter(
          (p: any) => p.id !== product.id,
        )
      } catch (relatedError) {
        console.error(
          `[ProductLoader] Error fetching related products:`,
          relatedError,
        )
      }

      return { product, relatedProducts }
    } catch (error: any) {
      if (
        error?.status === 404 ||
        error?.name === 'NotFoundError' ||
        error?.isNotFound
      ) {
        throw error
      }
      console.error(`[ProductLoader] Unexpected error:`, error)
      throw error
    }
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product
    if (!product) {
      return {
        meta: [
          { title: 'Product Not Found - Ayojon' },
          {
            name: 'description',
            content: 'The product you are looking for could not be found.',
          },
        ],
      }
    }

    const title = `${product.title} - Ayojon`
    const description =
      product.descriptionShort ||
      product.description?.slice(0, 160) ||
      `Rent ${product.title} for your next event. Available at Ayojon marketplace.`
    const image = product.images?.[0]?.url || '/og-image.png'
    const url = `https://ayojon.com/product/${product.slug}`

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        {
          name: 'keywords',
          content: `${product.title}, ${product.categoryId}, event rental, rent ${product.title}, Ayojon`,
        },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:image', content: image },
        { property: 'og:url', content: url },
        { property: 'og:type', content: 'product' },
        { property: 'og:site_name', content: 'Ayojon' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: image },
      ],
      links: [{ rel: 'canonical', href: url }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title,
            description: description,
            image: product.images?.map((img: any) => img.url) || [],
            offers: {
              '@type': 'Offer',
              price: product.pricing?.currentPrice || product.price,
              priceCurrency: product.pricing?.currency || 'BDT',
              availability:
                product.stockStatus === 'in_stock'
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
              seller: {
                '@type': 'Organization',
                name: product.vendor?.name || 'Ayojon',
              },
            },
            aggregateRating:
              product.rating?.count > 0
                ? {
                    '@type': 'AggregateRating',
                    ratingValue: product.rating?.average || 0,
                    reviewCount: product.rating?.count || 0,
                  }
                : undefined,
            brand: product.brand
              ? { '@type': 'Brand', name: product.brand }
              : undefined,
          }),
        },
      ],
    }
  },
  notFoundComponent: () => {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <p className="text-muted-foreground">
          The product you are looking for does not exist.
        </p>
        <Link to="/products">
          <Button variant="outline">Browse Products</Button>
        </Link>
      </div>
    )
  },
})

function RouteComponent() {
  const { product, relatedProducts } = Route.useLoaderData()
  return (
    <ProductDetailPage product={product} relatedProducts={relatedProducts} />
  )
}
