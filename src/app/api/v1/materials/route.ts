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

  const materials = await prisma.material.findMany({
    where: { companyId: membership.companyId },
    include: {
      loans: {
        where: { status: "BORROWED" },
        include: { user: { select: { id: true, name: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ materials });
}

export async function POST(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getApprovedMembership(user.id);
  if (!membership) {
    return NextResponse.json({ error: "No approved membership" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const description = String(body?.description ?? "").trim();
  const photoPath = body?.photoPath ? String(body.photoPath) : null;
  const totalQty = Number(body?.totalQty ?? 0);

  if (!name || !Number.isFinite(totalQty) || totalQty < 0) {
    return NextResponse.json({ error: "이름과 수량이 필요합니다." }, { status: 400 });
  }

  const material = await prisma.material.create({
    data: {
      companyId: membership.companyId,
      name,
      description,
      photoPath,
      totalQty,
      availableQty: totalQty,
    },
  });

  return NextResponse.json({ material }, { status: 201 });
}
