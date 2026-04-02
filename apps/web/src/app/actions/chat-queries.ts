'use server';

import { prisma } from '@srmall/database';
import { revalidatePath } from 'next/cache';

// Fetch the active conversation for the public user and selected recipient
export async function getConversationHistory(userId: string, recipientType: 'admin' | 'shop', shopName?: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email: userId } });
    if (!user) return [];

    let targetUser = null;
    if (recipientType === 'admin') {
      targetUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    } else if (recipientType === 'shop' && shopName) {
      // Find the user via the Tenant record shopName
      const tenant = await prisma.tenant.findFirst({
        where: { shopName },
        include: { user: true }
      });
      targetUser = tenant?.user || null;
    }

    if (!targetUser) return [];

    const conversation = await prisma.conversation.findFirst({
      where: {
        userId: user.id,
        targetId: targetUser.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: true }
        }
      }
    });

    return conversation?.messages || [];
  } catch (error) {
    console.error('Failed to get conversation:', error);
    return [];
  }
}

// Fetch conversations specifically for the logged-in tenant
export async function getTenantConversations(userId: string) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        type: 'TENANT',
        targetId: userId
      },
      include: {
        user: true,
        target: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    return conversations;
  } catch (error) {
    console.error('Failed to get tenant conversations:', error);
    return [];
  }
}

// Fetch conversations specifically for the Admin
export async function getAdminConversations() {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        type: 'ADMIN'
      },
      include: {
        user: true,
        target: true,
        areaSlot: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    return conversations;
  } catch (error) {
    console.error('Failed to get admin conversations:', error);
    return [];
  }
}

// Fetch all messages for a specific conversation
export async function getMessagesByConversation(conversationId: string) {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: { sender: true }
    });
    return messages;
  } catch (error) {
    console.error('Failed to get messages:', error);
    return [];
  }
}

// Send a reply (used by tenant/admin)
export async function replyToConversation(conversationId: string, isFromTarget: boolean, content: string) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) throw new Error('Conversation not found');

    const senderId = isFromTarget ? conversation.targetId : conversation.userId;

    const message = await prisma.message.create({
      data: {
        content,
        conversationId,
        senderId,
      }
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    revalidatePath('/tenantdashboard/customer-messenger');
    return { success: true, messageId: message.id };
  } catch (error) {
    console.error('Failed to reply:', error);
    return { success: false };
  }
}
