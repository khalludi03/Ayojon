// Vendor Factory - Based on PRD Section 7.4

import { faker } from '@faker-js/faker';
import type { Vendor, VendorLocation } from '@/types';
import { slugify } from '@/lib/utils';

const LOCATIONS: Array<VendorLocation> = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'];

export function createVendor(overrides: Partial<Vendor> = {}): Vendor {
  const name = overrides.name || faker.company.name();

  return {
    id: faker.string.uuid(),
    name,
    slug: slugify(name),
    isVerified: faker.datatype.boolean({ probability: 0.7 }), // 70% verified
    rating: faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }),
    productCount: faker.number.int({ min: 10, max: 500 }),
    location: faker.helpers.arrayElement(LOCATIONS),
    joinedAt: faker.date.past({ years: 3 }).toISOString(),
    description: faker.company.catchPhrase(),
    logoUrl: `https://picsum.photos/seed/${faker.string.alphanumeric(8)}/100/100`,
    ...overrides,
  };
}

export function createVendors(count: number): Array<Vendor> {
  return Array.from({ length: count }, () => createVendor());
}
