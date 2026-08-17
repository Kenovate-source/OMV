import { DashboardShell } from "@/components/account/DashboardShell";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
