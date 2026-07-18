"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Loan = {
  id: string;
  quantity: number;
  status: string;
  note: string;
  user: { id: string; name: string };
};

type Material = {
  id: string;
  name: string;
  description: string;
  photoPath: string | null;
  totalQty: number;
  availableQty: number;
  loans: Loan[];
};

export function MaterialsPanel({
  initialMaterials,
  isAdmin,
}: {
  initialMaterials: Material[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [materials, setMaterials] = useState(initialMaterials);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/v1/materials");
    const data = await res.json();
    if (res.ok) setMaterials(data.materials);
    router.refresh();
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy("create");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/v1/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        description: form.get("description"),
        totalQty: Number(form.get("totalQty") || 0),
      }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      setError(data.error || "등록 실패");
      return;
    }
    e.currentTarget.reset();
    await refresh();
  }

  async function onUploadPhoto(materialId: string, file: File | null) {
    if (!file) return;
    setBusy(materialId);
    const form = new FormData();
    form.append("file", file);
    const up = await fetch("/api/v1/upload", { method: "POST", body: form });
    const upData = await up.json();
    if (!up.ok) {
      setBusy(null);
      setError(upData.error || "업로드 실패");
      return;
    }
    const res = await fetch(`/api/v1/materials/${materialId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoPath: upData.storagePath }),
    });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "사진 저장 실패");
      return;
    }
    await refresh();
  }

  async function borrow(materialId: string) {
    setBusy(materialId);
    setError("");
    const res = await fetch(`/api/v1/materials/${materialId}/loans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: 1 }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      setError(data.error || "대여 실패");
      return;
    }
    await refresh();
  }

  async function returnLoan(loanId: string) {
    setBusy(loanId);
    setError("");
    const res = await fetch(`/api/v1/materials/loans/${loanId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "RETURNED" }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      setError(data.error || "반납 실패");
      return;
    }
    await refresh();
  }

  async function remove(materialId: string) {
    if (!confirm("이 교구재를 삭제할까요?")) return;
    setBusy(materialId);
    const res = await fetch(`/api/v1/materials/${materialId}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "삭제 실패");
      return;
    }
    await refresh();
  }

  return (
    <div>
      {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}

      <form className="panel form" onSubmit={onCreate} style={{ marginBottom: 16 }}>
        <strong>교구재 등록</strong>
        <div className="form-grid-2">
          <div className="field">
            <label htmlFor="name">이름</label>
            <input id="name" name="name" className="input" required />
          </div>
          <div className="field">
            <label htmlFor="totalQty">총 수량</label>
            <input
              id="totalQty"
              name="totalQty"
              type="number"
              min={0}
              className="input"
              required
              defaultValue={1}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="description">설명</label>
          <input id="description" name="description" className="input" />
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={busy === "create"}>
            등록
          </button>
        </div>
      </form>

      <div className="panel">
        {materials.length === 0 ? (
          <div className="empty">등록된 교구재가 없습니다.</div>
        ) : (
          materials.map((m) => (
            <div key={m.id} className="material-row">
              <div className="material-main">
                {m.photoPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/${m.photoPath}`}
                    alt={m.name}
                    className="material-thumb"
                  />
                ) : (
                  <div className="material-thumb placeholder">사진</div>
                )}
                <div>
                  <strong>{m.name}</strong>
                  <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                    {m.description || "설명 없음"}
                  </div>
                  <div className="meta-row">
                    <span className="badge">잔여 {m.availableQty}</span>
                    <span className="badge badge-muted">전체 {m.totalQty}</span>
                    <span className="badge badge-warn">
                      대여중 {m.totalQty - m.availableQty}
                    </span>
                  </div>
                  {m.loans.length > 0 ? (
                    <ul className="loan-list">
                      {m.loans.map((loan) => (
                        <li key={loan.id}>
                          {loan.user.name} · {loan.quantity}개
                          {loan.note ? ` · ${loan.note}` : ""}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ marginLeft: 8 }}
                            disabled={busy === loan.id}
                            onClick={() => returnLoan(loan.id)}
                          >
                            반납
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
              <div className="material-actions">
                <label className="btn btn-secondary btn-sm">
                  사진
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      onUploadPhoto(m.id, e.target.files?.[0] ?? null)
                    }
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={busy === m.id || m.availableQty < 1}
                  onClick={() => borrow(m.id)}
                >
                  대여
                </button>
                {isAdmin ? (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={busy === m.id}
                    onClick={() => remove(m.id)}
                  >
                    삭제
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
