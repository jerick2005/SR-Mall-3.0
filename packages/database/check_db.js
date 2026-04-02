
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({
    include: { user: true }
  });
  console.log(JSON.stringify(tenants, null, 2));
  
  const convs = await prisma.conversation.findMany({
    include: {
      messages: {
        include: { sender: true }
      },
      user: true,
      target: true
    }
  });
  console.log('Detailed Conversations:', JSON.stringify(convs, null, 2));
}

main().catch(e => console.error(e));
