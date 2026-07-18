import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, getApprovedMembership } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getApprovedMembership(user.id);
  if (!membership) {
    return NextResponse.json({ error: "No approved membership" }, { status: 403 });
  }

  const categories = await prisma.category.findMany({
    where: { companyId: membership.companyId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ categories });
}
