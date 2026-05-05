// Review Factory - Generate mock review data

import { faker } from '@faker-js/faker'
import type { Review, ReviewSummary } from '@/types/product'

const reviewTitles = [
  'Excellent product!',
  'Very satisfied',
  'Good value for money',
  'Not as expected',
  'Amazing quality',
  'Could be better',
  'Highly recommend',
  'Decent purchase',
  'Love it!',
  'Disappointed',
  'Great experience',
  'Worth every penny',
  'Not bad',
  'Perfect for my needs',
  'Just okay',
]

const positiveComments = [
  'This product exceeded my expectations. The quality is outstanding and it works perfectly. Would definitely buy again!',
  'Great purchase! Arrived on time and exactly as described. Very happy with this product.',
  'Absolutely love this! The quality is amazing and it looks even better in person. Highly recommend to everyone.',
  'Perfect for what I needed. Good quality and the price was reasonable. Very satisfied with my purchase.',
  'Excellent product! Works great and the vendor was very responsive. Five stars all around!',
  "Really impressed with the quality. It's well-made and durable. Worth every penny!",
  'This is exactly what I was looking for. Great product at a great price. Very happy!',
  'Fantastic quality and fast shipping. The product is even better than I expected.',
  "Very pleased with this purchase. Good quality and it does exactly what it's supposed to do.",
  "Outstanding product! The attention to detail is impressive. Couldn't be happier!",
]

const neutralComments = [
  "It's okay. Does the job but nothing special. Average quality for the price.",
  'Decent product. It works as expected but I was hoping for better quality.',
  "Not bad, but not great either. It's acceptable for the price point.",
  "It's alright. Gets the job done but there are probably better options out there.",
  'Average product. Nothing particularly impressive but it works fine.',
  'Fair quality. It meets my basic needs but I expected more features.',
  "Acceptable purchase. It's decent but I might look for alternatives next time.",
]

const negativeComments = [
  'Disappointed with this purchase. The quality is not as advertised. Would not recommend.',
  'Not what I expected. The product looks different from the pictures and feels cheap.',
  'Poor quality. It broke after just a few uses. Very dissatisfied.',
  "Would not buy again. The product doesn't work as described and customer service was unhelpful.",
  "Waste of money. The quality is terrible and it doesn't do what it's supposed to.",
  'Very disappointed. The product arrived damaged and getting a replacement was difficult.',
  'Not worth the price. You can find much better quality elsewhere for less money.',
]

export function createReview(productId: string, index: number): Review {
  // Bias towards positive reviews (realistic e-commerce pattern)
  const randomValue = faker.number.float({ min: 0, max: 1 })
  let rating: number
  let comment: string
  let title: string | undefined

  if (randomValue < 0.5) {
    // 50% - 5 stars
    rating = 5
    comment = faker.helpers.arrayElement(positiveComments)
    title = faker.helpers.arrayElement(reviewTitles.slice(0, 8))
  } else if (randomValue < 0.75) {
    // 25% - 4 stars
    rating = 4
    comment = faker.helpers.arrayElement([
      ...positiveComments,
      ...neutralComments,
    ])
    title = faker.helpers.arrayElement(reviewTitles)
  } else if (randomValue < 0.9) {
    // 15% - 3 stars
    rating = 3
    comment = faker.helpers.arrayElement(neutralComments)
    title = faker.helpers.arrayElement(reviewTitles.slice(8, 12))
  } else if (randomValue < 0.97) {
    // 7% - 2 stars
    rating = 2
    comment = faker.helpers.arrayElement([
      ...neutralComments,
      ...negativeComments,
    ])
    title = faker.helpers.arrayElement(reviewTitles.slice(10, 15))
  } else {
    // 3% - 1 star
    rating = 1
    comment = faker.helpers.arrayElement(negativeComments)
    title = 'Very disappointed'
  }

  const isAnonymous = faker.datatype.boolean({ probability: 0.15 })
  const hasImages = faker.datatype.boolean({ probability: 0.3 }) && rating >= 4

  return {
    id: `review-${productId}-${index}`,
    productId,
    user: {
      id: `user-${faker.string.uuid()}`,
      name: isAnonymous ? 'Anonymous' : faker.person.fullName(),
      avatar: isAnonymous ? undefined : faker.image.avatar(),
      isAnonymous,
    },
    rating,
    title,
    comment,
    recommend: rating >= 4,
    isVerifiedPurchase: faker.datatype.boolean({ probability: 0.7 }),
    images: hasImages
      ? Array.from(
          { length: faker.number.int({ min: 1, max: 4 }) },
          (_, i) => ({
            url: `https://picsum.photos/seed/review-${productId}-${index}-${i}/400/400`,
            alt: `Review image ${i + 1}`,
          }),
        )
      : [],
    helpfulVotes: faker.number.int({ min: 0, max: 150 }),
    notHelpfulVotes: faker.number.int({ min: 0, max: 30 }),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
  }
}

export function createReviews(productId: string, count: number): Array<Review> {
  return Array.from({ length: count }, (_, i) => createReview(productId, i))
}

export function calculateReviewSummary(reviews: Array<Review>): ReviewSummary {
  const totalReviews = reviews.length

  if (totalReviews === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    }
  }

  const ratingBreakdown = reviews.reduce(
    (acc, review) => {
      acc[review.rating as keyof typeof acc]++
      return acc
    },
    { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  )

  const totalRatingPoints = reviews.reduce(
    (sum, review) => sum + review.rating,
    0,
  )
  const averageRating = totalRatingPoints / totalReviews

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    ratingBreakdown,
  }
}
