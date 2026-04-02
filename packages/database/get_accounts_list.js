const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('--- DATABASE USERS ---');
  console.table(users.map(u => ({ id: u.id, email: u.email, password: u.password, role: u.role })));
  process.exit(0);
}

main();
