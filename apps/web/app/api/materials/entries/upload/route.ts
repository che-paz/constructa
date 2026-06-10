import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/get-organization";
import { getProjectForOrg } from "@/lib/projects/get-project-for-org";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const projectId = formData.get("project_id");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    if (typeof projectId !== "string" || !projectId) {
      return NextResponse.json(
        { error: "project_id requerido" },
        { status: 400 },
      );
    }

    const { data: project, error: projectError } = await getProjectForOrg(
      projectId,
      auth.organization.id,
    );

    if (projectError || !project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido (JPG, PNG, WEBP, PDF)" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "El archivo no puede superar 5 MB" },
        { status: 400 },
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const fileId = crypto.randomUUID();
    const storagePath = `${auth.organization.id}/${projectId}/${fileId}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = await createClient();

    const { error: uploadError } = await supabase.storage
      .from("material-invoices")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    return NextResponse.json({
      invoice_url: storagePath,
      storage_path: storagePath,
    });
  } catch (error) {
    console.error("[materials/entries/upload/POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
