import { notFound, redirect } from "next/navigation";
import { PostForm } from "@/components/PostForm";
import { MembershipRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireApprovedMembership } from "@/lib/tenant";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { session, membership } = await requireApprovedMembership();
  const { id } = await params;

  const [post, categories] = await Promise.all([
    prisma.post.findFirst({
      where: { id, companyId: membership.companyId },
    }),
    prisma.category.findMany({
      where: { companyId: membership.companyId },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!post) notFound();

  const canEdit =
    post.authorId === session.user.id || membership.role === MembershipRole.ADMIN;
  if (!canEdit) redirect(`/posts/${id}`);

  return (
    <>
      <header className="topbar">
        <div>
          <h1>기록 수정</h1>
          <div className="topbar-meta">{post.materialTitle || post.title}</div>
        </div>
      </header>
      <div className="content">
        <PostForm
          mode="edit"
          postId={post.id}
          categories={categories}
          initial={{
            title: post.title,
            bodyHtml: post.bodyHtml,
            body: post.body,
            categoryId: post.categoryId,
            materialTitle: post.materialTitle,
            issueNumber: post.issueNumber,
            sessionNumber: post.sessionNumber,
            lessonDate: post.lessonDate.toISOString(),
          }}
        />
      </div>
    </>
  );
}
