const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({
    include: { user: true }
  });

  if (tenants.length === 0) {
    console.log('No tenants found at all!');
  } else {
    console.log(`Found ${tenants.length} tenant(s):\n`);
    tenants.forEach(t => {
      console.log(`  Shop: ${t.shopName}`);
      console.log(`  Unit: ${t.unitId}`);
      console.log(`  Status: ${t.status}`);
      console.log(`  isOpen: ${t.isOpen}`);
      console.log(`  Email: ${t.user?.email}`);
      console.log('---');
    });
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
