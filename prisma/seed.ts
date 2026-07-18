import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.materialLoan.deleteMany();
  await prisma.material.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const companyA = await prisma.company.create({
    data: {
      name: "샘즈에듀",
      businessNumber: "123-45-67890",
      planTier: "SMALL",
    },
  });

  const companyB = await prisma.company.create({
    data: {
      name: "미래교육",
      businessNumber: "234-56-78901",
      planTier: "FREE",
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@ssaemz.com",
      name: "김관리",
      passwordHash,
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: "teacher@ssaemz.com",
      name: "이선생",
      passwordHash,
    },
  });

  await prisma.membership.create({
    data: {
      userId: admin.id,
      companyId: companyA.id,
      role: "ADMIN",
      status: "APPROVED",
    },
  });

  await prisma.membership.create({
    data: {
      userId: teacher.id,
      companyId: companyA.id,
      role: "TEACHER",
      status: "APPROVED",
    },
  });

  const categories = await Promise.all(
    [
      { name: "수업 계획", slug: "lesson-plan" },
      { name: "수업 아이디어", slug: "lesson-idea" },
      { name: "수강생 반응", slug: "student-feedback" },
      { name: "교구/자료", slug: "materials" },
    ].map((c) =>
      prisma.category.create({
        data: { ...c, companyId: companyA.id },
      })
    )
  );

  await prisma.category.createMany({
    data: [
      { name: "수업 계획", slug: "lesson-plan", companyId: companyB.id },
      { name: "수업 아이디어", slug: "lesson-idea", companyId: companyB.id },
    ],
  });

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  await prisma.post.create({
    data: {
      companyId: companyA.id,
      categoryId: categories[0].id,
      authorId: teacher.id,
      title: "초등 과학 실험 도입부",
      materialTitle: "신나는 과학탐구",
      issueNumber: "3호",
      sessionNumber: "2차시",
      lessonDate: yesterday,
      body: "실험 전 호기심을 유발하는 질문 3개로 시작하면 참여율이 올랐습니다.",
      bodyHtml:
        "<p>실험 전 호기심을 유발하는 질문 3개로 시작하면 참여율이 올랐습니다.</p><ol><li>오늘 결과가 어떻게 될까?</li><li>왜 그렇게 생각하니?</li><li>비슷한 경험을 해본 적 있니?</li></ol>",
    },
  });

  await prisma.post.create({
    data: {
      companyId: companyA.id,
      categoryId: categories[2].id,
      authorId: admin.id,
      title: "모둠 발표 후기",
      materialTitle: "신나는 과학탐구",
      issueNumber: "3호",
      sessionNumber: "3차시",
      lessonDate: today,
      body: "모둠 발표를 넣었더니 반응이 좋았습니다.",
      bodyHtml:
        "<p>오늘 초등 3학년 수업에서 <strong>모둠 발표</strong>를 넣었더니 반응이 좋았습니다.</p><p>서로 피드백을 짧게 주고받는 규칙을 정하니 소란이 줄었습니다.</p>",
    },
  });

  const material = await prisma.material.create({
    data: {
      companyId: companyA.id,
      name: "자석 실험 키트",
      description: "초등 과학용 자석·클립 세트",
      totalQty: 10,
      availableQty: 8,
    },
  });

  await prisma.materialLoan.create({
    data: {
      materialId: material.id,
      userId: teacher.id,
      quantity: 2,
      status: "BORROWED",
      note: "화요일 외근 수업용",
    },
  });

  const start = new Date();
  start.setHours(14, 0, 0, 0);
  const end = new Date(start);
  end.setHours(15, 0, 0, 0);

  await prisma.schedule.create({
    data: {
      companyId: companyA.id,
      teacherId: teacher.id,
      createdById: admin.id,
      title: "○○초 방과후 과학",
      location: "○○초등학교 과학실",
      startAt: start,
      endAt: end,
      isRecurringWeekly: true,
      createdByAdmin: true,
      payAmount: 50000,
      note: "주 1회",
    },
  });

  console.log("Seed complete.");
  console.log("Admin: admin@ssaemz.com / password123");
  console.log("Teacher: teacher@ssaemz.com / password123");
  console.log(`Companies: ${companyA.name}, ${companyB.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
