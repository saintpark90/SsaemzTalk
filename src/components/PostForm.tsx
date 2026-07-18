"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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
    title: string;
    body: string;
    categoryId: string;
  };
};

export function PostForm({ categories, mode = "create", postId, initial }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<Uploaded[]>([]);
  const [uploading, setUploading] = useState(false);

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
    const payload = {
      title: String(form.get("title") ?? ""),
      body: String(form.get("body") ?? ""),
      categoryId: String(form.get("categoryId") ?? ""),
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

      <div className="field">
        <label htmlFor="categoryId">카테고리</label>
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

      <div className="field">
        <label htmlFor="title">제목</label>
        <input
          id="title"
          name="title"
          className="input"
          required
          defaultValue={initial?.title}
        />
      </div>

      <div className="field">
        <label htmlFor="body">내용</label>
        <textarea
          id="body"
          name="body"
          className="textarea"
          required
          defaultValue={initial?.body}
          placeholder="수업 계획, 아이디어, 수강생 반응 등을 자유롭게 적어주세요."
        />
      </div>

      {mode === "create" ? (
        <div className="field">
          <label htmlFor="files">사진 / 첨부파일</label>
          <input
            id="files"
            type="file"
            multiple
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
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.back()}
        >
          취소
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
          {loading ? "저장 중..." : mode === "edit" ? "수정 저장" : "게시하기"}
        </button>
      </div>
    </form>
  );
}
