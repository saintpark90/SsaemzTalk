"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { RichTextEditor } from "@/components/RichTextEditor";

type Category = { id: string; name: string };
type Uploaded = {
  fileName: string;
  mimeType: string;
  size: number;
  storagePath: string;
};

type Props = {
  categories: Category[];
  mode?: "create" | "edit";
  postId?: string;
  initial?: {
    title?: string;
    bodyHtml?: string;
    body?: string;
    categoryId: string;
    materialTitle?: string;
    issueNumber?: string;
    sessionNumber?: string;
    lessonDate?: string;
  };
};

function todayInputValue() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function PostForm({ categories, mode = "create", postId, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<Uploaded[]>([]);
  const [uploading, setUploading] = useState(false);
  const initialHtml = initial?.bodyHtml || initial?.body || "";
  const [bodyHtml, setBodyHtml] = useState(initialHtml);
  const defaultDate = useMemo(
    () => initial?.lessonDate?.slice(0, 10) || todayInputValue(),
    [initial?.lessonDate]
  );

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");

    try {
      const uploaded: Uploaded[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/v1/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "업로드 실패");
        uploaded.push({
          fileName: data.fileName,
          mimeType: data.mimeType,
          size: data.size,
          storagePath: data.storagePath,
        });
      }
      setAttachments((prev) => [...prev, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "업로드 실패");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const plain = bodyHtml.replace(/<[^>]*>/g, "").trim();
    if (!plain) {
      setLoading(false);
      setError("수업 내용을 입력해 주세요.");
      return;
    }

    const payload = {
      categoryId: String(form.get("categoryId") ?? ""),
      materialTitle: String(form.get("materialTitle") ?? ""),
      issueNumber: String(form.get("issueNumber") ?? ""),
      sessionNumber: String(form.get("sessionNumber") ?? ""),
      lessonDate: String(form.get("lessonDate") ?? ""),
      bodyHtml,
      ...(mode === "create" ? { attachments } : {}),
    };

    const res = await fetch(
      mode === "edit" ? `/api/v1/posts/${postId}` : "/api/v1/posts",
      {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "저장에 실패했습니다.");
      return;
    }

    router.push(`/posts/${data.post.id}`);
    router.refresh();
  }

  return (
    <form className="panel form" onSubmit={onSubmit}>
      {error ? <div className="error">{error}</div> : null}

      <div className="form-grid-2">
        <div className="field">
          <label htmlFor="lessonDate">수업 날짜</label>
          <input
            id="lessonDate"
            name="lessonDate"
            type="date"
            className="input"
            required
            defaultValue={defaultDate}
          />
        </div>
        <div className="field">
          <label htmlFor="categoryId">분류</label>
          <select
            id="categoryId"
            name="categoryId"
            className="select"
            required
            defaultValue={initial?.categoryId ?? ""}
          >
            <option value="" disabled>
              선택하세요
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="materialTitle">교재 / 주제</label>
        <input
          id="materialTitle"
          name="materialTitle"
          className="input"
          required
          placeholder="예: 신나는 과학탐구, 봄 동식물 관찰"
          defaultValue={initial?.materialTitle}
        />
      </div>

      <div className="form-grid-2">
        <div className="field">
          <label htmlFor="issueNumber">호수</label>
          <input
            id="issueNumber"
            name="issueNumber"
            className="input"
            placeholder="예: 3호"
            defaultValue={initial?.issueNumber}
          />
        </div>
        <div className="field">
          <label htmlFor="sessionNumber">차시</label>
          <input
            id="sessionNumber"
            name="sessionNumber"
            className="input"
            placeholder="예: 2차시"
            defaultValue={initial?.sessionNumber}
          />
        </div>
      </div>

      <div className="field">
        <label>수업 내용</label>
        <RichTextEditor value={bodyHtml} onChange={setBodyHtml} />
      </div>

      {mode === "create" ? (
        <div className="field">
          <label htmlFor="files">교구 / 수업 사진</label>
          <input
            id="files"
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"
            onChange={(e) => onUpload(e.target.files)}
          />
          {uploading ? <span className="muted">업로드 중...</span> : null}
          {attachments.length > 0 ? (
            <ul className="list" style={{ marginTop: 8 }}>
              {attachments.map((a) => (
                <li key={a.storagePath} className="muted" style={{ fontSize: 13 }}>
                  {a.fileName} ({Math.round(a.size / 1024)} KB)
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
          취소
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
          {loading ? "저장 중..." : mode === "edit" ? "수정 저장" : "기록 남기기"}
        </button>
      </div>
    </form>
  );
}
