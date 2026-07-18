import { Sidebar } from "@/components/Sidebar";
import { requireUser } from "@/lib/tenant";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();

  return (
    <div className="app-shell">
      <Sidebar
        userName={session.user.name}
        companyName={session.membership?.companyName}
        role={session.membership?.role}
      />
      <div className="main">{children}</div>
    </div>
  );
}
