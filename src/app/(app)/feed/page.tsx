import Link from "next/link";
import { Suspense } from "react";
import { FeedToolbar } from "@/components/FeedToolbar";
import { prisma } from "@/lib/prisma";
import { requireApprovedMembership } from "@/lib/tenant";

type Props = {
  searchParams: Promise<{
    q?: string;
    categoryId?: string;
    material?: string;
    issue?: string;
  }>;
};

export default async function FeedPage({ searchParams }: Props) {
  const { membership } = await requireApprovedMembership();
  const { q = "", categoryId = "", material = "", issue = "" } = await searchParams;

  const [categories, posts] = await Promise.all([
    prisma.category.findMany({
      where: { companyId: membership.companyId },
      orderBy: { name: "asc" },
    }),
    prisma.post.findMany({
      where: {
        companyId: membership.companyId,
        ...(categoryId ? { categoryId } : {}),
        ...(material ? { materialTitle: { contains: material } } : {}),
        ...(issue ? { issueNumber: { contains: issue } } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q } },
                { body: { contains: q } },
                { bodyHtml: { contains: q } },
                { materialTitle: { contains: q } },
                { issueNumber: { contains: q } },
                { sessionNumber: { contains: q } },
                { author: { name: { contains: q } } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        author: { select: { name: true } },
        attachments: true,
      },
      orderBy: [{ lessonDate: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
  ]);

  return (
    <>
      <header className="topbar">
        <div>
          <h1>수업 기록</h1>
          <div className="topbar-meta">
            {membership.companyName} 공유 기록장 — 교재·호수별로 모아보세요
          </div>
        </div>
        <Link href="/posts/new" className="btn btn-primary">
          기록 작성
        </Link>
      </header>

      <div className="content">
        <Suspense fallback={null}>
          <FeedToolbar categories={categories} />
        </Suspense>

        <div className="panel">
          {posts.length === 0 ? (
            <div className="empty">아직 기록이 없습니다. 첫 수업 기록을 남겨보세요.</div>
          ) : (
            <div className="lesson-table-wrap">
              <table className="lesson-table">
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th>교재/주제</th>
                    <th>호수</th>
                    <th>차시</th>
                    <th>분류</th>
                    <th>작성자</th>
                    <th>요약</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <Link href={`/posts/${post.id}`}>
                          {new Date(post.lessonDate).toLocaleDateString("ko-KR")}
                        </Link>
                      </td>
                      <td>
                        <Link href={`/posts/${post.id}`}>
                          <strong>{post.materialTitle || post.title}</strong>
                        </Link>
                      </td>
                      <td>{post.issueNumber || "-"}</td>
                      <td>{post.sessionNumber || "-"}</td>
                      <td>
                        <span className="badge">{post.category.name}</span>
                      </td>
                      <td>{post.author.name}</td>
                      <td className="lesson-summary">
                        {(post.body || "").slice(0, 60)}
                        {(post.body || "").length > 60 ? "…" : ""}
                        {post.attachments.length > 0
                          ? ` · 첨부 ${post.attachments.length}`
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
