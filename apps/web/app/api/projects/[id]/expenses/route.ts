import { NextResponse } from "next/server";
import { CreateExpenseSchema } from "@constructa/schemas";
import type { Expense } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { getProjectForOrg } from "@/lib/projects/get-project-for-org";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: { id: string };
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
      .from("expenses")
      .select("*")
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data as Expense[]);
  } catch (error) {
    console.error("[projects/[id]/expenses/GET]", error);
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
    const parsed = CreateExpenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        ...parsed.data,
        project_id: params.id,
        organization_id: auth.organization.id,
        created_by: auth.userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data as Expense, { status: 201 });
  } catch (error) {
    console.error("[projects/[id]/expenses/POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
