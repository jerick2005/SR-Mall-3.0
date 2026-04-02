const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5435/srmalldb'
    }
  },
});

async function main() {
  console.log('--- CHECKING RESTORED ACCOUNTS ---');

  try {
    const users = await prisma.user.findMany();
    console.log(`📊 Total Users Found: ${users.length}`);
    
    users.forEach(user => {
      console.log(`👤 User: ${user.email} | Role: ${user.role} | Name: ${user.name}`);
    });

    const tenants = await prisma.tenant.findMany({
      include: { user: true }
    });
    
    console.log(`🏪 Total Tenants Found: ${tenants.length}`);
    tenants.forEach(tenant => {
      console.log(`🏪 Tenant: ${tenant.shopName} | Unit: ${tenant.unitId} | User: ${tenant.user?.email}`);
    });

  } catch (error) {
    console.error('❌ Error checking accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
