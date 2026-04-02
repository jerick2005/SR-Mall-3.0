'use server';

import { prisma } from '@srmall/database';
import { revalidatePath } from 'next/cache';

export async function sendMessage(data: {
  userId: string;
  recipientType: 'admin' | 'shop';
  content: string;
  shopName?: string;
  slotId?: string;
}) {
  const { userId: email, recipientType, content, shopName, slotId } = data;

  try {
    let sender = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!sender) {
      sender = await prisma.user.create({
        data: { email, name: email.split('@')[0], password: 'mockpassword', role: 'USER' }
      });
    }

    // In a real app, you would look up the specific Admin or Tenant User ID.
    // Here we find or create dummy target users based on the recipientType to simulate routing.
    let targetUser = null;

    if (recipientType === 'admin') {
      targetUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });
      if (!targetUser) {
        // Fallback: create a dummy admin for testing
        targetUser = await prisma.user.create({
           data: { email: 'admin@srmall.com', password: 'hash', role: 'ADMIN', name: 'Mall Admin' }
        });
      }
    } else if (recipientType === 'shop' && shopName) {
      // Find the Tenant entry by shopName, then get its associated User
      const tenantRecord = await prisma.tenant.findFirst({
        where: { shopName: shopName },
        include: { user: true }
      });
      
      if (tenantRecord?.user) {
        targetUser = tenantRecord.user;
      } else {
         // Create a fallback tenant for testing if it doesn't exist
         const fallbackEmail = `${shopName.replace(/\s+/g, '').toLowerCase()}@tenant.com`;
         targetUser = await prisma.user.upsert({
            where: { email: fallbackEmail },
            update: {},
            create: { email: fallbackEmail, password: 'hash', role: 'TENANT', name: shopName }
         });
         
         // Link it to a tenant record if it's missing
         await prisma.tenant.upsert({
            where: { userId: targetUser.id },
            update: { shopName },
            create: { shopName, unitId: 'L1-XXX', userId: targetUser.id }
         });
      }
    }

    if (!targetUser) {
       throw new Error('Target recipient not found.');
    }

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        userId: sender.id,
        targetId: targetUser.id,
      }
    });

    // Create a new conversation channel if it doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          type: recipientType === 'admin' ? 'ADMIN' : 'TENANT',
          userId: sender.id,
          targetId: targetUser.id,
          spaceSlotId: slotId,
        }
      });
    }

    // Insert the actual message
    const message = await prisma.message.create({
      data: {
        content: content,
        conversationId: conversation.id,
        senderId: sender.id,
      }
    });

    // If there is a slotId, we might also append a system note or link it. We saved it in the conversation above or we append it to the message.

    revalidatePath('/public-view');
    return { success: true, messageId: message.id, targetId: targetUser.id };

  } catch (error) {
    console.error('Failed to send message:', error);
    return { success: false, error: 'Failed to route message.' };
  }
}
