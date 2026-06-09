import { NextResponse } from "next/server";
import type { PaymentBalance } from "@constructa/types";
import { getAuthContext } from "@/lib/auth/get-organization";
import { computePaymentBalance } from "@/lib/payments/balance";
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

    const supabase = await createClient();

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, total_budget, client_advance")
      .eq("id", params.id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("amount")
      .eq("project_id", params.id)
      .eq("organization_id", auth.organization.id)
      .is("deleted_at", null);

    if (paymentsError) throw paymentsError;

    const balance: PaymentBalance = computePaymentBalance(
      project.total_budget,
      project.client_advance,
      payments ?? [],
    );

    return NextResponse.json(balance);
  } catch (error) {
    console.error("[projects/[id]/payments/balance/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
