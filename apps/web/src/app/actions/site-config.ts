'use server';

import { prisma } from '@srmall/database';
import { revalidatePath } from 'next/cache';

export async function getSiteConfig() {
  try {
    let config = await prisma.siteConfig.findUnique({
      where: { id: 'singleton' }
    });

    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          id: 'singleton',
          heroTitle: "Experience the Future of Shopping.",
          heroSubtitle: "Discover world-class retail, dining, and workspace solutions at SR Mall — your digital concierge for everything mall-related.",
          heroBadge: "Professional Mall Management System",
          heroBgUrl: "https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&q=80&w=2000",
          heroOverlayDark: 40,
          primaryBtnText: "Explore Now",
          isMaintenance: false,
          defaultAdTitle: "Luxe Summer Sale",
          defaultAdDesc: "Experience up to 70% off on all premium luxury brands this weekend only.",
          defaultAdImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000",
          defaultAdCta: "View Directory",
        }
      });
    }

    return config;
  } catch (error) {
    console.error('Failed to fetch site config:', error);
    return null;
  }
}

export async function updateSiteConfig(data: {
  heroTitle?: string;
  heroSubtitle?: string;
  heroBadge?: string;
  heroBgUrl?: string;
  heroOverlayDark?: number;
  primaryBtnText?: string;
  isMaintenance?: boolean;
  defaultAdTitle?: string;
  defaultAdDesc?: string;
  defaultAdImage?: string;
  defaultAdCta?: string;
}) {
  try {
    const config = await prisma.siteConfig.upsert({
      where: { id: 'singleton' },
      update: data,
      create: {
        id: 'singleton',
        heroTitle: data.heroTitle || "Experience the Future of Shopping.",
        heroSubtitle: data.heroSubtitle || "Description...",
        ...data
      }
    });

    revalidatePath('/public-view');
    revalidatePath('/admindashboard/site-editor');
    return { success: true, config };
  } catch (error) {
    console.error('Failed to update site config:', error);
    return { success: false };
  }
}
