"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Company = {
  id: string;
  name: string;
  businessNumber: string | null;
  planTier: string;
};

export function CompanySearch() {
  const router = useRouter();
  const { update } = useSession();
  const [q, setQ] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/v1/companies?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "회사 목록을 불러오지 못했습니다.");
        return;
      }
      setCompanies(data.companies);
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  async function apply(companyId: string) {
    setSubmitting(companyId);
    setError("");
    const res = await fetch("/api/v1/memberships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId }),
    });
    const data = await res.json();
    setSubmitting(null);

    if (!res.ok) {
      setError(data.error || "신청에 실패했습니다.");
      return;
    }

    await update();
    router.push("/pending");
    router.refresh();
  }

  return (
    <div>
      <div className="toolbar">
        <input
          className="input"
          style={{ maxWidth: 360 }}
          placeholder="회사명 검색 (예: 샘즈)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}

      <div className="panel">
        {loading ? (
          <div className="empty">검색 중...</div>
        ) : companies.length === 0 ? (
          <div className="empty">검색 결과가 없습니다.</div>
        ) : (
          <ul className="list">
            {companies.map((company) => (
              <li key={company.id} className="company-result">
                <div>
                  <strong>{company.name}</strong>
                  <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                    {company.businessNumber ?? "사업자번호 미등록"} · {company.planTier}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={submitting === company.id}
                  onClick={() => apply(company.id)}
                >
                  {submitting === company.id ? "신청 중..." : "가입 신청"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
