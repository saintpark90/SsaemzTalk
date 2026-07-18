import Link from "next/link";
import { redirect } from "next/navigation";
import { HomeLoginForm } from "@/components/HomeLoginForm";
import { getSession } from "@/lib/session";

export default async function LandingPage() {
  const session = await getSession();
  if (session?.user) {
    redirect("/feed");
  }

  return (
    <div className="home">
      <header className="home-nav">
        <Link href="/" className="home-brand">
          <span className="home-brand-mark">S</span>
          <span className="home-brand-text">SsaemzTalk</span>
        </Link>

        <nav className="home-menu" aria-label="주요 메뉴">
          <a href="#about">소개</a>
          <a href="#service">서비스</a>
          <a href="#faq">질문과 답변</a>
        </nav>

        <div className="home-nav-actions">
          <Link href="/signup" className="home-nav-outline">
            회원가입
          </Link>
          <a href="#login" className="home-nav-solid">
            로그인
          </a>
        </div>
      </header>

      <main className="home-main">
        <section className="home-visual" aria-label="서비스 소개 비주얼">
          <div className="home-visual-stage">
            <span className="home-float home-float-bubble" aria-hidden />
            <span className="home-float home-float-plane" aria-hidden />
            <span className="home-float home-float-mail" aria-hidden />

            <div className="home-device">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/bear.png"
                alt="수업 자료와 아이디어를 공유하는 SsaemzTalk 미리보기"
                width={480}
                height={480}
              />
            </div>
          </div>

          <div className="home-promo" id="about">
            수업 노하우를 회사 선생님들과 바로 공유하세요
          </div>
        </section>

        <section className="home-form-panel" id="login">
          <HomeLoginForm />
          <p className="home-demo-hint" id="service">
            데모: admin@ssaemz.com / password123
          </p>
          <p className="home-faq muted" id="faq">
            가입 후 소속 회사를 선택하면 담당자 승인 뒤 피드를 이용할 수 있습니다.
          </p>
        </section>
      </main>
    </div>
  );
}
