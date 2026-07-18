import Link from "next/link";
import { Suspense } from "react";
import { FeedToolbar } from "@/components/FeedToolbar";
import { prisma } from "@/lib/prisma";
import { requireApprovedMembership } from "@/lib/tenant";

type Props = {
  searchParams: Promise<{ q?: string; categoryId?: string }>;
};

export default async function FeedPage({ searchParams }: Props) {
  const { membership } = await requireApprovedMembership();
  const { q = "", categoryId = "" } = await searchParams;

  const [categories, posts] = await Promise.all([
    prisma.category.findMany({
      where: { companyId: membership.companyId },
      orderBy: { name: "asc" },
    }),
    prisma.post.findMany({
      where: {
        companyId: membership.companyId,
        ...(categoryId ? { categoryId } : {}),
        ...(q
          ? {
              OR: [{ title: { contains: q } }, { body: { contains: q } }],
            }
          : {}),
      },
      include: {
        category: true,
        author: { select: { name: true } },
        attachments: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <>
      <header className="topbar">
        <div>
          <h1>피드</h1>
          <div className="topbar-meta">{membership.companyName}의 수업 공유</div>
        </div>
        <Link href="/posts/new" className="btn btn-primary">
          글 작성
        </Link>
      </header>

      <div className="content">
        <Suspense fallback={null}>
          <FeedToolbar categories={categories} />
        </Suspense>

        <div className="panel">
          {posts.length === 0 ? (
            <div className="empty">아직 공유된 글이 없습니다. 첫 글을 남겨보세요.</div>
          ) : (
            <ul className="list">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link href={`/posts/${post.id}`} className="list-item">
                    <div>
                      <h3>{post.title}</h3>
                      <p>
                        {post.body.length > 120
                          ? `${post.body.slice(0, 120)}…`
                          : post.body}
                      </p>
                      <div className="meta-row">
                        <span className="badge">{post.category.name}</span>
                        <span>{post.author.name}</span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                        {post.attachments.length > 0 ? (
                          <span>첨부 {post.attachments.length}</span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
