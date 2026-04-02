const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- SEEDING SPACE INVENTORY ---');

    const spaces = [
      {
        unit_id: 'L1-101',
        sqm_size: 25.0,
        base_rent: 45000.0,
        status: 'AVAILABLE',
        space_images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800']
      },
      {
        unit_id: 'L1-102',
        sqm_size: 15.5,
        base_rent: 32000.0,
        status: 'AVAILABLE',
        space_images: []
      },
      {
        unit_id: 'L2-205',
        sqm_size: 50.0,
        base_rent: 85000.0,
        status: 'OCCUPIED',
        space_images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800']
      },
      {
        unit_id: 'L3-310',
        sqm_size: 125.0,
        base_rent: 150000.0,
        status: 'MAINTENANCE',
        space_images: ['https://images.unsplash.com/photo-1534433393910-bc2158ac34f7?auto=format&fit=crop&q=80&w=800']
      }
    ];

    for (const space of spaces) {
      const slot = await prisma.areaSlot.upsert({
        where: { unit_id: space.unit_id },
        update: space,
        create: space
      });
      console.log(`✅ Space Slot created: ${slot.unit_id} (${slot.sqm_size} / ₱${slot.base_rent})`);
    }

    console.log('--- SEEDING COMPLETE ---');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
