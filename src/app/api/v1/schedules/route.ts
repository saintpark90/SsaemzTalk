import { NextRequest, NextResponse } from "next/server";
import { MembershipRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getApiUser, getApprovedMembership } from "@/lib/auth-helpers";
import {
  expandSchedules,
  monthRange,
  sumPayForTeacher,
} from "@/lib/schedules";

export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getApprovedMembership(user.id);
  if (!membership) {
    return NextResponse.json({ error: "No approved membership" }, { status: 403 });
  }

  const year = Number(req.nextUrl.searchParams.get("year") || new Date().getFullYear());
  const month = Number(
    req.nextUrl.searchParams.get("month") || new Date().getMonth() + 1
  );
  const teacherId = req.nextUrl.searchParams.get("teacherId");

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Invalid year/month" }, { status: 400 });
  }

  const { from, to } = monthRange(year, month - 1);

  const rows = await prisma.schedule.findMany({
    where: {
      companyId: membership.companyId,
      ...(teacherId ? { teacherId } : {}),
      OR: [
        {
          isRecurringWeekly: false,
          startAt: { gte: from, lte: to },
        },
        {
          isRecurringWeekly: true,
          // include recurring templates that started before/during month
          startAt: { lte: to },
        },
      ],
    },
    include: {
      teacher: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { startAt: "asc" },
  });

  const schedules = expandSchedules(rows, from, to);
  const payTotal = sumPayForTeacher(schedules, user.id);

  return NextResponse.json({
    schedules,
    payTotal,
    range: { from, to },
  });
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
  const location = String(body?.location ?? "").trim();
  const note = String(body?.note ?? "").trim();
  const isRecurringWeekly = Boolean(body?.isRecurringWeekly);
  const startAt = new Date(body?.startAt);
  const endAt = new Date(body?.endAt);

  const isAdmin = membership.role === MembershipRole.ADMIN;
  let teacherId = user.id;
  let createdByAdmin = false;
  let payAmount: number | null = null;

  if (isAdmin && body?.teacherId) {
    teacherId = String(body.teacherId);
    createdByAdmin = true;
    if (body?.payAmount !== undefined && body?.payAmount !== null && body?.payAmount !== "") {
      payAmount = Number(body.payAmount);
      if (!Number.isFinite(payAmount) || payAmount < 0) {
        return NextResponse.json({ error: "Invalid payAmount" }, { status: 400 });
      }
    }
  }

  if (!title || Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return NextResponse.json(
      { error: "제목과 시작/종료 시간이 필요합니다." },
      { status: 400 }
    );
  }
  if (endAt <= startAt) {
    return NextResponse.json({ error: "종료 시간이 시작보다 늦어야 합니다." }, { status: 400 });
  }

  const teacherMembership = await prisma.membership.findFirst({
    where: {
      userId: teacherId,
      companyId: membership.companyId,
      status: "APPROVED",
    },
  });
  if (!teacherMembership) {
    return NextResponse.json({ error: "대상 선생님을 찾을 수 없습니다." }, { status: 400 });
  }

  const schedule = await prisma.schedule.create({
    data: {
      companyId: membership.companyId,
      teacherId,
      createdById: user.id,
      title,
      location,
      note,
      startAt,
      endAt,
      isRecurringWeekly,
      createdByAdmin,
      payAmount,
    },
    include: {
      teacher: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ schedule }, { status: 201 });
}
