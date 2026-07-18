import { redirect } from "next/navigation";
import { MembershipRole, MembershipStatus } from "@/lib/constants";
import { getSession } from "@/lib/session";

export async function requireUser() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

export async function requireApprovedMembership() {
  const session = await requireUser();
  const membership = session.membership;

  if (!membership) {
    redirect("/onboarding/company");
  }
  if (membership.status === MembershipStatus.PENDING) {
    redirect("/pending");
  }
  if (membership.status !== MembershipStatus.APPROVED) {
    redirect("/onboarding/company");
  }

  return { session, membership };
}

export async function requireAdmin() {
  const { session, membership } = await requireApprovedMembership();
  if (membership.role !== MembershipRole.ADMIN) {
    redirect("/feed");
  }
  return { session, membership };
}
