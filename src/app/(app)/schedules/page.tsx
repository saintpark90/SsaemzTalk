import { ScheduleBoard } from "@/components/ScheduleBoard";
import { MembershipRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  expandSchedules,
  monthRange,
  sumPayForTeacher,
} from "@/lib/schedules";
import { requireApprovedMembership } from "@/lib/tenant";

export default async function SchedulesPage() {
  const { session, membership } = await requireApprovedMembership();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const { from, to } = monthRange(year, month - 1);

  const [rows, teachers] = await Promise.all([
    prisma.schedule.findMany({
      where: {
        companyId: membership.companyId,
        OR: [
          { isRecurringWeekly: false, startAt: { gte: from, lte: to } },
          { isRecurringWeekly: true, startAt: { lte: to } },
        ],
      },
      include: {
        teacher: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { startAt: "asc" },
    }),
    prisma.membership.findMany({
      where: {
        companyId: membership.companyId,
        status: "APPROVED",
      },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  const schedules = expandSchedules(rows, from, to);
  const payTotal = sumPayForTeacher(schedules, session.user.id);

  return (
    <>
      <header className="topbar">
        <div>
          <h1>스케줄</h1>
          <div className="topbar-meta">
            장소·시간 등록, 매주 반복, 회사 배정 페이를 확인합니다
          </div>
        </div>
      </header>
      <div className="content">
        <ScheduleBoard
          year={year}
          month={month}
          isAdmin={membership.role === MembershipRole.ADMIN}
          currentUserId={session.user.id}
          teachers={teachers.map((t) => t.user)}
          initialPayTotal={payTotal}
          initialSchedules={schedules.map((s) => ({
            id: s.id,
            occurrenceId: s.occurrenceId,
            title: s.title,
            location: s.location,
            startAt: s.startAt.toISOString(),
            endAt: s.endAt.toISOString(),
            isRecurringWeekly: s.isRecurringWeekly,
            createdByAdmin: s.createdByAdmin,
            payAmount: s.payAmount,
            note: s.note,
            teacher: s.teacher ?? { id: s.teacherId, name: "" },
          }))}
        />
      </div>
    </>
  );
}
