import { PrismaClient } from "@prisma/client";

const localDbUrl = "postgresql://postgres:admin123@localhost:5435/srmalldb";
const remoteDbUrl = "postgresql://postgres.ualmraraqlenwramdsjk:JERICKSCOTTNIELCHIE123@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"; // Use port 6543 for transaction mode to avoid max connections

const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: localDbUrl,
    },
  },
});

const remotePrisma = new PrismaClient({
  datasources: {
    db: {
      url: remoteDbUrl,
    },
  },
});

async function syncTable(tableName: string, modelName: string, idField: string = "id") {
    console.log(`\nFetching local ${tableName}...`);
    try {
      const records: any[] = await localPrisma.$queryRawUnsafe(`SELECT * FROM "${tableName}"`);
      console.log(`Found ${records.length} records in ${tableName}. Syncing to remote...`);
      for (const record of records) {
        // Handle date fields that might be strings
        const data = { ...record };
        if (data.products && typeof data.products === 'string') {
          try { data.products = JSON.parse(data.products); } catch (e: any) {}
        }
        if (data.postSales && typeof data.postSales === 'string') {
          try { data.postSales = JSON.parse(data.postSales); } catch (e: any) {}
        }

        await (remotePrisma as any)[modelName].upsert({
          where: { [idField]: record[idField] },
          update: data,
          create: data,
        });
      }
      console.log(`✅ ${tableName} synced.`);
    } catch (e: any) {
      console.log(`⚠️ Skipping ${tableName} or error occurred:`, e.message);
    }
}

async function main() {
  console.log("Starting data synchronization from local to remote...");

  try {
    // 1. Sync Core tables (Users, AreaSlots, Tenants)
    await syncTable("User", "user");
    await syncTable("AreaSlot", "areaSlot");
    await syncTable("Tenant", "tenant");

    // 2. Sync Configs and content
    await syncTable("SiteConfig", "siteConfig");
    await syncTable("PublicViewConfig", "publicViewConfig");
    await syncTable("PublicViewCarousel", "publicViewCarousel");
    await syncTable("MallAd", "mallAd");
    await syncTable("TenantPromo", "tenantPromo");

    // 3. Sync User interactions and transactions
    await syncTable("Review", "review");
    await syncTable("Invoice", "invoice");
    await syncTable("Conversation", "conversation");
    await syncTable("Message", "message");
    await syncTable("NotificationPreference", "notificationPreference");
    await syncTable("Notification", "notification");
    await syncTable("EventInquiry", "eventInquiry");

    console.log("\n🎉 ALL Data synchronization completed successfully!");
  } catch (error) {
    console.error("❌ Error during synchronization:", error);
  } finally {
    await localPrisma.$disconnect();
    await remotePrisma.$disconnect();
  }
}

main();
