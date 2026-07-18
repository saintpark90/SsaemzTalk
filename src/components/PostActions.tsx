"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PostActions({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm("이 글을 삭제할까요?")) return;
    setLoading(true);
    const res = await fetch(`/api/v1/posts/${postId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      alert("삭제에 실패했습니다.");
      return;
    }
    router.push("/feed");
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Link href={`/posts/${postId}/edit`} className="btn btn-secondary btn-sm">
        수정
      </Link>
      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={onDelete}
        disabled={loading}
      >
        삭제
      </button>
    </div>
  );
}
