'use server';

import { prisma } from '@srmall/database';
import { DigitalStorefront } from '@/types/storefront';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { occupySlot } from './space-slot';

/**
 * Updates or creates a tenant's digital storefront profile.
 * Ensure the userId is valid and linked to a user with the TENANT role.
 */
export async function updateStorefrontAction(userId: string, profile: Partial<DigitalStorefront>) {
  try {
    // In a real app, you would verify the session here.
    // We assume the user exists as they are authenticated in the dashboard.
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return { success: false, error: 'User context not found. Please log in again.' };
    }

    const tenant = await prisma.tenant.upsert({
      where: { userId },
      update: {
        shopName: profile.shop_name,
        unitId: profile.unit_id,
        isOpen: profile.is_open,
        description: profile.description,
        logoUrl: profile.logo_url,
        galleryUrls: profile.gallery_urls,
        products: profile.products as any,
      },
      create: {
        userId,
        shopName: profile.shop_name || 'Untitled Shop',
        unitId: profile.unit_id || 'PENDING',
        isOpen: profile.is_open ?? true,
        description: profile.description || '',
        logoUrl: profile.logo_url,
        galleryUrls: profile.gallery_urls || [],
        products: (profile.products || []) as any,
      },
    });

    revalidatePath('/tenantdashboard/digital-storefront');
    revalidatePath('/');

    return {
      success: true,
      data: {
        id: tenant.id,
        shop_name: tenant.shopName,
        unit_id: tenant.unitId,
        is_open: tenant.isOpen,
        description: tenant.description,
        logo_url: tenant.logoUrl,
        gallery_urls: tenant.galleryUrls,
        products: tenant.products as any,
      } as DigitalStorefront
    };
  } catch (error: any) {
    console.error('[UPDATE_STOREFRONT_ERROR]:', error);
    return { success: false, error: error.message || 'Failed to update storefront profile' };
  }
}

export async function getStorefrontAction(userId: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { userId },
    });

    if (!tenant) return { success: false, error: 'No storefront found' };

    return {
      success: true,
      data: {
        id: tenant.id,
        shop_name: tenant.shopName,
        unit_id: tenant.unitId,
        is_open: tenant.isOpen,
        description: tenant.description,
        logo_url: tenant.logoUrl,
        gallery_urls: tenant.galleryUrls,
        products: tenant.products as any,
      } as DigitalStorefront
    };
  } catch (error: any) {
    console.error('[GET_STOREFRONT_ERROR]:', error);
    return { success: false, error: error.message || 'Failed to fetch storefront' };
  }
}

export async function getAllStorefrontsAction() {
  try {
    const tenants = await prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { shopName: 'asc' },
    });

    return {
      success: true,
      data: tenants.map((t: any) => ({
        id: t.id,
        shop_name: t.shopName,
        unit_id: t.unitId,
        is_open: t.isOpen,
        description: t.description,
        logo_url: t.logoUrl,
        gallery_urls: t.galleryUrls,
        products: t.products as any,
      } as DigitalStorefront))
    };
  } catch (error: any) {
    console.error('[GET_ALL_STOREFRONTS_ERROR]:', error);
    return { success: false, error: error.message || 'Failed to fetch directory' };
  }
}

export async function getAllTenantsAction() {
  try {
    const tenants = await prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { shopName: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    return {
      success: true,
      data: tenants.map((t: any) => ({
        id: t.id,
        shopName: t.shopName,
        unitId: t.unitId,
        status: t.status,
        user: t.user,
        description: t.description,
        logoUrl: t.logoUrl,
        galleryUrls: t.galleryUrls,
        products: t.products,
      }))
    };
  } catch (error: any) {
    console.error('[GET_ALL_TENANTS_ERROR]:', error);
    return { success: false, error: error.message || 'Failed to fetch tenants' };
  }
}

/**
 * Fetch a specific shop profile by its primary database ID.
 */
export async function getStorefrontByIdAction(id: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) return { success: false, error: 'Shop not found' };

    return {
      success: true,
      data: {
        id: tenant.id,
        shop_name: tenant.shopName,
        unit_id: tenant.unitId,
        is_open: tenant.isOpen,
        description: tenant.description,
        logo_url: tenant.logoUrl,
        gallery_urls: tenant.galleryUrls,
        products: tenant.products as any,
      } as DigitalStorefront
    };
  } catch (error: any) {
    console.error('[GET_STOREFRONT_BY_ID_ERROR]:', error);
    return { success: false, error: error.message || 'Failed to fetch shop details' };
  }
}
/**
 * Check if email already exists in database
 */
export async function checkEmailExists(email: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    return { success: true, exists: !!existingUser };
  } catch (error: any) {
    console.error('[CHECK_EMAIL_ERROR]:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Registers a new tenant from the Admin Dashboard.
 * Creates a User account + Tenant profile in a single workflow.
 */
export async function registerTenantAction(data: {
  email: string;
  password: string;
  shopName: string;
  category: string;
  unitId: string;
  rentCost: number;
}) {
  try {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return { success: false, error: 'User already exists with this email address.' };
    }

    // 2. Hash the temporary password before saving
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Create the User & Tenant in a transaction
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword, // Store securely
          name: data.shopName,
          role: 'TENANT',
        },
      });

      const newTenant = await tx.tenant.create({
        data: {
          userId: newUser.id,
          shopName: data.shopName,
          unitId: data.unitId,
          status: 'ACTIVE',
          description: `Premier ${data.category} provider at SR Mall.`,
          galleryUrls: [],
          products: [],
        },
      });

      return { user: newUser, tenant: newTenant };
    });

    revalidatePath('/');
    revalidatePath('/admindashboard/tenant-monitoring');

    // Occupy the slot after successful registration
    await occupySlot(data.unitId);

    return {
      success: true,
      data: {
        userId: result.user.id,
        tenantId: result.tenant.id,
        shopName: result.tenant.shopName,
      }
    };
  } catch (error: any) {
    console.error('[REGISTER_TENANT_ERROR]:', error);
    return { success: false, error: error.message || 'Failed to register new tenant' };
  }
}

export async function deleteTenantAction(tenantId: string) {
  try {
    // First get the tenant to find the associated user
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { user: true }
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    // Delete the tenant (this will also delete the user due to cascade)
    await prisma.tenant.delete({
      where: { id: tenantId }
    });

    // Also delete the user since they are no longer needed
    if (tenant.user) {
      await prisma.user.delete({
        where: { id: tenant.user.id }
      });
    }

    revalidatePath('/admindashboard/tenant-monitoring');
    return { success: true };
  } catch (error: any) {
    console.error('[DELETE_TENANT_ERROR]:', error);
    return { success: false, error: error.message || 'Failed to delete tenant' };
  }
}
