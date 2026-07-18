"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { MembershipRole } from "@/lib/constants";

type Props = {
  userName: string;
  companyName?: string;
  role?: string;
};

export function Sidebar({ userName, companyName, role }: Props) {
  const pathname = usePathname();

  const links = [
    { href: "/feed", label: "수업 기록" },
    { href: "/posts/new", label: "기록 작성" },
    { href: "/materials", label: "교구재" },
    { href: "/schedules", label: "스케줄" },
    ...(role === MembershipRole.ADMIN
      ? [{ href: "/admin/members", label: "가입 승인" }]
      : []),
    { href: "/settings", label: "내 정보" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">S</div>
        <div>
          <strong>SsaemzTalk</strong>
          <span>{companyName ?? "회사 미연결"}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link${pathname.startsWith(link.href) ? " active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <strong>{userName}</strong>
          <span>{role === MembershipRole.ADMIN ? "담당자" : "선생님"}</span>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}
