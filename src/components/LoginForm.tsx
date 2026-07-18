"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    router.push("/feed");
    router.refresh();
  }

  return (
    <div className="auth-card">
      <h1>로그인</h1>
      <p className="lead">회사 선생님들과 수업 노하우를 나눠보세요.</p>

      <form className="form" onSubmit={onSubmit} style={{ padding: 0 }}>
        {error ? <div className="error">{error}</div> : null}
        <div className="field">
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            name="email"
            type="email"
            className="input"
            required
            placeholder="admin@ssaemz.com"
          />
        </div>
        <div className="field">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            required
            placeholder="password123"
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>
        계정이 없나요? <Link href="/signup">회원가입</Link>
      </p>

      <div className="social-placeholder">
        <div className="social-btn">카카오 로그인 (준비중)</div>
        <div className="social-btn">구글 로그인 (준비중)</div>
        <div className="social-btn">네이버 로그인 (준비중)</div>
      </div>
    </div>
  );
}
