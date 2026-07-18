import type { MembershipRole, MembershipStatus } from "@/lib/constants";
import "next-auth";
import "next-auth/jwt";

export type SessionMembership = {
  id: string;
  companyId: string;
  companyName: string;
  role: MembershipRole;
  status: MembershipStatus;
} | null;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
    };
    membership: SessionMembership;
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    membership: SessionMembership;
  }
}
