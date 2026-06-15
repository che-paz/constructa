import { redirect } from "next/navigation";
import type { MaterialCatalog } from "@constructa/types";
import { formatGtq } from "@constructa/utils";
import { getAuthContext } from "@/lib/auth/get-organization";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { CatalogForm } from "@/components/modules/materials/catalog-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function MaterialsCatalogPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/onboarding");

  const supabase = await createClient();
  const { data: catalog } = await supabase
    .from("material_catalog")
    .select("*")
    .eq("organization_id", auth.organization.id)
    .order("name", { ascending: true });

  const items = (catalog ?? []) as MaterialCatalog[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogo de materiales"
        description="Materiales de tu empresa — compartidos entre todos los proyectos"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar material</CardTitle>
          <CardDescription>
            Registra aquí los materiales que usarás en tus obras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CatalogForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Materiales registrados</CardTitle>
          <CardDescription>
            {items.length}{" "}
            {items.length === 1 ? "material" : "materiales"} en el catálogo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay materiales. Agrega el primero arriba.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Precio ref.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.category ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      {item.standard_price != null
                        ? formatGtq(Number(item.standard_price))
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
