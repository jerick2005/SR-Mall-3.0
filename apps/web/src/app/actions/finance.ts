'use server';

import { prisma } from '@srmall/database';
import { revalidatePath } from 'next/cache';

export async function getTenantInvoices(tenantId: string) {
  try {
    const invoices = await (prisma as any).invoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return invoices;
  } catch (error) {
    console.error('Failed to fetch tenant invoices:', error);
    return [];
  }
}

export async function submitDepositSlip(invoiceId: string, url: string, storageKey?: string) {
  try {
    const invoice = await (prisma as any).invoice.update({
      where: { id: invoiceId },
      data: {
        depositSlipUrl: url,
        storageKey: storageKey || null,
        status: 'REVIEWING'
      }
    });
    revalidatePath('/tenantdashboard/lease-payments');
    revalidatePath('/admindashboard/finance');
    return { success: true, invoice };
  } catch (error: any) {
    console.error('Failed to submit deposit slip:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllInvoices() {
  try {
    const invoices = await (prisma as any).invoice.findMany({
      include: {
        tenant: {
          select: {
            shopName: true,
            unitId: true,
            user: { select: { email: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return invoices;
  } catch (error) {
    console.error('Failed to fetch all invoices:', error);
    return [];
  }
}

export async function updateInvoiceStatus(invoiceId: string, status: string) {
  try {
    const invoice = await (prisma as any).invoice.update({
      where: { id: invoiceId },
      data: { status }
    });
    revalidatePath('/tenantdashboard/lease-payments');
    revalidatePath('/admindashboard/finance');
    return { success: true, invoice };
  } catch (error: any) {
    console.error('Failed to update invoice status:', error);
    return { success: false, error: error.message };
  }
}

export async function recordManualPaymentAction(invoiceId: string, referenceNo: string) {
  try {
    const invoice = await (prisma as any).invoice.update({
      where: { id: invoiceId },
      data: { 
        status: 'PAID',
        referenceNo: referenceNo 
      }
    });
    revalidatePath('/tenantdashboard/lease-payments');
    revalidatePath('/admindashboard/tenant-monitoring');
    return { success: true, invoice };
  } catch (error: any) {
    console.error('Failed to record manual payment:', error);
    return { success: false, error: error.message };
  }
}

export async function generateInvoice(data: { tenantId: string; month: string; amount: number; dueDate: Date; description?: string }) {
  try {
    const invoiceNumber = `#INV-${Date.now().toString().slice(-6)}`;
    const invoice = await (prisma as any).invoice.create({
      data: {
        invoiceNumber,
        tenantId: data.tenantId,
        month: data.month,
        amount: data.amount,
        dueDate: data.dueDate,
        description: data.description,
        status: 'PENDING'
      }
    });
    revalidatePath('/tenantdashboard/lease-payments');
    revalidatePath('/admindashboard/finance');
    return { success: true, invoice };
  } catch (error: any) {
    console.error('Failed to create invoice:', error);
    return { success: false, error: error.message };
  }
}
