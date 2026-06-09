import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">CONSTRUCTA</h1>
        <p className="mt-2 text-muted-foreground">
          Gestión integral de construcción para Guatemala
        </p>
      </div>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        Controla tus obras, pagos y materiales desde un solo lugar.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">Iniciar sesión</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/signup">Crear cuenta</Link>
        </Button>
      </div>
    </main>
  );
}
