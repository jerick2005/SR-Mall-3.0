const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '../.env' });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5435/srmalldb'
    }
  }
});

async function main() {
  try {
    console.log('--- SEEDING ACCOUNTS ---');

    // Create Admin
    const admin = await prisma.user.upsert({
      where: { email: 'srmall@admin.com' },
      update: {},
      create: {
        email: 'srmall@admin.com',
        name: 'System Admin',
        password: '123123',
        role: 'ADMIN'
      }
    });
    console.log('✅ Admin account created: srmall@admin.com / 123123');

    // Create Tenant User
    const tenantUser = await prisma.user.upsert({
      where: { email: 'jerick@tenant.com' },
      update: {},
      create: {
        email: 'jerick@tenant.com',
        name: 'Jerick Tenant',
        password: '123123',
        role: 'TENANT'
      }
    });
    console.log('✅ Tenant user created: jerick@tenant.com / 123123');

    // Create Tenant Profile
    await prisma.tenant.upsert({
      where: { userId: tenantUser.id },
      update: {},
      create: {
        userId: tenantUser.id,
        shopName: 'Jerick Hub',
        unitId: 'L1-105',
        description: 'Elite tenant shop.',
        galleryUrls: []
      }
    });
    console.log('✅ Tenant profile linked: Jerick Hub');

    console.log('--- SEEDING COMPLETE ---');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
