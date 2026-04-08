const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Restoring all known data...');

  // Admin
  await prisma.user.upsert({
    where: { email: 'srmall@admin.com' },
    update: {},
    create: {
      email: 'srmall@admin.com',
      password: '123123',
      name: 'SR-MANAGE Admin',
      role: 'ADMIN',
    },
  });

  // Tenant
  const tenantUser = await prisma.user.upsert({
    where: { email: 'jerick@tenant.com' },
    update: {},
    create: {
      email: 'jerick@tenant.com',
      password: '123123',
      name: 'Jerick Mall Owner',
      role: 'TENANT',
    },
  });

  await prisma.tenant.upsert({
    where: { userId: tenantUser.id },
    update: {},
    create: {
      userId: tenantUser.id,
      shopName: 'Jerick Store',
      unitId: 'GF-01',
      description: 'The flagship store of SR Mall.',
      status: 'ACTIVE',
    },
  });

  // Standard User
  await prisma.user.upsert({
    where: { email: 'wen@user.com' },
    update: {},
    create: {
      email: 'wen@user.com',
      password: '123123', // I'll reset password to 123123 for simplicity or keep hash if known
      name: 'wen wen',
      role: 'CUSTOMER',
    },
  });

  // Area Slots
  const spaces = [
    { unit_id: 'L1-101', sqm_size: 25.0, base_rent: 45000.0, status: 'AVAILABLE' },
    { unit_id: 'L1-102', sqm_size: 15.5, base_rent: 32000.0, status: 'AVAILABLE' },
    { unit_id: 'L2-205', sqm_size: 50.0, base_rent: 85000.0, status: 'OCCUPIED' },
    { unit_id: 'L3-310', sqm_size: 125.0, base_rent: 150000.0, status: 'MAINTENANCE' }
  ];

  for (const space of spaces) {
    await prisma.areaSlot.upsert({
      where: { unit_id: space.unit_id },
      update: space,
      create: space
    });
  }

  console.log('✅ Restore complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
