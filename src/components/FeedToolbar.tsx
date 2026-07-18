"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type Category = { id: string; name: string };

export function FeedToolbar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const categoryId = params.get("categoryId") ?? "";

  function apply(next: { q?: string; categoryId?: string }) {
    const sp = new URLSearchParams();
    const nextQ = next.q ?? q;
    const nextCategory = next.categoryId ?? categoryId;
    if (nextQ) sp.set("q", nextQ);
    if (nextCategory) sp.set("categoryId", nextCategory);
    router.push(`/feed?${sp.toString()}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    apply({ q });
  }

  return (
    <form className="toolbar" onSubmit={onSubmit}>
      <select
        className="select"
        style={{ maxWidth: 200 }}
        value={categoryId}
        onChange={(e) => apply({ categoryId: e.target.value })}
      >
        <option value="">전체 카테고리</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        className="input"
        style={{ maxWidth: 280 }}
        placeholder="제목·내용 검색"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button type="submit" className="btn btn-secondary">
        검색
      </button>
    </form>
  );
}
