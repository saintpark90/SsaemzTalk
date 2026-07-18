export const PlanTier = {
  FREE: "FREE",
  SMALL: "SMALL",
  MEDIUM: "MEDIUM",
  LARGE: "LARGE",
} as const;

export const SubscriptionStatus = {
  TRIAL: "TRIAL",
  ACTIVE: "ACTIVE",
  PAST_DUE: "PAST_DUE",
  CANCELED: "CANCELED",
} as const;

export const MembershipRole = {
  TEACHER: "TEACHER",
  ADMIN: "ADMIN",
} as const;

export const MembershipStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type MembershipRole = (typeof MembershipRole)[keyof typeof MembershipRole];
export type MembershipStatus = (typeof MembershipStatus)[keyof typeof MembershipStatus];
