import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/get-organization";
import { requireOrgAdmin } from "@/lib/auth/require-permission";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 2 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const denied = requireOrgAdmin(auth);
    if (denied) return denied;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Tipo no permitido (JPG, PNG, WEBP)" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "El archivo no puede superar 2 MB" },
        { status: 400 },
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const storagePath = `${auth.organization.id}/logo.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = await createClient();

    const { error: uploadError } = await supabase.storage
      .from("org-logos")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from("organizations")
      .update({
        logo_url: storagePath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", auth.organization.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      logo_url: storagePath,
      organization: data,
    });
  } catch (error) {
    console.error("[organizations/logo/upload/POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
