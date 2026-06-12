import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/get-organization";
import { getUser } from "@/lib/auth/get-user";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import { Sidebar } from "@/components/shared/sidebar";
import { Navbar } from "@/components/shared/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext();
  if (!auth) {
    const user = await getUser();
    redirect(user ? "/onboarding" : "/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar organizationName={auth.organization.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          userEmail={auth.userEmail}
          organizationName={auth.organization.name}
        />
        <main className="flex-1 overflow-x-hidden p-3 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:p-6 md:pb-6">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
