const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "wen@user.com" },
      include: { tenant: true }
    });
    console.log("Found user:", user);
  } catch(e) {
    console.error("Error occurred:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
