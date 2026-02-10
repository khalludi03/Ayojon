import { db } from './packages/db/src/index';
import { products } from './packages/db/src/schema/products';
import { eq, and, desc } from 'drizzle-orm';

async function testListProducts() {
  console.log('--- Testing listProducts Query Logic ---');
  
  const conditions = [eq(products.status, 'active')];
  
  const items = await db.query.products.findMany({
    where: and(...conditions),
    limit: 20,
    offset: 0,
    orderBy: [desc(products.createdAt)],
    with: {
      images: true,
      vendor: true,
    },
  });

  console.log(`Found ${items.length} products`);
  console.log(JSON.stringify(items, null, 2));
}

testListProducts().catch(console.error);
