'use server';

import { prisma } from '@srmall/database';
import { revalidatePath } from 'next/cache';

export async function submitInquiryAction(data: {
  userId: string;
  eventType: string;
  eventDate: Date;
  eventTime: string;
}) {
  try {
    const inquiry = await prisma.eventInquiry.create({
      data: {
        userId: data.userId,
        eventType: data.eventType,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        status: 'PENDING'
      }
    });

    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (user && user.email) {
      try {
        const { sendMessage } = await import('./chat');
        await sendMessage({
          userId: user.email,
          recipientType: 'admin',
          content: `I have submitted a new Event Inquiry for: ${data.eventType} on ${new Date(data.eventDate).toLocaleDateString()} at ${data.eventTime}.`
        });
      } catch (err) {
        console.error('Failed to send notification message for inquiry:', err);
      }
    }

    // Create notifications for all admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          type: 'NEW_BOOKING_INQUIRY',
          title: 'Strategic Project Inquiry',
          message: `New masterpiece inquiry: ${data.eventType} planned for ${new Date(data.eventDate).toLocaleDateString()}.`,
        }))
      });
    }

    revalidatePath('/admindashboard/requests');
    revalidatePath('/public-view');
    return { success: true, data: inquiry };
  } catch (error) {
    console.error('Failed to submit inquiry:', error);
    return { success: false, error: 'Failed to submit inquiry' };
  }
}

export async function getInquiriesAction() {
  try {
    const inquiries = await prisma.eventInquiry.findMany({
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return { success: true, data: inquiries };
  } catch (error) {
    console.error('Failed to get inquiries:', error);
    return { success: false, data: [] };
  }
}

export async function updateInquiryStatusAction(id: string, status: 'ACCEPTED' | 'REJECTED', feedback?: string) {
  try {
    const inquiry = await prisma.eventInquiry.update({
      where: { id },
      data: { status },
      include: { user: true }
    });

    // Create a message from Admin to User
    let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
       admin = await prisma.user.create({
         data: { email: 'admin@srmall.com', password: 'hash', role: 'ADMIN', name: 'Mall Admin' }
       });
    }

    if (admin && inquiry.user) {
      let conversation = await prisma.conversation.findFirst({
        where: {
          userId: inquiry.user.id,
          targetId: admin.id,
        }
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            type: 'ADMIN',
            userId: inquiry.user.id,
            targetId: admin.id,
          }
        });
      }

      const messageContent = `[Inquiry Status: ${status}] Your event: ${inquiry.eventType} on ${new Date(inquiry.eventDate).toLocaleDateString()} at ${inquiry.eventTime}. \n\n${feedback ? `Feedback from Admin: ${feedback}` : ''}`;
      
      await prisma.message.create({
        data: {
          content: messageContent,
          conversationId: conversation.id,
          senderId: admin.id,
        }
      });
    }

    revalidatePath('/admin/inquiry');
    return { success: true, data: inquiry };
  } catch (error) {
    console.error('Failed to update inquiry status:', error);
    return { success: false, error: 'Failed to update inquiry' };
  }
}
