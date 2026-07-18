import { PostForm } from "@/components/PostForm";
import { prisma } from "@/lib/prisma";
import { requireApprovedMembership } from "@/lib/tenant";

export default async function NewPostPage() {
  const { membership } = await requireApprovedMembership();
  const categories = await prisma.category.findMany({
    where: { companyId: membership.companyId },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <header className="topbar">
        <div>
          <h1>글 작성</h1>
          <div className="topbar-meta">수업 계획·아이디어·반응을 공유하세요</div>
        </div>
      </header>
      <div className="content">
        <PostForm categories={categories} />
      </div>
    </>
  );
}
