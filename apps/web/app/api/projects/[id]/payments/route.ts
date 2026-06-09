import { NextResponse } from "next/server";
import { CreatePaymentSchema } from "@constructa/schemas";
import type { Payment } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: { id: string };
}

async function getProjectForOrg(projectId: string, organizationId: string) {
  const supabase = await createClient();
  return supabase
    .from("projects")
    .select("id, organization_id, client_advance")
    .eq("id", projectId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .single();
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: project, error: projectError } = await getProjectForOrg(
      params.id,
      auth.organization.id,
    );

    if (projectError || !project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .order("payment_date", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data as Payment[]);
  } catch (error) {
    console.error("[projects/[id]/payments/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: project, error: projectError } = await getProjectForOrg(
      params.id,
      auth.organization.id,
    );

    if (projectError || !project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body: unknown = await request.json();
    const parsed = CreatePaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payments")
      .insert({
        ...parsed.data,
        project_id: params.id,
        organization_id: auth.organization.id,
        created_by: auth.userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data as Payment, { status: 201 });
  } catch (error) {
    console.error("[projects/[id]/payments/POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
