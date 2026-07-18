import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, getApprovedMembership } from "@/lib/auth-helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getApprovedMembership(user.id);
  if (!membership) {
    return NextResponse.json({ error: "No approved membership" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const quantity = Number(body?.quantity ?? 1);
  const note = String(body?.note ?? "").trim();

  if (!Number.isFinite(quantity) || quantity < 1) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const material = await prisma.material.findFirst({
    where: { id, companyId: membership.companyId },
  });
  if (!material) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (material.availableQty < quantity) {
    return NextResponse.json({ error: "잔여 수량이 부족합니다." }, { status: 400 });
  }

  const [loan] = await prisma.$transaction([
    prisma.materialLoan.create({
      data: {
        materialId: id,
        userId: user.id,
        quantity,
        note,
        status: "BORROWED",
      },
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.material.update({
      where: { id },
      data: { availableQty: { decrement: quantity } },
    }),
  ]);

  return NextResponse.json({ loan }, { status: 201 });
}
