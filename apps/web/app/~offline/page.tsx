export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">Sin conexión</h1>
      <p className="max-w-sm text-center text-muted-foreground">
        No hay internet disponible. Revisa tu conexión e intenta de nuevo.
      </p>
    </main>
  );
}
