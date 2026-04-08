'use server';

import { prisma } from '@srmall/database';
import bcrypt from 'bcryptjs';

export async function loginAction(data: { email: string; password: string }) {
  try {
    const email = data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenant: true
      }
    });

    if (!user) {
      return { success: false, error: 'User does not exist.' };
    }

    // Attempt to compare hashed password first
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(data.password, user.password);
    } catch (err) {
      // bcrypt.compare might throw if the password in DB is not a valid hash
    }

    // Fallback to plain text for legacy users if bcrypt didn't match
    if (!isMatch) {
      isMatch = user.password === data.password;
    }

    if (!isMatch) {
      return { success: false, error: 'Invalid email or password.' };
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: user.role,
        tenantId: user.tenant?.id || null
      }
    };
  } catch (error: any) {
    console.error('[LOGIN_ERROR]:', error);
    if (error?.message?.includes("Can't reach database") || error?.code === 'P1001') {
      return { success: false, error: 'Database connection failed. Please ensure your local database is running.' };
    }
    return { success: false, error: 'An unexpected error occurred during login.' };
  }
}

export async function signUpAction(data: { firstName: string; lastName: string; email: string; password: string, role?: 'USER' | 'TENANT' }) {
  try {
    const email = data.email.trim().toLowerCase();
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: 'A user with this email already exists.' };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const fullName = `${data.firstName} ${data.lastName}`;

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        name: fullName,
        password: hashedPassword,
        role: data.role || 'USER', // Custom role or default to USER
      },
    });

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    };
  } catch (error: any) {
    console.error('[SIGNUP_ERROR]:', error);
    return { success: false, error: 'Failed to create account. Please try again.' };
  }
}

export async function getUserCountAction() {
  try {
    const count = await prisma.user.count({
      where: {
        role: {
          not: 'ADMIN' // or simply omit to get all
        }
      }
    });
    return { success: true, data: count };
  } catch (error) {
    return { success: false, error: 'Failed to fetch user count.' };
  }
}

export async function getAllUsersAction() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });
    return { success: true, data: users };
  } catch (error) {
    console.error('[GET_ALL_USERS_ERROR]:', error);
    return { success: false, error: 'Failed to fetch users.' };
  }
}
