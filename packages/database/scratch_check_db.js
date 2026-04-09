const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.eventInquiry.count();
    console.log('EventInquiry table exists. Count:', count);
  } catch (err) {
    console.error('EventInquiry table does NOT exist or error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
