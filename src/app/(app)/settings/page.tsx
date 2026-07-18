import { requireUser } from "@/lib/tenant";

export default async function SettingsPage() {
  const session = await requireUser();
  const membership = session.membership;

  return (
    <>
      <header className="topbar">
        <div>
          <h1>내 정보</h1>
          <div className="topbar-meta">소속과 역할을 확인합니다</div>
        </div>
      </header>
      <div className="content">
        <div className="panel form">
          <div className="field">
            <label>이름</label>
            <div>{session.user.name}</div>
          </div>
          <div className="field">
            <label>이메일</label>
            <div>{session.user.email}</div>
          </div>
          <div className="field">
            <label>소속 회사</label>
            <div>{membership?.companyName ?? "미연결"}</div>
          </div>
          <div className="field">
            <label>역할</label>
            <div>{membership?.role ?? "-"}</div>
          </div>
          <div className="field">
            <label>상태</label>
            <div>{membership?.status ?? "-"}</div>
          </div>
          <p className="muted" style={{ fontSize: 13, margin: 0 }}>
            추후 회사 규모별 구독(라이선스) 정보가 이 화면에 표시됩니다.
          </p>
        </div>
      </div>
    </>
  );
}
