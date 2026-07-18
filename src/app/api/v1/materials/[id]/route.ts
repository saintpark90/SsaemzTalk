import { NextRequest, NextResponse } from "next/server";
import { MembershipRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getApiUser, getApprovedMembership } from "@/lib/auth-helpers";

export async function PATCH(
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
  const existing = await prisma.material.findFirst({
    where: { id, companyId: membership.companyId },
    include: { loans: { where: { status: "BORROWED" } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const name = body?.name !== undefined ? String(body.name).trim() : undefined;
  const description =
    body?.description !== undefined ? String(body.description).trim() : undefined;
  const photoPath =
    body?.photoPath !== undefined
      ? body.photoPath
        ? String(body.photoPath)
        : null
      : undefined;
  const totalQty =
    body?.totalQty !== undefined ? Number(body.totalQty) : undefined;

  if (totalQty !== undefined) {
    if (!Number.isFinite(totalQty) || totalQty < 0) {
      return NextResponse.json({ error: "Invalid totalQty" }, { status: 400 });
    }
    const borrowed = existing.loans.reduce((sum, l) => sum + l.quantity, 0);
    if (totalQty < borrowed) {
      return NextResponse.json(
        { error: `대여 중 ${borrowed}개보다 총수량을 줄일 수 없습니다.` },
        { status: 400 }
      );
    }
  }

  const nextTotal = totalQty ?? existing.totalQty;
  const borrowed = existing.loans.reduce((sum, l) => sum + l.quantity, 0);

  const material = await prisma.material.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(photoPath !== undefined ? { photoPath } : {}),
      ...(totalQty !== undefined
        ? { totalQty: nextTotal, availableQty: nextTotal - borrowed }
        : {}),
    },
  });

  return NextResponse.json({ material });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getApprovedMembership(user.id);
  if (!membership || membership.role !== MembershipRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.material.findFirst({
    where: { id, companyId: membership.companyId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.material.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
