import { NextRequest, NextResponse } from "next/server";
import { MembershipRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getApiUser, getApprovedMembership } from "@/lib/auth-helpers";
import { unlink } from "fs/promises";
import path from "path";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(_req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getApprovedMembership(user.id);
  if (!membership) {
    return NextResponse.json({ error: "No approved membership" }, { status: 403 });
  }

  const { id } = await params;
  const post = await prisma.post.findFirst({
    where: { id, companyId: membership.companyId },
    include: {
      category: true,
      author: { select: { id: true, name: true, email: true } },
      attachments: true,
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

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
  const existing = await prisma.post.findFirst({
    where: { id, companyId: membership.companyId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = existing.authorId === user.id;
  const isAdmin = membership.role === MembershipRole.ADMIN;
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const categoryId =
    body?.categoryId !== undefined ? String(body.categoryId).trim() : undefined;
  const materialTitle =
    body?.materialTitle !== undefined ? String(body.materialTitle).trim() : undefined;
  const issueNumber =
    body?.issueNumber !== undefined ? String(body.issueNumber).trim() : undefined;
  const sessionNumber =
    body?.sessionNumber !== undefined ? String(body.sessionNumber).trim() : undefined;
  const bodyHtml =
    body?.bodyHtml !== undefined
      ? String(body.bodyHtml).trim()
      : body?.body !== undefined
        ? String(body.body).trim()
        : undefined;
  const lessonDate =
    body?.lessonDate !== undefined ? new Date(body.lessonDate) : undefined;

  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, companyId: membership.companyId },
    });
    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
  }

  if (lessonDate && Number.isNaN(lessonDate.getTime())) {
    return NextResponse.json({ error: "Invalid lessonDate" }, { status: 400 });
  }

  const nextMaterial = materialTitle ?? existing.materialTitle;
  const nextIssue = issueNumber ?? existing.issueNumber;
  const nextSession = sessionNumber ?? existing.sessionNumber;
  const title =
    body?.title !== undefined
      ? String(body.title).trim()
      : [nextMaterial, nextIssue, nextSession].filter(Boolean).join(" · ");

  const post = await prisma.post.update({
    where: { id },
    data: {
      title,
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(materialTitle !== undefined ? { materialTitle } : {}),
      ...(issueNumber !== undefined ? { issueNumber } : {}),
      ...(sessionNumber !== undefined ? { sessionNumber } : {}),
      ...(lessonDate !== undefined ? { lessonDate } : {}),
      ...(bodyHtml !== undefined
        ? { bodyHtml, body: stripHtml(bodyHtml) }
        : {}),
    },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
      attachments: true,
    },
  });

  return NextResponse.json({ post });
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
  if (!membership) {
    return NextResponse.json({ error: "No approved membership" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.post.findFirst({
    where: { id, companyId: membership.companyId },
    include: { attachments: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = existing.authorId === user.id;
  const isAdmin = membership.role === MembershipRole.ADMIN;
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  for (const file of existing.attachments) {
    try {
      await unlink(path.join(process.cwd(), "public", file.storagePath));
    } catch {
      // ignore
    }
  }

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
