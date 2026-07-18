"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Membership = {
  id: string;
  status: string;
  role: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
};

export function MemberApprovalList({
  initialMemberships,
}: {
  initialMemberships: Membership[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialMemberships);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    setBusyId(id);
    setError("");
    const res = await fetch(`/api/v1/memberships/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setBusyId(null);

    if (!res.ok) {
      setError(data.error || "처리에 실패했습니다.");
      return;
    }

    setItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: data.membership.status } : m))
    );
    router.refresh();
  }

  return (
    <div>
      {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}
      <div className="panel">
        {items.length === 0 ? (
          <div className="empty">가입 신청이 없습니다.</div>
        ) : (
          items.map((m) => (
            <div key={m.id} className="member-row">
              <div>
                <strong>{m.user.name}</strong>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                  {m.user.email} ·{" "}
                  {new Date(m.createdAt).toLocaleString("ko-KR")}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span
                    className={`badge ${
                      m.status === "PENDING"
                        ? "badge-warn"
                        : m.status === "APPROVED"
                          ? ""
                          : "badge-muted"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
              </div>
              {m.status === "PENDING" ? (
                <div className="member-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={busyId === m.id}
                    onClick={() => updateStatus(m.id, "APPROVED")}
                  >
                    승인
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={busyId === m.id}
                    onClick={() => updateStatus(m.id, "REJECTED")}
                  >
                    거절
                  </button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
