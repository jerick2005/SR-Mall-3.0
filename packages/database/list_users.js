const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('--- DATABASE USERS ---');
    users.forEach(u => console.log(`Email: ${u.email} | Password: ${u.password} | Role: ${u.role}`));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
