const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Create a simple test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: '123123', // Plain text for testing
        role: 'USER',
      },
    });

    console.log('Test user created:', user);
    
    // Also create an admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'admin123',
        role: 'ADMIN',
      },
    });

    console.log('Admin user created:', admin);
    
  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
