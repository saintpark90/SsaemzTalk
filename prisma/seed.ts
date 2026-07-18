import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
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

  await prisma.post.create({
    data: {
      companyId: companyA.id,
      categoryId: categories[0].id,
      authorId: teacher.id,
      title: "초등 과학 실험 도입부 구성",
      body: "실험 전 호기심을 유발하는 질문 3개로 시작하면 참여율이 눈에 띄게 올랐습니다.\n\n1. 오늘 결과가 어떻게 될까?\n2. 왜 그렇게 생각하니?\n3. 비슷한 경험을 해본 적 있니?\n\n도입 5분을 아끼지 말고 쓰는 편이 전체 흐름에 도움이 됩니다.",
    },
  });

  await prisma.post.create({
    data: {
      companyId: companyA.id,
      categoryId: categories[2].id,
      authorId: admin.id,
      title: "주간 수업 후기 — 집중이 잘 된 날",
      body: "오늘 초등 3학년 수업에서 모둠 발표를 넣었더니 반응이 좋았습니다. 특히 서로 피드백을 짧게 주고받는 규칙을 정하니 소란이 줄었습니다.",
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
