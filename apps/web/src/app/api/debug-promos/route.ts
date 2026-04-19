import { NextResponse } from "next/server";
import { prisma } from "@srmall/database";

export async function GET() {
  try {
    console.log("=== DEBUG: Fetching all tenant promos ===");

    const allPromos = await prisma.tenantPromo.findMany({
      include: {
        tenant: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("All promos:", allPromos);

    const pendingPromos = allPromos.filter((p) => p.status === "PENDING");
    const approvedPromos = allPromos.filter((p) => p.status === "APPROVED");

    return NextResponse.json({
      total: allPromos.length,
      pending: pendingPromos.length,
      approved: approvedPromos.length,
      all: allPromos,
      pendingOnly: pendingPromos,
      approvedOnly: approvedPromos,
    });
  } catch (error) {
    console.error("DEBUG PROMOS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch promos" },
      { status: 500 },
    );
  }
}
