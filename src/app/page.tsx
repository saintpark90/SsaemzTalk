import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function LandingPage() {
  const session = await getSession();
  if (session?.user) {
    redirect("/feed");
  }

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-brand">
          <div className="sidebar-brand-mark">S</div>
          SsaemzTalk
        </div>
        <div className="landing-actions">
          <Link href="/login" className="btn btn-secondary">
            로그인
          </Link>
          <Link href="/signup" className="btn btn-primary">
            시작하기
          </Link>
        </div>
      </nav>

      <main className="landing-hero">
        <h1>
          수업의 노하우를
          <br />
          회사 선생님들과 함께
        </h1>
        <p>
          외근 수업이 많은 선생님들이 수업 계획, 진행 아이디어, 수강생 반응을
          카테고리별로 남기고 검색하는 업무형 공유 공간입니다.
        </p>
        <div className="landing-actions">
          <Link href="/signup" className="btn btn-primary">
            무료로 시작하기
          </Link>
          <Link href="/login" className="btn btn-secondary">
            데모 계정으로 로그인
          </Link>
        </div>
      </main>
    </div>
  );
}
