import { createFileRoute, notFound } from '@tanstack/react-router'
import { z } from 'zod'
import { useVendor } from '@/hooks/use-vendors'
import { VendorStorePage } from '@/components/vendor/VendorStorePage'
import Loader from '@/components/loader'
import { orpcClient } from '@/utils/orpc'

const searchParamsSchema = z.object({
  category: z.union([z.string(), z.array(z.string())]).optional(),
  sort: z.string().optional(),
})

export const Route = createFileRoute('/vendor/$vendorId')({
  component: RouteComponent,
  validateSearch: searchParamsSchema,
  loader: async ({ params }) => {
    const vendor = await orpcClient.product.getVendorBySlug({
      slug: params.vendorId,
    })
    return { vendor }
  },
  head: ({ loaderData, params }) => {
    const vendor = loaderData?.vendor
    if (!vendor) {
      return {
        meta: [
          { title: 'Vendor Not Found - Ayojon' },
          {
            name: 'description',
            content: 'The vendor you are looking for could not be found.',
          },
        ],
      }
    }

    const title = `${vendor.name} - Event Vendor | Ayojon`
    const description =
      vendor.description?.slice(0, 160) ||
      `Shop from ${vendor.name}, a trusted vendor on Ayojon. Quality event rentals and supplies.`
    const url = `https://ayojon.com/vendor/${params.vendorId}`
    const image = vendor.logoUrl || '/og-image.png'

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        {
          name: 'keywords',
          content: `${vendor.name}, event vendor, event rental, Ayojon vendor`,
        },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:image', content: image },
        { property: 'og:url', content: url },
        { property: 'og:type', content: 'profile' },
        { property: 'og:site_name', content: 'Ayojon' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: image },
      ],
      links: [{ rel: 'canonical', href: url }],
    }
  },
})

function RouteComponent() {
  const { vendorId } = Route.useParams()
  const search = Route.useSearch()
  const { data: vendor, isLoading } = useVendor(vendorId)

  const categoryIds =
    typeof search.category === 'string' ? [search.category] : search.category

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!vendor) {
    throw notFound()
  }

  return (
    <VendorStorePage
      vendor={vendor}
      initialCategoryIds={categoryIds}
      initialSort={search.sort as any}
    />
  )
}
