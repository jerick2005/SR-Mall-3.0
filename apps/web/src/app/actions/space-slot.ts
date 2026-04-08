'use server';

import { prisma } from '@srmall/database';
import { revalidatePath } from 'next/cache';

export async function getAreaSlots() {
  try {
    const slots = await prisma.areaSlot.findMany({
      orderBy: { unit_id: 'asc' },
    });
    return { success: true, data: slots };
  } catch (error) {
    console.error('Error fetching area slots:', error);
    return { success: false, error: 'Failed to fetch slots' };
  }
}

export async function getAreaSlotByUnitId(unit_id: string) {
  try {
    const slot = await prisma.areaSlot.findUnique({
      where: { unit_id },
    });
    return { success: true, data: slot };
  } catch (error) {
    console.error('Error fetching slot by unit ID:', error);
    return { success: false, error: 'Failed to fetch slot' };
  }
}

export async function upsertAreaSlot(data: {
  id?: string;
  unit_id: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  sqm_size: number;
  base_rent: number;
  space_images: string[];
}) {
  try {
    if (data.id) {
      await prisma.areaSlot.update({
        where: { id: data.id },
        data: {
          unit_id: data.unit_id,
          status: data.status,
          sqm_size: data.sqm_size,
          base_rent: data.base_rent,
          space_images: data.space_images,
        },
      });
    } else {
      await prisma.areaSlot.create({
        data: {
          unit_id: data.unit_id,
          status: data.status,
          sqm_size: data.sqm_size,
          base_rent: data.base_rent,
          space_images: data.space_images,
        },
      });
    }
    revalidatePath('/admindashboard/space-manager');
    revalidatePath('/public-view');
    return { success: true };
  } catch (error) {
    console.error('Error upserting area slot:', error);
    return { success: false, error: 'Failed to save slot' };
  }
}

export async function getAvailableSlots() {
  try {
    const slots = await prisma.areaSlot.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { unit_id: 'asc' },
    });
    return { success: true, data: slots };
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return { success: false, error: 'Failed to fetch available slots' };
  }
}

export async function occupySlot(unit_id: string) {
  try {
    await prisma.areaSlot.update({
      where: { unit_id },
      data: { status: 'OCCUPIED' },
    });
    revalidatePath('/admindashboard/space-manager');
    revalidatePath('/public-view');
    return { success: true };
  } catch (error) {
    console.error('Error occupying slot:', error);
    return { success: false, error: 'Failed to occupy slot' };
  }
}

export async function reserveSlotAction(unit_id: string, userId: string, userName: string) {
  try {
    // 1. Update Slot Status
    await prisma.areaSlot.update({
      where: { unit_id },
      data: { status: 'RESERVED' },
    });

    // 2. Identify Admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    // 3. Notify Admins
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          type: 'NEW_BOOKING_INQUIRY',
          title: 'New Space Reservation',
          message: `User ${userName} has placed a reservation request for Unit ${unit_id}.`,
        }))
      });
    }

    revalidatePath('/admindashboard/space-manager');
    revalidatePath('/public-view');
    return { success: true };
  } catch (error) {
    console.error('Error reserving slot:', error);
    return { success: false, error: 'Failed to place reservation' };
  }
}

export async function approveReservationAction(unit_id: string) {
  try {
    // 1. Update Slot Status to OCCUPIED
    await prisma.areaSlot.update({
      where: { unit_id },
      data: { status: 'OCCUPIED' },
    });

    // 2. Clear notifications or add an approval notification could go here
    // For now, just revalidate
    
    revalidatePath('/admindashboard/space-manager');
    revalidatePath('/public-view');
    return { success: true };
  } catch (error) {
    console.error('Error approving reservation:', error);
    return { success: false, error: 'Failed to approve reservation' };
  }
}

export async function deleteAreaSlot(id: string) {
  try {
    await prisma.areaSlot.delete({ where: { id } });
    revalidatePath('/admindashboard/space-manager');
    revalidatePath('/public-view');
    return { success: true };
  } catch (error) {
    console.error('Error deleting area slot:', error);
    return { success: false, error: 'Failed to delete slot' };
  }
}
