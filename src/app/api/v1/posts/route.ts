import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, getApprovedMembership } from "@/lib/auth-helpers";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

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
  const material = req.nextUrl.searchParams.get("material")?.trim() ?? "";
  const issue = req.nextUrl.searchParams.get("issue")?.trim() ?? "";
  const categoryId = req.nextUrl.searchParams.get("categoryId");

  const posts = await prisma.post.findMany({
    where: {
      companyId: membership.companyId,
      ...(categoryId ? { categoryId } : {}),
      ...(material ? { materialTitle: { contains: material } } : {}),
      ...(issue ? { issueNumber: { contains: issue } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { body: { contains: q } },
              { bodyHtml: { contains: q } },
              { materialTitle: { contains: q } },
              { issueNumber: { contains: q } },
              { sessionNumber: { contains: q } },
              { author: { name: { contains: q } } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
      attachments: true,
    },
    orderBy: [{ lessonDate: "desc" }, { createdAt: "desc" }],
    take: 100,
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
  const materialTitle = String(body?.materialTitle ?? "").trim();
  const issueNumber = String(body?.issueNumber ?? "").trim();
  const sessionNumber = String(body?.sessionNumber ?? "").trim();
  const bodyHtml = String(body?.bodyHtml ?? body?.body ?? "").trim();
  const categoryId = String(body?.categoryId ?? "").trim();
  const lessonDateRaw = body?.lessonDate;
  const attachments = Array.isArray(body?.attachments) ? body.attachments : [];

  if (!materialTitle || !bodyHtml || !categoryId) {
    return NextResponse.json(
      { error: "교재/주제, 본문, 카테고리가 필요합니다." },
      { status: 400 }
    );
  }

  const category = await prisma.category.findFirst({
    where: { id: categoryId, companyId: membership.companyId },
  });
  if (!category) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const plain = stripHtml(bodyHtml);
  const title =
    String(body?.title ?? "").trim() ||
    [materialTitle, issueNumber, sessionNumber].filter(Boolean).join(" · ");

  const lessonDate = lessonDateRaw ? new Date(lessonDateRaw) : new Date();
  if (Number.isNaN(lessonDate.getTime())) {
    return NextResponse.json({ error: "Invalid lessonDate" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      title,
      body: plain,
      bodyHtml,
      materialTitle,
      issueNumber,
      sessionNumber,
      lessonDate,
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
