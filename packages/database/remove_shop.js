
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const shopName = "Velvet & Vine";
  
  // Find the tenant first
  const tenant = await prisma.tenant.findFirst({
    where: { shopName: shopName }
  });

  if (tenant) {
    console.log(`Deleting shop: ${shopName} (ID: ${tenant.id})`);
    
    // The conversation and message records will be deleted by Cascade if configured in Prisma, 
    // or we can manually clear them.
    await prisma.tenant.delete({
      where: { id: tenant.id }
    });
    
    // Also remove the associated user if it's only used for this shop
    await prisma.user.delete({
       where: { id: tenant.userId }
    });

    console.log('Shop and associated owner account removed successfully.');
  } else {
    console.log('Shop not found.');
  }
}

main().catch(e => console.error(e));
