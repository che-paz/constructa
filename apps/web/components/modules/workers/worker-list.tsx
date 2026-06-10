"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Worker } from "@constructa/types";
import { formatGtq, workerSpecialtyLabel } from "@constructa/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WorkerListProps {
  workers: Worker[];
  selectedWorkerId: string | null;
  onSelectWorker: (id: string | null) => void;
}

export function WorkerList({
  workers,
  selectedWorkerId,
  onSelectWorker,
}: WorkerListProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editRate, setEditRate] = useState("");

  async function handleToggleActive(worker: Worker) {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/workers/${worker.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !worker.is_active }),
    });

    if (!res.ok) {
      setError("No se pudo actualizar el trabajador");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }

  async function handleSaveRate(workerId: string) {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/workers/${workerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        daily_rate: editRate ? Number(editRate) : null,
      }),
    });

    if (!res.ok) {
      setError("No se pudo actualizar el jornal");
      setLoading(false);
      return;
    }

    setEditingId(null);
    setLoading(false);
    router.refresh();
  }

  if (workers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay trabajadores registrados en tu organización.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-3 py-2 font-medium">Nombre</th>
              <th className="px-3 py-2 font-medium">Especialidad</th>
              <th className="px-3 py-2 font-medium">Jornal</th>
              <th className="px-3 py-2 font-medium">Estado</th>
              <th className="px-3 py-2 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((worker) => (
              <tr
                key={worker.id}
                className={`border-b last:border-0 ${
                  selectedWorkerId === worker.id ? "bg-muted/30" : ""
                }`}
              >
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="text-left font-medium hover:underline"
                    onClick={() =>
                      onSelectWorker(
                        selectedWorkerId === worker.id ? null : worker.id,
                      )
                    }
                  >
                    {worker.name}
                  </button>
                  {worker.phone && (
                    <p className="text-xs text-muted-foreground">
                      {worker.phone}
                    </p>
                  )}
                </td>
                <td className="px-3 py-2">
                  {workerSpecialtyLabel(worker.specialty)}
                </td>
                <td className="px-3 py-2">
                  {editingId === worker.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-8 w-24"
                        value={editRate}
                        onChange={(e) => setEditRate(e.target.value)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={loading}
                        onClick={() => handleSaveRate(worker.id)}
                      >
                        OK
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="hover:underline"
                      onClick={() => {
                        setEditingId(worker.id);
                        setEditRate(
                          worker.daily_rate != null
                            ? String(worker.daily_rate)
                            : "",
                        );
                      }}
                    >
                      {worker.daily_rate != null
                        ? formatGtq(Number(worker.daily_rate))
                        : "Sin definir"}
                    </button>
                  )}
                </td>
                <td className="px-3 py-2">
                  <Badge variant={worker.is_active ? "default" : "secondary"}>
                    {worker.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={loading}
                    onClick={() => handleToggleActive(worker)}
                  >
                    {worker.is_active ? "Desactivar" : "Activar"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Haz clic en un nombre para ver su historial de asistencia en esta obra.
      </p>
    </div>
  );
}
