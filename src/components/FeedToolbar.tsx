"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type Category = { id: string; name: string };

export function FeedToolbar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [material, setMaterial] = useState(params.get("material") ?? "");
  const [issue, setIssue] = useState(params.get("issue") ?? "");
  const categoryId = params.get("categoryId") ?? "";

  function apply(next: {
    q?: string;
    material?: string;
    issue?: string;
    categoryId?: string;
  }) {
    const sp = new URLSearchParams();
    const nextQ = next.q ?? q;
    const nextMaterial = next.material ?? material;
    const nextIssue = next.issue ?? issue;
    const nextCategory = next.categoryId ?? categoryId;
    if (nextQ) sp.set("q", nextQ);
    if (nextMaterial) sp.set("material", nextMaterial);
    if (nextIssue) sp.set("issue", nextIssue);
    if (nextCategory) sp.set("categoryId", nextCategory);
    router.push(`/feed?${sp.toString()}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    apply({ q, material, issue });
  }

  return (
    <form className="toolbar" onSubmit={onSubmit}>
      <select
        className="select"
        style={{ maxWidth: 160 }}
        value={categoryId}
        onChange={(e) => apply({ categoryId: e.target.value })}
      >
        <option value="">전체 분류</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        className="input"
        style={{ maxWidth: 180 }}
        placeholder="교재/주제"
        value={material}
        onChange={(e) => setMaterial(e.target.value)}
      />
      <input
        className="input"
        style={{ maxWidth: 120 }}
        placeholder="호수"
        value={issue}
        onChange={(e) => setIssue(e.target.value)}
      />
      <input
        className="input"
        style={{ maxWidth: 200 }}
        placeholder="본문·작성자 검색"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button type="submit" className="btn btn-secondary">
        검색
      </button>
    </form>
  );
}
