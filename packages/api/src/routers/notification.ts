import { z } from "zod";
import { protectedProcedure, os } from "../index";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../services/notification-service";

export const notificationRouter = os.router({
  /**
   * List user notifications with pagination
   */
  list: protectedProcedure
    .route({
      method: "GET",
      path: "/",
      summary: "Get user notifications",
    })
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(20),
        offset: z.number().min(0).optional().default(0),
      }).optional()
    )
    .handler(async ({ context, input }) => {
      const { limit = 20, offset = 0 } = input || {};
      const notifications = await getUserNotifications(context.session.user.id, limit, offset);
      return notifications;
    }),

  /**
   * Get unread notification count
   */
  unreadCount: protectedProcedure
    .route({
      method: "GET",
      path: "/unread-count",
      summary: "Get unread notification count",
    })
    .handler(async ({ context }) => {
      const count = await getUnreadCount(context.session.user.id);
      return { count };
    }),

  /**
   * Mark notification as read
   */
  markAsRead: protectedProcedure
    .route({
      method: "PATCH",
      path: "/mark-read",
      summary: "Mark notification as read",
    })
    .input(
      z.object({
        notificationId: z.string(),
      })
    )
    .handler(async ({ context, input }) => {
      const notification = await markAsRead(input.notificationId, context.session.user.id);
      return notification;
    }),

  /**
   * Mark all notifications as read
   */
  markAllRead: protectedProcedure
    .route({
      method: "PATCH",
      path: "/mark-all-read",
      summary: "Mark all notifications as read",
    })
    .input(z.object({}).optional())
    .handler(async ({ context }) => {
      await markAllAsRead(context.session.user.id);
      return { success: true };
    }),

  /**
   * Delete notification
   */
  delete: protectedProcedure
    .route({
      method: "DELETE",
      path: "/:notificationId",
      summary: "Delete notification",
    })
    .input(
      z.object({
        notificationId: z.string(),
      })
    )
    .handler(async ({ context, input }) => {
      await deleteNotification(input.notificationId, context.session.user.id);
      return { success: true };
    }),
});
