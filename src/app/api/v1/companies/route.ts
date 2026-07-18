import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  const companies = await prisma.company.findMany({
    where: q
      ? {
          name: { contains: q },
        }
      : undefined,
    orderBy: { name: "asc" },
    take: 30,
    select: {
      id: true,
      name: true,
      businessNumber: true,
      planTier: true,
    },
  });

  return NextResponse.json({ companies });
}
