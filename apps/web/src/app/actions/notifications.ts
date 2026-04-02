'use server';

import { prisma } from '@srmall/database';

export async function getNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { success: true, data: notifications };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: 'Failed to fetch notifications' };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: 'Failed to mark notification as read' };
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: 'Failed to mark all notifications as read' };
  }
}

export async function getNotificationPreferences(userId: string) {
  try {
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });
    return { success: true, data: preferences };
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return { success: false, error: 'Failed to fetch notification preferences' };
  }
}

export async function updateNotificationPreferences(userId: string, preferences: any) {
  try {
    await prisma.notificationPreference.upsert({
      where: { userId },
      update: preferences,
      create: { userId, ...preferences },
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return { success: false, error: 'Failed to update notification preferences' };
  }
}

export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  message: string;
}) {
  try {
    // Check user preferences
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: data.userId },
    });

    // If user has preferences, check if this notification type is enabled
    if (preferences) {
      const isEnabled = preferences[data.type as keyof typeof preferences] as boolean;
      if (!isEnabled) {
        return { success: true, data: null }; // Skip notification if disabled
      }
    }

    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
      },
    });
    return { success: true, data: notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: 'Failed to create notification' };
  }
}

export async function getUnreadNotificationCount(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { success: true, data: count };
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    return { success: false, error: 'Failed to fetch unread notification count' };
  }
}
