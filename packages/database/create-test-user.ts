import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'jerickaradilla76@gmail.com';
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log('Creating User...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = await prisma.user.create({
      data: {
        email,
        name: 'Jerick Aradilla',
        password: hashedPassword,
        role: 'TENANT',
      },
    });
  } else {
    console.log('User already exists, making sure role is TENANT...');
    user = await prisma.user.update({
      where: { email },
      data: { role: 'TENANT' },
    });
  }

  let tenant = await prisma.tenant.findUnique({ where: { userId: user.id } });
  if (!tenant) {
    console.log('Creating Tenant Record...');
    tenant = await prisma.tenant.create({
      data: {
        shopName: 'Jerick Store',
        unitId: 'A-101',
        userId: user.id,
        status: 'ACTIVE',
      },
    });
  } else {
    console.log('Tenant Record exists!');
  }

  console.log('Successfully created testing account:', {
    email: user.email,
    password: 'password123',
    tenantUnitId: tenant?.unitId,
  });

  // Call the Next.js API route to test the notification.
  // Wait, Next.js API route needs GMAIL configured. Since it's server side, we can just trigger an invoice generation.
  // We'll generate an invoice to test it.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  console.log('Triggering a test invoice via HTTP to test Email notification flow...');
  
  try {
    const res = await fetch(`${appUrl}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'BILL_POSTED',
        email: user.email,
        data: {
          unitId: tenant?.unitId || 'A-101',
          shopName: tenant?.shopName || 'Jerick Store',
          amount: 25000,
          month: 'April 2026'
        }
      })
    });
    const result = await res.json();
    console.log('API Response:', result);
  } catch (err: any) {
    console.error('Failed to trigger API', err.message);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
