const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- RESTORING CORE ACCOUNTS ---');

  // 1. Admin Account
  const admin = await prisma.user.upsert({
    where: { email: 'srmall@admin.com' },
    update: { password: '123123', role: 'ADMIN' },
    create: {
      email: 'srmall@admin.com',
      password: '123123',
      name: 'SR-MANAGE Admin',
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin Created: ${admin.email}`);

  // 2. Default Tenant (Jerick)
  const tenantUser = await prisma.user.upsert({
    where: { email: 'jerick@tenant.com' },
    update: { password: '123123', role: 'TENANT' },
    create: {
      email: 'jerick@tenant.com',
      password: '123123',
      name: 'Jerick Mall Owner',
      role: 'TENANT',
    },
  });
  console.log(`✅ Tenant User Created: ${tenantUser.email}`);

  // Ensure Tenant Profile exists for Jerick
  const tenantProfile = await prisma.tenant.upsert({
    where: { userId: tenantUser.id },
    update: { shopName: 'Jerick Store', unitId: 'GF-01' },
    create: {
      userId: tenantUser.id,
      shopName: 'Jerick Store',
      unitId: 'GF-01',
      description: 'The flagship store of SR Mall.',
      galleryUrls: '[]',
    },
  });
  console.log(`✅ Tenant Profile Restored for: ${tenantProfile.shopName}`);

  console.log('--- RESTORE COMPLETE ---');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
