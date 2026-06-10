"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateMaterialCatalogSchema } from "@constructa/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COMMON_MATERIALS = [
  { name: "Cemento", unit: "bolsas", category: "cemento" },
  { name: 'Hierro 3/8"', unit: "quintales", category: "hierro" },
  { name: 'Hierro 1/2"', unit: "quintales", category: "hierro" },
  { name: "Arena", unit: "camionadas", category: "arena" },
  { name: "Piedrín", unit: "camionadas", category: "arena" },
  { name: "Block", unit: "unidades", category: "block" },
];

interface CatalogFormProps {
  onCreated?: () => void;
}

export function CatalogForm({ onCreated }: CatalogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("bolsas");
  const [category, setCategory] = useState("");
  const [standardPrice, setStandardPrice] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      name,
      unit,
      category: category || null,
      standard_price: standardPrice ? Number(standardPrice) : null,
    };

    const parsed = CreateMaterialCatalogSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/materials/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data: { error?: string } = await res.json();

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "No se pudo agregar al catálogo",
      );
      setLoading(false);
      return;
    }

    setName("");
    setCategory("");
    setStandardPrice("");
    setLoading(false);
    onCreated?.();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {COMMON_MATERIALS.map((m) => (
          <Button
            key={m.name}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setName(m.name);
              setUnit(m.unit);
              setCategory(m.category);
            }}
          >
            {m.name}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="materialName">Nombre *</Label>
          <Input
            id="materialName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="materialUnit">Unidad *</Label>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger id="materialUnit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bolsas">Bolsas</SelectItem>
              <SelectItem value="quintales">Quintales</SelectItem>
              <SelectItem value="metros">Metros</SelectItem>
              <SelectItem value="unidades">Unidades</SelectItem>
              <SelectItem value="litros">Litros</SelectItem>
              <SelectItem value="camionadas">Camionadas</SelectItem>
              <SelectItem value="millares">Millares</SelectItem>
              <SelectItem value="pies_tablares">Pies tablares</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="materialCategory">Categoría</Label>
          <Input
            id="materialCategory"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="standardPrice">Precio referencia (GTQ)</Label>
          <Input
            id="standardPrice"
            type="number"
            min="0"
            step="0.01"
            value={standardPrice}
            onChange={(e) => setStandardPrice(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Guardando…" : "Agregar al catálogo"}
      </Button>
    </form>
  );
}
