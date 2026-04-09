const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { email: 'wen@user.com' }
  });
  console.log('User found:', user);
  
  const allUsers = await prisma.user.findMany({
    select: { email: true, role: true }
  });
  console.log('All Users:', allUsers);
}

checkUser()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
