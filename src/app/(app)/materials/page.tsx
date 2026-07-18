import { MaterialsPanel } from "@/components/MaterialsPanel";
import { MembershipRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireApprovedMembership } from "@/lib/tenant";

export default async function MaterialsPage() {
  const { membership } = await requireApprovedMembership();

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

  return (
    <>
      <header className="topbar">
        <div>
          <h1>교구재</h1>
          <div className="topbar-meta">
            잔여 수량 · 대여 · 반납을 한곳에서 관리합니다
          </div>
        </div>
      </header>
      <div className="content">
        <MaterialsPanel
          isAdmin={membership.role === MembershipRole.ADMIN}
          initialMaterials={materials.map((m) => ({
            ...m,
            loans: m.loans.map((l) => ({
              id: l.id,
              quantity: l.quantity,
              status: l.status,
              note: l.note,
              user: l.user,
            })),
          }))}
        />
      </div>
    </>
  );
}
