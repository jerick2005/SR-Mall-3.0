'use server';

import { prisma } from '@srmall/database';
import { revalidatePath } from 'next/cache';
import { getCloudStorageProvider } from '@/lib/cloud-storage';

// ─── CLOUD STORAGE UPLOAD ───────────────────────────────────────────────────────────────────────────────────────────────────

export async function uploadAdImage(file: File): Promise<{ url: string; key: string }> {
  const storage = getCloudStorageProvider();
  return await storage.uploadFile(file, 'ads');
}

export async function deleteAdImage(key: string): Promise<boolean> {
  const storage = getCloudStorageProvider();
  return await storage.deleteFile(key);
}

// ─── ADMIN: MALL-WIDE ADS (HERO CAROUSEL) ───────────────────────────────────

export async function createMallAd(data: {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  startDate: Date;
  endDate: Date;
  adminId: string;
}) {
  try {
    const ad = await prisma.mallAd.create({
      data: {
        ...data,
        isGlobal: true,
      }
    });

    revalidatePath('/admindashboard/ad-scheduler');
    revalidatePath('/public-view');
    return { success: true, ad };
  } catch (error) {
    console.error('[CREATE_MALL_AD_ERROR]:', error);
    return { success: false, error: 'Failed' };
  }
}

// Debug function to get all ads without date filtering
export async function getAllMallAds() {
  try {
    return await prisma.mallAd.findMany({
      where: {
        isGlobal: true,
      },
      orderBy: [
        { priority: 'asc' },
        { startDate: 'desc' }
      ]
    });
  } catch (error) {
    console.error('[GET_ALL_MALL_ADS_ERROR]:', error);
    return [];
  }
}

export async function getActiveMallAds() {
  try {
    const now = new Date();
    return await prisma.mallAd.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
        isGlobal: true,
      },
      orderBy: [
        { priority: 'asc' }, // In Prisma strings, we'd ideally map this or use numbers, but let's assume UI handles sort or we use @default order
        { startDate: 'desc' }
      ]
    });
  } catch (error) {
    console.error('[GET_ACTIVE_MALL_ADS_ERROR]:', error);
    return [];
  }
}

// New function to get all ads for public view (including admin ads)
export async function getAllActiveMallAds() {
  try {
    const now = new Date();
    return await prisma.mallAd.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: [
        { priority: 'asc' },
        { startDate: 'desc' }
      ]
    });
  } catch (error) {
    console.error('[GET_ALL_ACTIVE_MALL_ADS_ERROR]:', error);
    return [];
  }
}

// ─── TENANT: SHOP-SPECIFIC PROMOS (APPROVAL PIPELINE) ─────────────────────

export async function createTenantPromo(data: {
  tenantId: string;
  title: string;
  description?: string;
  promoImage?: string;
  promoVideo?: string;
  category: string;
  startDate: Date;
  endDate: Date;
  mediaType: 'IMAGE' | 'VIDEO';
}) {
  try {
    const promo = await prisma.tenantPromo.create({
      data: {
        title: data.title,
        description: data.description,
        promoImage: data.promoImage || null,
        promoVideo: data.promoVideo || null,
        category: data.category,
        startDate: data.startDate,
        endDate: data.endDate,
        tenantId: data.tenantId,
        mediaType: data.mediaType,
        status: 'PENDING'
      }
    });

    revalidatePath('/tenantdashboard/ad-promo-manager');
    revalidatePath('/admindashboard/ad-scheduler');
    return { success: true, promo };
  } catch (error) {
    console.error('[CREATE_PROMO_ERROR]:', error);
    return { success: false, error: 'Failed' };
  }
}

export async function updatePromoStatus(promoId: string, status: 'APPROVED' | 'REJECTED') {
  try {
    await prisma.tenantPromo.update({
      where: { id: promoId },
      data: { status }
    });

    revalidatePath('/admindashboard/ad-scheduler');
    revalidatePath('/tenantdashboard/ad-promo-manager');
    revalidatePath('/public-view');
    return { success: true };
  } catch (error) {
    console.error('[UPDATE_PROMO_STATUS_ERROR]:', error);
    return { success: false };
  }
}

export async function getPendingPromos() {
  try {
    return await prisma.tenantPromo.findMany({
      where: { status: 'PENDING' },
      include: { tenant: true },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    return [];
  }
}

export async function getActivePromos(category?: string) {
  try {
    const now = new Date();
    return await prisma.tenantPromo.findMany({
      where: {
        status: 'APPROVED',
        startDate: { lte: now },
        endDate: { gte: now },
        category: category || undefined,
      },
      orderBy: { startDate: 'desc' }
    });
  } catch (error) {
    return [];
  }
}

export async function deletePromo(id: string) {
  try {
    await prisma.tenantPromo.delete({ where: { id } });
    revalidatePath('/tenantdashboard/ad-promo-manager');
    return { success: true };
  } catch (error) {
     return { success: false };
  }
}

export async function updateMallAd(id: string, data: {
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const ad = await prisma.mallAd.update({
      where: { id },
      data
    });

    revalidatePath('/admindashboard/ad-scheduler');
    revalidatePath('/public-view');
    return { success: true, ad };
  } catch (error) {
    console.error('[UPDATE_MALL_AD_ERROR]:', error);
    return { success: false, error: 'Failed to update ad' };
  }
}

export async function deleteMallAd(id: string) {
  try {
    await prisma.mallAd.delete({
      where: { id }
    });

    revalidatePath('/admindashboard/ad-scheduler');
    revalidatePath('/public-view');
    return { success: true };
  } catch (error) {
    console.error('[DELETE_MALL_AD_ERROR]:', error);
    return { success: false, error: 'Failed to delete ad' };
  }
}

export async function getTenantByUserId(userId: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { userId }
    });
    return tenant;
  } catch (error) {
    console.error('[GET_TENANT_BY_USER_ID_ERROR]:', error);
    return null;
  }
}

export async function getPromosByTenant(tenantId: string) {
  try {
    return await prisma.tenantPromo.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    return [];
  }
}

export async function updateTenantPromoStatus(id: string, status: 'APPROVED' | 'REJECTED') {
  try {
    await prisma.tenantPromo.update({
      where: { id },
      data: { status }
    });

    // Revalidate the cache for public view and admin scheduler
    revalidatePath('/public-view');
    revalidatePath('/admindashboard/ad-scheduler');
    
    return { success: true };
  } catch (error) {
    console.error('[UPDATE_TENANT_PROMO_STATUS_ERROR]:', error);
    return { success: false, error: 'Failed to update promo status' };
  }
}

export async function deleteTenantPromo(id: string) {
  try {
    await prisma.tenantPromo.delete({
      where: { id }
    });

    revalidatePath('/tenantdashboard/ad-promo-manager');
    revalidatePath('/admindashboard/ad-scheduler');
    return { success: true };
  } catch (error) {
    console.error('[DELETE_TENANT_PROMO_ERROR]:', error);
    return { success: false, error: 'Failed to delete promo' };
  }
}

export async function getApprovedTenantPromos() {
  try {
    const now = new Date();
    return await prisma.tenantPromo.findMany({
      where: {
        status: 'APPROVED',
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: {
        tenant: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('[GET_APPROVED_TENANT_PROMOS_ERROR]:', error);
    return [];
  }
}

