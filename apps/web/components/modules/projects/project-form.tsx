"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@constructa/types";
import { CreateProjectSchema } from "@constructa/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ProjectFormProps {
  project?: Project;
  mode: "create" | "edit";
}

const DEPARTMENTS = [
  "Guatemala",
  "Sacatepéquez",
  "Escuintla",
  "Quetzaltenango",
  "Alta Verapaz",
  "Petén",
  "Izabal",
  "Chimaltenango",
  "Huehuetenango",
  "Santa Rosa",
  "Jalapa",
  "Jutiapa",
  "Zacapa",
  "Chiquimula",
  "El Progreso",
  "Baja Verapaz",
  "Sololá",
  "Totonicapán",
  "Quiché",
  "Retalhuleu",
  "San Marcos",
  "Suchitepéquez",
] as const;

export function ProjectForm({ project, mode }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [address, setAddress] = useState(project?.address ?? "");
  const [municipality, setMunicipality] = useState(project?.municipality ?? "");
  const [department, setDepartment] = useState(project?.department ?? "");
  const [status, setStatus] = useState(project?.status ?? "active");
  const [startDate, setStartDate] = useState(project?.start_date ?? "");
  const [plannedEndDate, setPlannedEndDate] = useState(
    project?.planned_end_date ?? "",
  );
  const [totalBudget, setTotalBudget] = useState(
    project?.total_budget?.toString() ?? "",
  );
  const [clientAdvance, setClientAdvance] = useState(
    project?.client_advance?.toString() ?? "",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      name,
      description: description || undefined,
      address: address || undefined,
      municipality: municipality || undefined,
      department: department || undefined,
      status: status as "active" | "paused" | "completed" | "cancelled",
      start_date: startDate || null,
      planned_end_date: plannedEndDate || null,
      total_budget: totalBudget ? Number(totalBudget) : null,
      client_advance: clientAdvance ? Number(clientAdvance) : null,
    };

    const parsed = CreateProjectSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading(true);

    const url =
      mode === "create" ? "/api/projects" : `/api/projects/${project?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data: { id?: string; error?: string } = await res.json();

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo guardar el proyecto",
      );
      setLoading(false);
      return;
    }

    router.push(`/projects/${data.id ?? project?.id}`);
    router.refresh();
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nombre del proyecto *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Dirección de la obra</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="municipality">Municipio</Label>
              <Input
                id="municipality"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as typeof status)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plannedEndDate">Fecha prevista de fin</Label>
              <Input
                id="plannedEndDate"
                type="date"
                value={plannedEndDate}
                onChange={(e) => setPlannedEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalBudget">Presupuesto total (GTQ)</Label>
              <Input
                id="totalBudget"
                type="number"
                min="0"
                step="0.01"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientAdvance">Anticipo del cliente (GTQ)</Label>
              <Input
                id="clientAdvance"
                type="number"
                min="0"
                step="0.01"
                value={clientAdvance}
                onChange={(e) => setClientAdvance(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading
              ? "Guardando…"
              : mode === "create"
                ? "Crear proyecto"
                : "Guardar cambios"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
