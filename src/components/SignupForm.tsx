"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };

    const res = await fetch("/api/v1/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || "가입에 실패했습니다.");
      return;
    }

    const login = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });

    setLoading(false);

    if (login?.error) {
      setError("가입은 완료되었지만 로그인에 실패했습니다. 로그인해 주세요.");
      router.push("/login");
      return;
    }

    router.push("/onboarding/company");
    router.refresh();
  }

  return (
    <div className="auth-card">
      <h1>회원가입</h1>
      <p className="lead">가입 후 소속 회사를 선택하고 담당자 승인을 받습니다.</p>

      <form className="form" onSubmit={onSubmit} style={{ padding: 0 }}>
        {error ? <div className="error">{error}</div> : null}
        <div className="field">
          <label htmlFor="name">이름</label>
          <input id="name" name="name" className="input" required />
        </div>
        <div className="field">
          <label htmlFor="email">이메일</label>
          <input id="email" name="email" type="email" className="input" required />
        </div>
        <div className="field">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            required
            minLength={6}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "가입 중..." : "가입하고 회사 선택"}
        </button>
      </form>

      <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>
        이미 계정이 있나요? <Link href="/login">로그인</Link>
      </p>

      <div className="social-placeholder">
        <div className="social-btn">카카오 / 구글 / 네이버 가입 (준비중)</div>
      </div>
    </div>
  );
}
