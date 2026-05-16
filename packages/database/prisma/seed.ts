import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

// Load environment variables from .env file
config({ path: "../.env" });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        "postgresql://postgres:admin123@localhost:5435/srmalldb",
    },
  },
});

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    /* 
    // Commented out to prevent data loss 
    console.log('🧹 Cleaning existing data...');
    await prisma.notification.deleteMany();
    await prisma.notificationPreference.deleteMany();
    await prisma.tenantPromo.deleteMany();
    await prisma.mallAd.deleteMany();
    await prisma.review.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.message.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.areaSlot.deleteMany();
    await prisma.user.deleteMany();
    */

    // Create Admin User (Using upsert to prevent duplicates)
    console.log("👤 Synchronizing admin user...");
    const admin = await prisma.user.upsert({
      where: { email: "jerickaradilla76@gmail.com" },
      update: {},
      create: {
        email: "jerickaradilla76@gmail.com",
        name: "System Admin",
        password: "123123",
        role: "ADMIN",
      },
    });
    console.log(`✅ Admin ready: ${admin.email}`);

    // Create Customer User
    console.log("👤 Synchronizing customer user...");
    const customer = await prisma.user.upsert({
      where: { email: "customer@srmall.com" },
      update: {},
      create: {
        email: "customer@srmall.com",
        name: "John Customer",
        password: "123123",
        role: "CUSTOMER",
      },
    });
    console.log(`✅ Customer ready: ${customer.email}`);

    // Create Tenant User
    console.log("👤 Synchronizing tenant user...");
    const tenant = await prisma.user.upsert({
      where: { email: "jerick@tenant.com" },
      update: {},
      create: {
        email: "jerick@tenant.com",
        name: "Jerick Tenant",
        password: "123123",
        role: "TENANT",
      },
    });
    console.log(`✅ Tenant ready: ${tenant.email}`);

    // Create Area Slots (Only if not already created)
    console.log("🏢 Synchronizing area slots...");
    const areaSlots = await Promise.all([
      prisma.areaSlot.upsert({
        where: { unit_id: "L1-101" },
        update: {},
        create: {
          unit_id: "L1-101",
          status: "AVAILABLE",
          sqm_size: 25.5,
          base_rent: 5000,
          space_images: [],
        },
      }),
      prisma.areaSlot.upsert({
        where: { unit_id: "L1-102" },
        update: {},
        create: {
          unit_id: "L1-102",
          status: "AVAILABLE",
          sqm_size: 30.0,
          base_rent: 6000,
          space_images: [],
        },
      }),
      prisma.areaSlot.upsert({
        where: { unit_id: "L1-105" },
        update: {},
        create: {
          unit_id: "L1-105",
          status: "OCCUPIED",
          sqm_size: 35.0,
          base_rent: 7000,
          space_images: [],
          tenant_id: tenant.id,
        },
      }),
    ]);
    console.log(`✅ ${areaSlots.length} area slots synchronized`);

    // Create Tenant Profile
    console.log("🏪 Synchronizing tenant profile...");
    const tenantProfile = await prisma.tenant.upsert({
      where: { userId: tenant.id },
      update: {},
      create: {
        userId: tenant.id,
        shopName: "Jerick Hub",
        unitId: "L1-105",
        description:
          "Premium electronics and gadgets store with the latest tech products.",
        galleryUrls: [
          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d",
          "https://images.unsplash.com/photo-1556740738-b6a62e25c6d9",
          "https://images.unsplash.com/photo-1580837119756-563d608dd119",
        ],
        status: "ACTIVE",
        products: [
          {
            id: "1",
            name: "Premium Laptop",
            price: 45000,
            description: "High-performance laptop for professionals",
            image:
              "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
          },
          {
            id: "2",
            name: "Wireless Headphones",
            price: 3500,
            description: "Premium noise-cancelling headphones",
            image:
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
          },
        ],
      },
    });
    console.log(`✅ Tenant profile synchronized: ${tenantProfile.shopName}`);

    // Create Mall Ads (Global Hero Carousel)
    console.log("🎯 Creating mall ads...");
    const mallAds = [];
    console.log(`✅ Created ${mallAds.length} mall ads`);

    // Create Tenant Promos (Mixed Image and Video)
    console.log("🎉 Creating tenant promos...");
    const now = new Date();
    const tenantPromos = [];
    console.log(`✅ Created ${tenantPromos.length} tenant promos`);

    // Create Reviews (Only if not already created)
    console.log("⭐ Synchronizing reviews...");
    const reviewCount = await prisma.review.count();
    if (reviewCount === 0) {
      await Promise.all([
        prisma.review.create({
          data: {
            userId: customer.id,
            rating: 5,
            comment:
              "Excellent shopping experience! Great stores and amazing atmosphere.",
            isApproved: true,
          },
        }),
        prisma.review.create({
          data: {
            userId: customer.id,
            rating: 4,
            comment:
              "Good variety of shops, but could use more dining options.",
            isApproved: true,
          },
        }),
      ]);
      console.log("✅ Created 2 default reviews");
    } else {
      console.log("✅ Reviews already exist, skipping...");
    }

    // Create Notification Preferences (Using upsert)
    console.log("🔔 Synchronizing notification preferences...");
    await Promise.all([
      prisma.notificationPreference.upsert({
        where: { userId: admin.id },
        update: {},
        create: {
          userId: admin.id,
          newBookingInquiry: true,
          feedbackSpamDetected: true,
          expiringContracts: true,
          overdueRentPayments: true,
          adSubmissionReceived: false,
          systemHealthReports: false,
        },
      }),
      prisma.notificationPreference.upsert({
        where: { userId: tenant.id },
        update: {},
        create: {
          userId: tenant.id,
          newBookingInquiry: true,
          feedbackSpamDetected: false,
          expiringContracts: true,
          overdueRentPayments: true,
          adSubmissionReceived: true,
          systemHealthReports: false,
        },
      }),
      prisma.notificationPreference.upsert({
        where: { userId: customer.id },
        update: {},
        create: {
          userId: customer.id,
          newBookingInquiry: false,
          feedbackSpamDetected: false,
          expiringContracts: false,
          overdueRentPayments: false,
          adSubmissionReceived: true,
          systemHealthReports: false,
        },
      }),
    ]);
    console.log("✅ Notification preferences synchronized");

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📋 Created Accounts:");
    console.log("├── Admin: srmall@admin.com / 123123");
    console.log("├── Tenant: jerick@tenant.com / 123123");
    console.log("└── Customer: customer@srmall.com / 123123");
    console.log("\n🏪 Tenant Profile: Jerick Hub (Unit L1-105)");
    console.log("🎯 Mall Ads: No example ads created");
    console.log("🎉 Tenant Promos: No example promos created");
    console.log("⭐ Reviews: 2 approved reviews");
    console.log("🔔 Notification Preferences: Configured for all users");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
