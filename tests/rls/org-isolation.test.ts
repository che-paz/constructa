import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, beforeAll, afterAll } from "vitest";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasEnv = Boolean(SUPABASE_URL && ANON_KEY && SERVICE_ROLE_KEY);

function adminClient() {
  return createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function anonClient(accessToken?: string) {
  return createClient(SUPABASE_URL!, ANON_KEY!, {
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const rlsSuite = hasEnv ? describe : describe.skip;

rlsSuite("RLS org isolation", () => {
  let admin: ReturnType<typeof adminClient>;
  const suffix = Date.now();
  const password = "TestPass123!";

  let userAId = "";
  let userBId = "";
  let orgAId = "";
  let orgBId = "";
  let projectAId = "";
  let projectBId = "";
  let paymentAId = "";
  let paymentBId = "";
  let tokenA = "";

  beforeAll(async () => {
    admin = adminClient();
    const emailA = `rls-a-${suffix}@constructa.test`;
    const emailB = `rls-b-${suffix}@constructa.test`;

    const { data: userA, error: userAError } = await admin.auth.admin.createUser(
      {
        email: emailA,
        password,
        email_confirm: true,
      },
    );
    if (userAError || !userA.user) {
      throw userAError ?? new Error("Failed to create user A");
    }
    userAId = userA.user.id;

    const { data: userB, error: userBError } = await admin.auth.admin.createUser(
      {
        email: emailB,
        password,
        email_confirm: true,
      },
    );
    if (userBError || !userB.user) {
      throw userBError ?? new Error("Failed to create user B");
    }
    userBId = userB.user.id;

    const { data: orgA, error: orgAError } = await admin
      .from("organizations")
      .insert({
        name: `Org A ${suffix}`,
        slug: `org-a-${suffix}`,
      })
      .select("id")
      .single();
    if (orgAError || !orgA) throw orgAError;
    orgAId = orgA.id;

    const { data: orgB, error: orgBError } = await admin
      .from("organizations")
      .insert({
        name: `Org B ${suffix}`,
        slug: `org-b-${suffix}`,
      })
      .select("id")
      .single();
    if (orgBError || !orgB) throw orgBError;
    orgBId = orgB.id;

    await admin.from("user_organizations").insert([
      {
        user_id: userAId,
        organization_id: orgAId,
        role: "constructor",
      },
      {
        user_id: userBId,
        organization_id: orgBId,
        role: "constructor",
      },
    ]);

    tokenA = `token-a-${suffix}`;

    const { data: projectA, error: projectAError } = await admin
      .from("projects")
      .insert({
        organization_id: orgAId,
        name: `Project A ${suffix}`,
        created_by: userAId,
        client_token: tokenA,
        client_advance: 10000,
      })
      .select("id")
      .single();
    if (projectAError || !projectA) throw projectAError;
    projectAId = projectA.id;

    const { data: projectB, error: projectBError } = await admin
      .from("projects")
      .insert({
        organization_id: orgBId,
        name: `Project B ${suffix}`,
        created_by: userBId,
        client_token: `token-b-${suffix}`,
        client_advance: 20000,
      })
      .select("id")
      .single();
    if (projectBError || !projectB) throw projectBError;
    projectBId = projectB.id;

    const { data: paymentA, error: paymentAError } = await admin
      .from("payments")
      .insert({
        organization_id: orgAId,
        project_id: projectAId,
        amount: 1500,
        payment_date: "2025-06-01",
        payment_method: "transferencia",
        created_by: userAId,
      })
      .select("id")
      .single();
    if (paymentAError || !paymentA) throw paymentAError;
    paymentAId = paymentA.id;

    const { data: paymentB, error: paymentBError } = await admin
      .from("payments")
      .insert({
        organization_id: orgBId,
        project_id: projectBId,
        amount: 2500,
        payment_date: "2025-06-01",
        payment_method: "efectivo",
        created_by: userBId,
      })
      .select("id")
      .single();
    if (paymentBError || !paymentB) throw paymentBError;
    paymentBId = paymentB.id;
  });

  afterAll(async () => {
    if (!hasEnv || !admin) return;

    await admin.from("payments").delete().in("id", [paymentAId, paymentBId]);
    await admin.from("projects").delete().in("id", [projectAId, projectBId]);
    await admin
      .from("user_organizations")
      .delete()
      .in("user_id", [userAId, userBId]);
    await admin.from("organizations").delete().in("id", [orgAId, orgBId]);
    if (userAId) await admin.auth.admin.deleteUser(userAId);
    if (userBId) await admin.auth.admin.deleteUser(userBId);
  });

  async function signIn(email: string) {
    const { data, error } = await anonClient().auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session) {
      throw error ?? new Error(`Sign in failed for ${email}`);
    }
    return data.session.access_token;
  }

  it("user A sees only org A projects", async () => {
    const token = await signIn(`rls-a-${suffix}@constructa.test`);
    const client = anonClient(token);

    const { data, error } = await client
      .from("projects")
      .select("id, organization_id")
      .is("deleted_at", null);

    expect(error).toBeNull();
    expect(data?.every((p) => p.organization_id === orgAId)).toBe(true);
    expect(data?.some((p) => p.id === projectBId)).toBe(false);
  });

  it("user B cannot read org A project by id", async () => {
    const token = await signIn(`rls-b-${suffix}@constructa.test`);
    const client = anonClient(token);

    const { data } = await client
      .from("projects")
      .select("id")
      .eq("id", projectAId)
      .maybeSingle();

    expect(data).toBeNull();
  });

  it("user A sees only org A payments", async () => {
    const token = await signIn(`rls-a-${suffix}@constructa.test`);
    const client = anonClient(token);

    const { data, error } = await client
      .from("payments")
      .select("id, organization_id, project_id")
      .is("deleted_at", null);

    expect(error).toBeNull();
    expect(data?.every((p) => p.organization_id === orgAId)).toBe(true);
    expect(data?.some((p) => p.id === paymentBId)).toBe(false);
  });

  it("user B cannot read org A payment by id", async () => {
    const token = await signIn(`rls-b-${suffix}@constructa.test`);
    const client = anonClient(token);

    const { data } = await client
      .from("payments")
      .select("id")
      .eq("id", paymentAId)
      .maybeSingle();

    expect(data).toBeNull();
  });

  it("user B cannot insert payment into org A project", async () => {
    const token = await signIn(`rls-b-${suffix}@constructa.test`);
    const client = anonClient(token);

    const { data, error } = await client.from("payments").insert({
      organization_id: orgAId,
      project_id: projectAId,
      amount: 999,
      payment_date: "2025-06-02",
      payment_method: "efectivo",
      created_by: userBId,
    });

    expect(data).toBeNull();
    expect(error).not.toBeNull();
  });
});

describe("calculatePaymentBalance (unit)", () => {
  it("computes obra pending balance from total budget minus payments", async () => {
    const { calculatePaymentBalance } = await import("@constructa/utils");

    const result = calculatePaymentBalance(
      168000,
      26000,
      [{ amount: 26000 }],
    );

    expect(result).toEqual({
      total_budget: 168000,
      client_advance: 26000,
      total_paid: 26000,
      pending_balance: 142000,
      payments_count: 1,
    });
  });

  it("falls back to advance when total budget is not set", async () => {
    const { calculatePaymentBalance } = await import("@constructa/utils");

    const result = calculatePaymentBalance(null, 10000, [
      { amount: 3000 },
      { amount: 2000 },
    ]);

    expect(result.pending_balance).toBe(5000);
  });
});
