import { redirect } from "next/navigation";
import { CompanySearch } from "@/components/CompanySearch";
import { MembershipStatus } from "@/lib/constants";
import { requireUser } from "@/lib/tenant";

export default async function CompanyOnboardingPage() {
  const session = await requireUser();

  if (session.membership?.status === MembershipStatus.APPROVED) {
    redirect("/feed");
  }
  if (session.membership?.status === MembershipStatus.PENDING) {
    redirect("/pending");
  }

  return (
    <>
      <header className="topbar">
        <div>
          <h1>회사 선택</h1>
          <div className="topbar-meta">
            소속 회사를 검색한 뒤 가입을 신청하세요. 담당자 승인 후 이용할 수 있습니다.
          </div>
        </div>
      </header>
      <div className="content">
        <CompanySearch />
      </div>
    </>
  );
}
