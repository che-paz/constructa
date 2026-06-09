"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProjectFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? "all";
  const search = searchParams.get("search") ?? "";

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/projects?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input
        placeholder="Buscar por nombre…"
        value={search}
        onChange={(e) => updateParams("search", e.target.value)}
        className="sm:max-w-xs"
      />
      <Select value={status} onValueChange={(v) => updateParams("status", v)}>
        <SelectTrigger className="sm:w-44">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Activos</SelectItem>
          <SelectItem value="paused">Pausados</SelectItem>
          <SelectItem value="completed">Completados</SelectItem>
          <SelectItem value="cancelled">Cancelados</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
