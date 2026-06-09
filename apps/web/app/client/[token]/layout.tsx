export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-4">
          <p className="text-sm font-semibold">CONSTRUCTA — Portal del cliente</p>
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-4 md:p-6">{children}</main>
    </div>
  );
}
