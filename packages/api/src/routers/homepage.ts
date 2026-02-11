import { z } from "zod";
import { publicProcedure, os } from "../index";
import { db } from "@my-better-t-app/db";
import { homeBanners, homePromoCards } from "@my-better-t-app/db/schema/index";
import { eq, asc } from "drizzle-orm";

export const homepageRouter = os.router({
  listBanners: publicProcedure
    .route({
      method: "GET",
      path: "/homepage/banners",
      operationId: "listBanners",
      summary: "List Homepage Banners",
      description: "Returns all active homepage banner slides ordered by sort order.",
      tags: ["Homepage"],
    })
    .output(
      z.object({
        banners: z.array(
          z.object({
            id: z.string(),
            imageUrl: z.string(),
            title: z.string(),
            subtitle: z.string(),
            buttonText: z.string(),
            buttonLink: z.string(),
            sortOrder: z.number(),
          })
        ),
      })
    )
    .handler(async () => {
      const banners = await db
        .select({
          id: homeBanners.id,
          imageUrl: homeBanners.imageUrl,
          title: homeBanners.title,
          subtitle: homeBanners.subtitle,
          buttonText: homeBanners.buttonText,
          buttonLink: homeBanners.buttonLink,
          sortOrder: homeBanners.sortOrder,
        })
        .from(homeBanners)
        .where(eq(homeBanners.isActive, true))
        .orderBy(asc(homeBanners.sortOrder));

      return { banners };
    }),

  listPromoCards: publicProcedure
    .route({
      method: "GET",
      path: "/homepage/promo-cards",
      operationId: "listPromoCards",
      summary: "List Homepage Promo Cards",
      description: "Returns all active homepage promotional cards ordered by slot number.",
      tags: ["Homepage"],
    })
    .output(
      z.object({
        promoCards: z.array(
          z.object({
            id: z.string(),
            slotNumber: z.number(),
            imageUrl: z.string(),
            label: z.string(),
            title: z.string(),
            link: z.string(),
          })
        ),
      })
    )
    .handler(async () => {
      const promoCards = await db
        .select({
          id: homePromoCards.id,
          slotNumber: homePromoCards.slotNumber,
          imageUrl: homePromoCards.imageUrl,
          label: homePromoCards.label,
          title: homePromoCards.title,
          link: homePromoCards.link,
        })
        .from(homePromoCards)
        .where(eq(homePromoCards.isActive, true))
        .orderBy(asc(homePromoCards.slotNumber));

      return { promoCards };
    }),
});
