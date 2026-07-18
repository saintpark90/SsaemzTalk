import { MemberApprovalList } from "@/components/MemberApprovalList";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/tenant";

export default async function AdminMembersPage() {
  const { membership } = await requireAdmin();

  const memberships = await prisma.membership.findMany({
    where: { companyId: membership.companyId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <header className="topbar">
        <div>
          <h1>가입 승인</h1>
          <div className="topbar-meta">
            {membership.companyName} 선생님 가입 요청을 관리합니다
          </div>
        </div>
      </header>
      <div className="content">
        <MemberApprovalList
          initialMemberships={memberships.map((m) => ({
            ...m,
            createdAt: m.createdAt.toISOString(),
          }))}
        />
      </div>
    </>
  );
}
