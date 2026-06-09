export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">CONSTRUCTA</h1>
        <p className="text-sm text-muted-foreground">
          Gestión de construcción para Guatemala
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
