"use server";

import { prisma } from "@srmall/database";

export async function getRecentActivity() {
  try {
    const activities: any[] = [];

    // 1. Recent Event Inquiries
    const inquiries = await prisma.eventInquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    
    inquiries.forEach((inquiry: any) => {
      activities.push({
        id: `inquiry-${inquiry.id}`,
        type: "booking",
        title: "New Booking Inquiry",
        description: `Interested in ${inquiry.eventType || 'Event'} - ${inquiry.eventName || 'No Name'}`,
        time: inquiry.createdAt,
        urgent: inquiry.status === "PENDING",
      });
    });

    // 2. Recent Invoices (Payments)
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { tenant: { select: { shopName: true } } }
    });

    invoices.forEach((inv: any) => {
      activities.push({
        id: `invoice-${inv.id}`,
        type: "payment",
        title: inv.status === "PAID" ? "Payment Received" : "Invoice Generated",
        description: `${inv.tenant?.shopName || "Tenant"} - ₱${(inv.amount || 0).toLocaleString()}`,
        time: inv.createdAt,
        urgent: inv.status === "OVERDUE",
      });
    });

    // 3. Recent Promos (Ads)
    const promos = await prisma.tenantPromo.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { tenant: { select: { shopName: true } } }
    });

    promos.forEach((promo: any) => {
      activities.push({
        id: `promo-${promo.id}`,
        type: "support", // Use support icon for ads for now
        title: promo.status === "PENDING" ? "Ad Approval Request" : "New Advertisement",
        description: `${promo.tenant?.shopName || "Tenant"} - ${promo.title}`,
        time: promo.createdAt,
        urgent: promo.status === "PENDING",
      });
    });

    // 4. Recent Reviews
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true } }, tenant: { select: { shopName: true } } }
    });

    reviews.forEach((review: any) => {
      activities.push({
        id: `review-${review.id}`,
        type: "contract", // Just to use a different icon
        title: "New Review Posted",
        description: `${review.user?.name || "User"} rated ${review.rating} stars ${review.tenant ? 'for ' + review.tenant.shopName : ''}`,
        time: review.createdAt,
        urgent: review.rating <= 2,
      });
    });

    // Sort all activities by time descending
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // Format time relatively (e.g. "2h ago")
    const formatTime = (date: Date) => {
      const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + "y ago";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + "mo ago";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + "d ago";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + "h ago";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + "m ago";
      return Math.floor(seconds) + "s ago";
    };

    const formattedActivities = activities.slice(0, 10).map((act) => ({
      ...act,
      time: formatTime(act.time),
    }));

    return { success: true, data: formattedActivities };
  } catch (error: any) {
    console.error("Failed to fetch recent activity:", error);
    return { success: false, error: error.message };
  }
}
