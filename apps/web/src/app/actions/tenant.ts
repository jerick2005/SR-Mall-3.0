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
    revalidatePath('/tenantdashboard/profile-settings');
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

export async function updateTenantProfileAction(userId: string, data: { name?: string; email?: string; shopName?: string; description?: string; logoUrl?: string }) {
  try {
    const updateTasks = [];

    // Update User details
    if (data.name || data.email) {
      updateTasks.push(prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          email: data.email
        }
      }));
    }

    // Update Tenant details
    if (data.shopName !== undefined || data.description !== undefined || data.logoUrl !== undefined) {
      updateTasks.push(prisma.tenant.update({
        where: { userId },
        data: {
          shopName: data.shopName,
          description: data.description,
          logoUrl: data.logoUrl
        }
      }));
    }

    await Promise.all(updateTasks);
    
    revalidatePath('/tenantdashboard/profile-settings');
    revalidatePath('/tenantdashboard');
    
    return { success: true };
  } catch (error: any) {
    console.error('[UPDATE_PROFILE_ERROR]:', error);
    return { success: false, error: error.message };
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

export async function getTenantProfileAction(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: true
      }
    });

    if (!user) return { success: false, error: 'User not found' };

    return { 
      success: true, 
      data: {
        name: user.name,
        email: user.email,
        shopName: user.tenant?.shopName || '',
        description: user.tenant?.description || '',
        logoUrl: user.tenant?.logoUrl || '',
        unitId: user.tenant?.unitId || 'N/A',
        status: user.tenant?.status || 'ACTIVE'
      }
    };
  } catch (error: any) {
    console.error('[GET_PROFILE_ERROR]:', error);
    return { success: false, error: error.message };
  }
}

export async function deactivateTenantTerminalAction(userId: string) {
  try {
    await prisma.tenant.update({
      where: { userId },
      data: { status: 'SUSPENDED' }
    });
    
    revalidatePath('/tenantdashboard/profile-settings');
    revalidatePath('/admindashboard/tenant-monitoring');
    
    return { success: true };
  } catch (error: any) {
    console.error('[DEACTIVATE_TENANT_ERROR]:', error);
    return { success: false, error: error.message };
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
    const tenants = await (prisma as any).tenant.findMany({
      orderBy: { shopName: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true }
        }
      }
    });

    return {
      success: true,
      data: tenants.map((t: any) => {
        const totalRating = t.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
        const avgRating = t.reviews.length > 0 ? totalRating / t.reviews.length : 0;
        
        return {
          id: t.id,
          shopName: t.shopName,
          unitId: t.unitId,
          status: t.status,
          user: t.user,
          description: t.description,
          logoUrl: t.logoUrl,
          galleryUrls: t.galleryUrls,
          products: t.products,
          avgRating,
          reviewCount: t.reviews.length
        };
      })
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
    const result = await prisma.$transaction(async (tx) => {
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

export async function requestTenantAction(userId: string, data: { shopName: string; description: string }) {
  try {
    // Verify the user exists in database first
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: 'User account not found. Please sign in again.' };

    const existing = await prisma.tenant.findUnique({ where: { userId } });
    if (existing) {
      if (existing.status === 'REJECTED') {
        return { success: false, error: 'Your previous application was rejected. You cannot reapply at this time.' };
      }
      return { success: false, error: 'You already have a pending or active storefront application.' };
    }

    await prisma.tenant.create({
      data: {
        userId,
        shopName: data.shopName,
        unitId: 'PENDING_ASSIGNMENT',
        status: 'PENDING',
        description: data.description,
        products: [],
        galleryUrls: []
      }
    });

    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          type: 'AD_SUBMISSION_RECEIVED',
          title: 'New Merchant Application',
          message: `Digital registration received for: ${data.shopName}. Review required.`,
        }))
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('[REQUEST_TENANT_ERROR]:', error);
    return { success: false, error: error.message };
  }
}

export async function approveTenantAction(tenantId: string, unitId?: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { user: true }
    });

    if (!tenant) return { success: false, error: 'Application not found' };

    await prisma.$transaction([
      prisma.user.update({
        where: { id: tenant.userId },
        data: { role: 'TENANT' }
      }),
      prisma.tenant.update({
        where: { id: tenantId },
        data: { 
          status: 'ACTIVE',
          ...(unitId && { unitId })
        }
      })
    ]);

    if (unitId && unitId !== 'PENDING_ASSIGNMENT') {
      await occupySlot(unitId);
    }

    revalidatePath('/admindashboard/tenant-monitoring');
    revalidatePath('/admindashboard/space-manager');
    revalidatePath('/public-view');
    
    return { success: true };
  } catch (error: any) {
    console.error('[APPROVE_TENANT_ERROR]:', error);
    return { success: false, error: error.message };
  }
}

export async function getPendingTenantsAction() {
  try {
    const pending = await prisma.tenant.findMany({
      where: { status: 'PENDING' },
      include: { user: true }
    });
    return { success: true, data: pending };
  } catch (error: any) {
    return { success: false, error: error.message };
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

    // Free up the unit if they had one
    if (tenant.unitId && tenant.unitId !== 'PENDING_ASSIGNMENT') {
      try {
        await prisma.areaSlot.update({
          where: { unit_id: tenant.unitId },
          data: { status: 'AVAILABLE', tenant_id: null }
        });
      } catch (e) {
        console.warn(`Could not free unit ${tenant.unitId}`, e);
      }
    }

    // Use a transaction to ensure both operations complete atomically
    await prisma.$transaction(async (tx) => {
      // Revert the user back to CUSTOMER instead of deleting them
      if (tenant.userId) {
        await tx.user.update({
          where: { id: tenant.userId },
          data: { role: 'CUSTOMER' }
        });
      }

      // Delete the tenant profile
      await tx.tenant.delete({
        where: { id: tenantId }
      });
    });

    revalidatePath('/admindashboard/tenant-monitoring');
    revalidatePath('/admindashboard/space-manager');
    revalidatePath('/admindashboard/user-management');
    revalidatePath('/public-view');
    return { success: true };
  } catch (error: any) {
    console.error('[DELETE_TENANT_ERROR]:', error);
    return { success: false, error: error.message || 'Failed to delete tenant' };
  }
}

export async function rejectTenantAction(tenantId: string) {
  try {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { status: 'REJECTED' }
    });

    revalidatePath('/admindashboard/merchant-requests');
    return { success: true };
  } catch (error: any) {
    console.error('[REJECT_TENANT_ERROR]:', error);
    return { success: false, error: error.message || 'Failed to reject application' };
  }
}

export async function getTenantStatusAction(userId: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { userId },
      select: { status: true }
    });
    return { success: true, status: tenant?.status || null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function getTenantReportDataAction() {
  try {
    const tenants = await (prisma as any).tenant.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        },
        invoices: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const slots = await prisma.areaSlot.findMany();

    const data = tenants.map(t => {
      const slot = slots.find(s => s.unit_id === t.unitId);
      
      const expiryDate = new Date(t.createdAt);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const unpaidInvoices = t.invoices.filter((inv: any) => inv.status !== 'PAID');
      const balance = unpaidInvoices.reduce((sum: number, inv: any) => sum + inv.amount, 0);
      
      const lastPaidInvoice = t.invoices.find((inv: any) => inv.status === 'PAID');
      const lastPaymentDate = lastPaidInvoice ? lastPaidInvoice.createdAt : null;

      // Find the earliest due date among unpaid invoices
      const overdueInvoice = unpaidInvoices
        .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
      const nextDueDate = overdueInvoice ? overdueInvoice.dueDate : null;

      let floorLevel = 'Ground Floor';
      if (t.unitId && t.unitId.includes('-')) {
        const floorPart = t.unitId.split('-')[0];
        if (floorPart.startsWith('L')) {
          floorLevel = `Level ${floorPart.substring(1)}`;
        }
      }

      let category = 'Retail';
      if (t.description && t.description.includes('provider')) {
        const parts = t.description.split(' ');
        const providerIndex = parts.indexOf('provider');
        if (providerIndex > 0) {
          category = parts[providerIndex - 1];
        }
      }

      return {
        id: t.id,
        shopName: t.shopName,
        tenantOwner: t.user?.name || t.user?.email || 'N/A',
        unitId: t.unitId,
        sqmSize: slot?.sqm_size || 0,
        monthlyRent: slot?.base_rent || 0,
        balance,
        lastPaymentDate,
        nextDueDate,
        leaseExpiryDate: expiryDate,
        category: category,
        status: t.invoices[0]?.status === 'PAID' ? 'PAID' : (t.invoices[0]?.status || 'PENDING'),
        floorLevel
      };
    });

    // Solve "Organize the list by Floor Level"
    data.sort((a, b) => a.floorLevel.localeCompare(b.floorLevel));

    return { success: true, data };
  } catch (error: any) {
    console.error('[GET_TENANT_REPORT_DATA_ERROR]:', error);
    return { success: false, error: error.message };
  }
}

export async function adminUpdateTenantAction(tenantId: string, data: {
  shopName?: string;
  unitId?: string;
  status?: string;
  description?: string;
  rentCost?: number;
}) {
  try {
    const currentTenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!currentTenant) return { success: false, error: 'Tenant not found' };

    const targetUnitId = data.unitId || currentTenant.unitId;

    // Handle Unit ID change logic
    if (data.unitId && data.unitId !== currentTenant.unitId) {
      // 1. Free old slot
      if (currentTenant.unitId && currentTenant.unitId !== 'PENDING_ASSIGNMENT') {
        try {
          await prisma.areaSlot.update({
            where: { unit_id: currentTenant.unitId },
            data: { status: 'AVAILABLE', tenant_id: null }
          });
        } catch (e) {
          console.warn(`Could not free unit ${currentTenant.unitId}`, e);
        }
      }
      // 2. Occupy new slot
      await occupySlot(data.unitId);
    }

    // Handle Rent update if provided
    if (data.rentCost !== undefined && targetUnitId && targetUnitId !== 'PENDING_ASSIGNMENT') {
      await prisma.areaSlot.update({
        where: { unit_id: targetUnitId },
        data: { base_rent: data.rentCost }
      });
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        shopName: data.shopName,
        unitId: data.unitId,
        status: data.status,
        description: data.description,
      }
    });

    revalidatePath('/admindashboard/tenant-monitoring');
    revalidatePath('/public-view');

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('[ADMIN_UPDATE_TENANT_ERROR]:', error);
    return { success: false, error: error.message || 'Failed to update tenant' };
  }
}

