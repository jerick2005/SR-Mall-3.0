const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log("Connecting to databases...");
  const localPrisma = new PrismaClient({
    datasourceUrl: "postgresql://postgres:admin123@localhost:5435/srmalldb"
  });

  const remotePrisma = new PrismaClient({
    datasourceUrl: "postgresql://postgres.ualmraraqlenwramdsjk:JERICKSCOTTNIELCHIE123@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
  });

  try {
    const spaces = await localPrisma.areaSlot.findMany();
    console.log(`Found ${spaces.length} spaces in the local database. Copying them to Supabase...`);

    let count = 0;
    for (const space of spaces) {
      await remotePrisma.areaSlot.upsert({
        where: { unit_id: space.unit_id },
        update: space,
        create: space
      });
      count++;
      console.log(`Copied space: ${space.unit_id}`);
    }
    console.log(`✅ Successfully copied all ${count} spaces to your online Supabase!`);
  } catch (err) {
    console.error("Error during copy:", err);
  } finally {
    await localPrisma.$disconnect();
    await remotePrisma.$disconnect();
  }
}

main();
