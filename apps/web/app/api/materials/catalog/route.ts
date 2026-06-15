import { NextResponse } from "next/server";
import { CreateMaterialCatalogSchema } from "@constructa/schemas";
import type { MaterialCatalog } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { requireWrite } from "@/lib/auth/require-permission";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("material_catalog")
      .select("*")
      .eq("organization_id", auth.organization.id)
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data as MaterialCatalog[]);
  } catch (error) {
    console.error("[materials/catalog/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const denied = requireWrite(auth);
    if (denied) return denied;

    const body: unknown = await request.json();
    const parsed = CreateMaterialCatalogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("material_catalog")
      .insert({
        ...parsed.data,
        organization_id: auth.organization.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data as MaterialCatalog, { status: 201 });
  } catch (error) {
    console.error("[materials/catalog/POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
