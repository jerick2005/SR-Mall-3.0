const { PrismaClient } = require('@prisma/client');

async function main() {
  const localPrisma = new PrismaClient({
    datasourceUrl: "postgresql://postgres:admin123@localhost:5435/srmalldb"
  });

  const remotePrisma = new PrismaClient({
    datasourceUrl: "postgresql://postgres.ualmraraqlenwramdsjk:JERICKSCOTTNIELCHIE123@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
  });

  try {
    const localUsers = await localPrisma.user.count();
    const remoteUsers = await remotePrisma.user.count();

    console.log(`Local DB has ${localUsers} users.`);
    console.log(`Remote Supabase DB has ${remoteUsers} users.`);
  } catch (e) {
    console.error(e);
  } finally {
    await localPrisma.$disconnect();
    await remotePrisma.$disconnect();
  }
}

main();
