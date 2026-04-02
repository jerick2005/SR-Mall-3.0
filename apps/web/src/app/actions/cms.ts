'use server';

import { prisma } from '@srmall/database';
import { revalidatePath } from 'next/cache';

// Public View Config Actions
export async function getPublicViewConfigAction() {
  try {
    const config = await prisma.publicViewConfig.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    return config;
  } catch (error) {
    console.error('Error fetching public view config:', error);
    return null;
  }
}

export async function updatePublicViewConfigAction(data: {
  logoUrl?: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroBgUrl?: string;
  heroBadge?: string;
  heroOverlayDark?: number;
  featuredVideoUrl?: string;
  videoTitle?: string;
  videoDescription?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  aboutImageUrl?: string;
  contactTitle?: string;
  contactDescription?: string;
}, adminId?: string) {
  try {
    const existingConfig = await prisma.publicViewConfig.findFirst();
    
    if (existingConfig) {
      const updatedConfig = await prisma.publicViewConfig.update({
        where: { id: existingConfig.id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
      revalidatePath('/admindashboard/public-view-cms');
      revalidatePath('/public-view');
      return updatedConfig;
    } else {
      const newConfig = await prisma.publicViewConfig.create({
        data: data
      });
      revalidatePath('/admindashboard/public-view-cms');
      revalidatePath('/public-view');
      return newConfig;
    }
  } catch (error) {
    console.error('Error updating public view config:', error);
    throw new Error('Failed to update public view config');
  }
}

// Carousel Actions
export async function getPublicViewCarouselAction() {
  try {
    const carouselItems = await prisma.publicViewCarousel.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' }
    });
    return carouselItems;
  } catch (error) {
    console.error('Error fetching carousel items:', error);
    return [];
  }
}

export async function getAllCarouselItemsAction() {
  try {
    const carouselItems = await prisma.publicViewCarousel.findMany({
      orderBy: { priority: 'desc' }
    });
    return carouselItems;
  } catch (error) {
    console.error('Error fetching all carousel items:', error);
    return [];
  }
}

export async function createCarouselItemAction(data: {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl?: string;
  isActive?: boolean;
  priority?: number;
  startDate?: Date;
  endDate?: Date;
}, adminId?: string) {
  try {
    const carouselItem = await prisma.publicViewCarousel.create({
      data: data
    });
    revalidatePath('/admindashboard/public-view-cms');
    revalidatePath('/public-view');
    return carouselItem;
  } catch (error) {
    console.error('Error creating carousel item:', error);
    throw new Error('Failed to create carousel item');
  }
}

export async function updateCarouselItemAction(id: string, data: {
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive?: boolean;
  priority?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const updatedItem = await prisma.publicViewCarousel.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
    revalidatePath('/admindashboard/public-view-cms');
    revalidatePath('/public-view');
    return updatedItem;
  } catch (error) {
    console.error('Error updating carousel item:', error);
    throw new Error('Failed to update carousel item');
  }
}

export async function deleteCarouselItemAction(id: string) {
  try {
    await prisma.publicViewCarousel.delete({
      where: { id }
    });
    revalidatePath('/admindashboard/public-view-cms');
    revalidatePath('/public-view');
    return true;
  } catch (error) {
    console.error('Error deleting carousel item:', error);
    throw new Error('Failed to delete carousel item');
  }
}

export async function toggleCarouselItemAction(id: string) {
  try {
    const item = await prisma.publicViewCarousel.findUnique({
      where: { id }
    });
    
    if (!item) {
      throw new Error('Carousel item not found');
    }
    
    const updatedItem = await prisma.publicViewCarousel.update({
      where: { id },
      data: {
        isActive: !item.isActive,
        updatedAt: new Date()
      }
    });
    
    revalidatePath('/admindashboard/public-view-cms');
    revalidatePath('/public-view');
    return updatedItem;
  } catch (error) {
    console.error('Error toggling carousel item:', error);
    throw new Error('Failed to toggle carousel item');
  }
}
