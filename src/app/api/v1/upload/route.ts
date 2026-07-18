import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getApiUser, getApprovedMembership } from "@/lib/auth-helpers";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getApprovedMembership(user.id);
  if (!membership) {
    return NextResponse.json({ error: "No approved membership" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || "";
  const safeName = `${randomUUID()}${ext}`;
  const relativePath = path.join("uploads", membership.companyId, safeName);
  const absolutePath = path.join(process.cwd(), "public", relativePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, bytes);

  return NextResponse.json({
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    storagePath: relativePath.replace(/\\/g, "/"),
    url: `/${relativePath.replace(/\\/g, "/")}`,
  });
}
