import { NextResponse } from "next/server";
import { CreateStageSchema } from "@constructa/schemas";
import type { Stage } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { enrichStageWithDelay } from "@/lib/schedule/delay";
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
      .from("stages")
      .select("*")
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id)
      .order("order_index", { ascending: true });

    if (error) throw error;

    const stages = (data ?? []).map((s) =>
      enrichStageWithDelay(s as Stage),
    );

    return NextResponse.json(stages);
  } catch (error) {
    console.error("[projects/[id]/stages/GET]", error);
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
    const parsed = CreateStageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    let orderIndex = parsed.data.order_index;
    if (orderIndex === undefined) {
      const { count } = await supabase
        .from("stages")
        .select("*", { count: "exact", head: true })
        .eq("project_id", params.id);
      orderIndex = count ?? 0;
    }

    const { data, error } = await supabase
      .from("stages")
      .insert({
        ...parsed.data,
        order_index: orderIndex,
        project_id: params.id,
        organization_id: auth.organization.id,
        created_by: auth.userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      enrichStageWithDelay(data as Stage),
      { status: 201 },
    );
  } catch (error) {
    console.error("[projects/[id]/stages/POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
