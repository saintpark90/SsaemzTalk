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

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const categoryId = req.nextUrl.searchParams.get("categoryId");

  const posts = await prisma.post.findMany({
    where: {
      companyId: membership.companyId,
      ...(categoryId ? { categoryId } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { body: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
      attachments: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ posts });
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
  const title = String(body?.title ?? "").trim();
  const content = String(body?.body ?? "").trim();
  const categoryId = String(body?.categoryId ?? "").trim();
  const attachments = Array.isArray(body?.attachments) ? body.attachments : [];

  if (!title || !content || !categoryId) {
    return NextResponse.json(
      { error: "title, body, categoryId required" },
      { status: 400 }
    );
  }

  const category = await prisma.category.findFirst({
    where: { id: categoryId, companyId: membership.companyId },
  });
  if (!category) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      title,
      body: content,
      categoryId,
      companyId: membership.companyId,
      authorId: user.id,
      attachments: {
        create: attachments.map(
          (a: {
            fileName: string;
            mimeType: string;
            size: number;
            storagePath: string;
          }) => ({
            fileName: a.fileName,
            mimeType: a.mimeType,
            size: a.size,
            storagePath: a.storagePath,
          })
        ),
      },
    },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
      attachments: true,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
