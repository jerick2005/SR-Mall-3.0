require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testConnection() {
  try {
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connected successfully!");
    console.log("Ping response:", result);
    
    // List resources
    const resources = await cloudinary.search.expression('').max_results(5).execute();
    console.log(`Found ${resources.total_count} images in Cloudinary account.`);
  } catch (error) {
    console.error("❌ Cloudinary connection failed:", error);
  }
}

testConnection();
