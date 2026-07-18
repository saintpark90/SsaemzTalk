"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function HomeLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keepLogin, setKeepLogin] = useState(true);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("이메일 또는 비밀번호를 확인해 주세요.");
      return;
    }

    void keepLogin;
    router.push("/feed");
    router.refresh();
  }

  return (
    <div className="home-login">
      <p className="home-login-eyebrow">기관과 선생님들의 수업관리 툴</p>
      <h1 className="home-login-title">SsaemzTalk</h1>

      <form className="home-login-form" onSubmit={onSubmit}>
        {error ? <div className="error">{error}</div> : null}

        <input
          name="email"
          type="email"
          className="home-input"
          required
          placeholder="아이디 (이메일)"
          autoComplete="email"
        />

        <div className="home-password-wrap">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            className="home-input"
            required
            placeholder="비밀번호"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="home-password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {showPassword ? "숨김" : "보기"}
          </button>
        </div>

        <label className="home-keep">
          <input
            type="checkbox"
            checked={keepLogin}
            onChange={(e) => setKeepLogin(e.target.checked)}
          />
          <span>로그인 상태 유지</span>
        </label>

        <button className="home-login-btn" type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="home-login-links">
        <Link href="/signup">회원가입</Link>
        <span className="home-login-sep">
          <span>비밀번호 찾기</span>
          <i>|</i>
          <span>아이디 찾기</span>
        </span>
      </div>

      <div className="home-social">
        <button type="button" className="home-social-btn" disabled>
          카카오
        </button>
        <button type="button" className="home-social-btn" disabled>
          구글
        </button>
        <button type="button" className="home-social-btn" disabled>
          네이버
        </button>
      </div>
    </div>
  );
}
