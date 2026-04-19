"use server";

import { prisma } from "@srmall/database";
import { revalidatePath } from "next/cache";

export async function getNotificationsAction(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return { success: true, data: notifications };
  } catch (error) {
    console.error("[GET_NOTIFICATIONS_ERROR]:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

export async function markNotificationAsReadAction(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to mark as read" };
  }
}

export async function markAllNotificationsAsReadAction(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to mark all as read" };
  }
}
