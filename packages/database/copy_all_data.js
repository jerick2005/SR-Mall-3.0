const { PrismaClient } = require('@prisma/client');

async function main() {
  const localPrisma = new PrismaClient({
    datasourceUrl: "postgresql://postgres:admin123@localhost:5435/srmalldb"
  });

  const remotePrisma = new PrismaClient({
    datasourceUrl: "postgresql://postgres.ualmraraqlenwramdsjk:JERICKSCOTTNIELCHIE123@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
  });

  try {
    console.log("Copying users from local to Supabase...");
    const users = await localPrisma.$queryRaw`SELECT * FROM "User"`;

    let userCount = 0;
    for (const u of users) {
      await remotePrisma.user.upsert({
        where: { email: u.email },
        update: u,
        create: u
      });
      userCount++;
    }
    console.log(`✅ Copied ${userCount} users!`);

    console.log("Copying tenants from local to Supabase...");
    const tenants = await localPrisma.$queryRaw`SELECT * FROM "Tenant"`;

    let tenantCount = 0;
    for (const t of tenants) {
      await remotePrisma.tenant.upsert({
        where: { userId: t.userId },
        update: t,
        create: t
      });
      tenantCount++;
    }
    console.log(`✅ Copied ${tenantCount} tenants!`);

  } catch (e) {
    console.error(e);
  } finally {
    await localPrisma.$disconnect();
    await remotePrisma.$disconnect();
  }
}

main();
