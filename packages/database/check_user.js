const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'jerickaradilla76@gmail.com' }
    });
    console.log('User found:', JSON.stringify(user, null, 2));

    if (user) {
      console.log('Password comparison test:');
      console.log('Plain password check:', user.password === '123123');
      console.log('Password in DB:', user.password);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
