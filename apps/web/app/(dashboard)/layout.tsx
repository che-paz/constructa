import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/get-organization";
import { getUser } from "@/lib/auth/get-user";
import { Sidebar } from "@/components/shared/sidebar";
import { Navbar } from "@/components/shared/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const auth = await getAuthContext();
  if (!auth) redirect("/onboarding");

  return (
    <div className="flex min-h-screen">
      <Sidebar organizationName={auth.organization.name} />
      <div className="flex flex-1 flex-col">
        <Navbar
          userEmail={user.email ?? ""}
          organizationName={auth.organization.name}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
