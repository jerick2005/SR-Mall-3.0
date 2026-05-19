require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Check some image URLs in the DB
    const tenants = await prisma.tenant.findMany({ select: { id: true, logoUrl: true, galleryUrls: true }, take: 2 });
    console.log("Tenants Images:", JSON.stringify(tenants, null, 2));

    const ads = await prisma.mallAd.findMany({ select: { id: true, imageUrl: true }, take: 2 });
    console.log("Ads Images:", JSON.stringify(ads, null, 2));

  } catch (error) {
    console.error("❌ Cloudinary connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
