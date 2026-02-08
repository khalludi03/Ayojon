import { z } from "zod";
import { adminProcedure, os } from "../index";
import { db } from "@my-better-t-app/db";
import { 
  user, 
  vendors, 
  products, 
  orders 
} from "@my-better-t-app/db/schema/index";
import { count, eq, gte, sql } from "drizzle-orm";

export const adminRouter = os.router({
  getPlatformMetrics: adminProcedure
    .route({
      method: "GET",
      path: "/admin/metrics",
      operationId: "getPlatformMetrics",
      summary: "Get Platform Metrics",
      description: "Returns basic platform metrics for the admin dashboard.",
      tags: ["Admin"],
    })
    .handler(async () => {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // 1. Basic Counts
      const [userCount] = await db.select({ value: count() }).from(user);
      const [vendorCount] = await db.select({ value: count() }).from(vendors);
      const [productCount] = await db.select({ value: count() }).from(products);

      // 2. Monthly Stats
      const [monthlyOrderCount] = await db
        .select({ value: count() })
        .from(orders)
        .where(gte(orders.createdAt, firstDayOfMonth));

      const [monthlyRevenue] = await db
        .select({ value: sql<string>`sum(${orders.total})` })
        .from(orders)
        .where(gte(orders.createdAt, firstDayOfMonth));

      // 3. Recent Activity
      const recentOrders = await db
        .select()
        .from(orders)
        .orderBy(sql`${orders.createdAt} DESC`)
        .limit(10);

      const recentUsers = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          role: user.role
        })
        .from(user)
        .orderBy(sql`${user.createdAt} DESC`)
        .limit(10);

      return {
        metrics: {
          totalUsers: userCount?.value ?? 0,
          totalVendors: vendorCount?.value ?? 0,
          totalProducts: productCount?.value ?? 0,
          monthlyOrders: monthlyOrderCount?.value ?? 0,
          monthlyRevenue: parseFloat(monthlyRevenue?.value ?? "0"),
        },
        recentOrders,
        recentUsers,
      };
    }),
});
