import Link from "next/link";
import { redirect } from "next/navigation";
import { MembershipStatus } from "@/lib/constants";
import { requireUser } from "@/lib/tenant";

export default async function PendingPage() {
  const session = await requireUser();

  if (!session.membership) {
    redirect("/onboarding/company");
  }
  if (session.membership.status === MembershipStatus.APPROVED) {
    redirect("/feed");
  }

  return (
    <>
      <header className="topbar">
        <div>
          <h1>승인 대기</h1>
          <div className="topbar-meta">회사 담당자의 확인이 필요합니다</div>
        </div>
      </header>
      <div className="content">
        <div className="panel" style={{ padding: 28 }}>
          <span className="badge badge-warn">PENDING</span>
          <h2 style={{ margin: "14px 0 8px", letterSpacing: "-0.02em" }}>
            {session.membership.companyName} 가입 신청이 접수되었습니다
          </h2>
          <p className="muted" style={{ lineHeight: 1.6, marginTop: 0 }}>
            담당자가 승인하면 피드를 이용할 수 있습니다. 승인 후에는 새로고침하거나
            다시 로그인해 주세요.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Link href="/pending" className="btn btn-primary">
              상태 새로고침
            </Link>
            <Link href="/onboarding/company" className="btn btn-secondary">
              다른 회사 선택
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
