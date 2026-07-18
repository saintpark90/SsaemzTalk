import Link from "next/link";
import { notFound } from "next/navigation";
import { PostActions } from "@/components/PostActions";
import { MembershipRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireApprovedMembership } from "@/lib/tenant";

type Props = { params: Promise<{ id: string }> };

export default async function PostDetailPage({ params }: Props) {
  const { session, membership } = await requireApprovedMembership();
  const { id } = await params;

  const post = await prisma.post.findFirst({
    where: { id, companyId: membership.companyId },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
      attachments: true,
    },
  });

  if (!post) notFound();

  const canEdit =
    post.authorId === session.user.id || membership.role === MembershipRole.ADMIN;

  return (
    <>
      <header className="topbar">
        <div>
          <h1>게시글</h1>
          <div className="topbar-meta">
            <Link href="/feed">← 피드로</Link>
          </div>
        </div>
        {canEdit ? <PostActions postId={post.id} /> : null}
      </header>

      <div className="content">
        <article className="panel post-detail">
          <span className="badge">{post.category.name}</span>
          <h1 style={{ marginTop: 12 }}>{post.title}</h1>
          <div className="meta-row">
            <span>{post.author.name}</span>
            <span>{new Date(post.createdAt).toLocaleString("ko-KR")}</span>
          </div>
          <div className="post-body">{post.body}</div>

          {post.attachments.length > 0 ? (
            <div className="attachments">
              <strong>첨부파일</strong>
              {post.attachments.map((file) => (
                <a
                  key={file.id}
                  className="attachment-link"
                  href={`/${file.storagePath}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {file.mimeType.startsWith("image/") ? "이미지" : "파일"} ·{" "}
                  {file.fileName}
                </a>
              ))}
              <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
                {post.attachments
                  .filter((f) => f.mimeType.startsWith("image/"))
                  .map((file) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={file.id}
                      src={`/${file.storagePath}`}
                      alt={file.fileName}
                      style={{
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        maxHeight: 420,
                        objectFit: "contain",
                        background: "#fafcfb",
                      }}
                    />
                  ))}
              </div>
            </div>
          ) : null}
        </article>
      </div>
    </>
  );
}
