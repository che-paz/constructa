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
  let stageAId = "";
  let stageBId = "";
  let catalogAId = "";
  let catalogBId = "";
  let entryAId = "";
  let entryBId = "";
  let workerAId = "";
  let workerBId = "";
  let attendanceAId = "";
  let attendanceBId = "";
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

    const { data: stageA, error: stageAError } = await admin
      .from("stages")
      .insert({
        organization_id: orgAId,
        project_id: projectAId,
        name: `Stage A ${suffix}`,
        order_index: 0,
        created_by: userAId,
      })
      .select("id")
      .single();
    if (stageAError || !stageA) throw stageAError;
    stageAId = stageA.id;

    const { data: stageB, error: stageBError } = await admin
      .from("stages")
      .insert({
        organization_id: orgBId,
        project_id: projectBId,
        name: `Stage B ${suffix}`,
        order_index: 0,
        created_by: userBId,
      })
      .select("id")
      .single();
    if (stageBError || !stageB) throw stageBError;
    stageBId = stageB.id;

    const { data: catalogA, error: catalogAError } = await admin
      .from("material_catalog")
      .insert({
        organization_id: orgAId,
        name: `Cemento A ${suffix}`,
        unit: "bolsas",
      })
      .select("id")
      .single();
    if (catalogAError || !catalogA) throw catalogAError;
    catalogAId = catalogA.id;

    const { data: catalogB, error: catalogBError } = await admin
      .from("material_catalog")
      .insert({
        organization_id: orgBId,
        name: `Cemento B ${suffix}`,
        unit: "bolsas",
      })
      .select("id")
      .single();
    if (catalogBError || !catalogB) throw catalogBError;
    catalogBId = catalogB.id;

    const { data: entryA, error: entryAError } = await admin
      .from("material_entries")
      .insert({
        organization_id: orgAId,
        project_id: projectAId,
        material_id: catalogAId,
        entry_type: "purchase",
        quantity: 10,
        created_by: userAId,
      })
      .select("id")
      .single();
    if (entryAError || !entryA) throw entryAError;
    entryAId = entryA.id;

    const { data: entryB, error: entryBError } = await admin
      .from("material_entries")
      .insert({
        organization_id: orgBId,
        project_id: projectBId,
        material_id: catalogBId,
        entry_type: "purchase",
        quantity: 20,
        created_by: userBId,
      })
      .select("id")
      .single();
    if (entryBError || !entryB) throw entryBError;
    entryBId = entryB.id;

    const { data: workerA, error: workerAError } = await admin
      .from("workers")
      .insert({
        organization_id: orgAId,
        name: `Worker A ${suffix}`,
        specialty: "albanil",
        daily_rate: 150,
        created_by: userAId,
      })
      .select("id")
      .single();
    if (workerAError || !workerA) throw workerAError;
    workerAId = workerA.id;

    const { data: workerB, error: workerBError } = await admin
      .from("workers")
      .insert({
        organization_id: orgBId,
        name: `Worker B ${suffix}`,
        specialty: "peon",
        daily_rate: 120,
        created_by: userBId,
      })
      .select("id")
      .single();
    if (workerBError || !workerB) throw workerBError;
    workerBId = workerB.id;

    const { data: attendanceA, error: attendanceAError } = await admin
      .from("worker_attendance")
      .insert({
        organization_id: orgAId,
        project_id: projectAId,
        worker_id: workerAId,
        work_date: "2025-06-03",
        hours_worked: 8,
        attendance_type: "full",
        amount_paid: 150,
        created_by: userAId,
      })
      .select("id")
      .single();
    if (attendanceAError || !attendanceA) throw attendanceAError;
    attendanceAId = attendanceA.id;

    const { data: attendanceB, error: attendanceBError } = await admin
      .from("worker_attendance")
      .insert({
        organization_id: orgBId,
        project_id: projectBId,
        worker_id: workerBId,
        work_date: "2025-06-03",
        hours_worked: 8,
        attendance_type: "full",
        amount_paid: 120,
        created_by: userBId,
      })
      .select("id")
      .single();
    if (attendanceBError || !attendanceB) throw attendanceBError;
    attendanceBId = attendanceB.id;
  });

  afterAll(async () => {
    if (!hasEnv || !admin) return;

    await admin
      .from("worker_attendance")
      .delete()
      .in("id", [attendanceAId, attendanceBId]);
    await admin.from("workers").delete().in("id", [workerAId, workerBId]);
    await admin.from("material_entries").delete().in("id", [entryAId, entryBId]);
    await admin.from("material_catalog").delete().in("id", [catalogAId, catalogBId]);
    await admin.from("stages").delete().in("id", [stageAId, stageBId]);
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

  it("user A sees only org A material catalog", async () => {
    const token = await signIn(`rls-a-${suffix}@constructa.test`);
    const client = anonClient(token);

    const { data, error } = await client
      .from("material_catalog")
      .select("id, organization_id");

    expect(error).toBeNull();
    expect(data?.every((m) => m.organization_id === orgAId)).toBe(true);
    expect(data?.some((m) => m.id === catalogBId)).toBe(false);
  });

  it("user B cannot read org A material catalog by id", async () => {
    const token = await signIn(`rls-b-${suffix}@constructa.test`);
    const client = anonClient(token);

    const { data } = await client
      .from("material_catalog")
      .select("id")
      .eq("id", catalogAId)
      .maybeSingle();

    expect(data).toBeNull();
  });

  it("user A sees only org A material entries", async () => {
    const token = await signIn(`rls-a-${suffix}@constructa.test`);
    const client = anonClient(token);

    const { data, error } = await client
      .from("material_entries")
      .select("id, organization_id")
      .is("deleted_at", null);

    expect(error).toBeNull();
    expect(data?.every((e) => e.organization_id === orgAId)).toBe(true);
    expect(data?.some((e) => e.id === entryBId)).toBe(false);
  });

  it("user B cannot read org A material entry by id", async () => {
    const token = await signIn(`rls-b-${suffix}@constructa.test`);
    const client = anonClient(token);

    const { data } = await client
      .from("material_entries")
      .select("id")
      .eq("id", entryAId)
      .maybeSingle();

    expect(data).toBeNull();
  });

  it("user B cannot insert material entry into org A project", async () => {
    const token = await signIn(`rls-b-${suffix}@constructa.test`);
    const client = anonClient(token);

    const { data, error } = await client.from("material_entries").insert({
      organization_id: orgAId,
      project_id: projectAId,
      material_id: catalogAId,
      entry_type: "consumption",
      quantity: 5,
      created_by: userBId,
    });

    expect(data).toBeNull();
    expect(error).not.toBeNull();
  });

  it("user A sees only org A workers", async () => {
    const token = await signIn(`rls-a-${suffix}@constructa.test`);
    const client = anonClient(token);

    const { data, error } = await client
      .from("workers")
      .select("id, organization_id")
      .is("deleted_at", null);

    expect(error).toBeNull();
    expect(data?.every((w) => w.organization_id === orgAId)).toBe(true);
    expect(data?.some((w) => w.id === workerBId)).toBe(false);
  });

  it("user B cannot read org A worker by id", async () => {
    const token = await signIn(`rls-b-${suffix}@constructa.test`);
    const client = anonClient(token);

    const { data } = await client
      .from("workers")
      .select("id")
      .eq("id", workerAId)
      .maybeSingle();

    expect(data).toBeNull();
  });

  it("user A sees only org A worker attendance", async () => {
    const token = await signIn(`rls-a-${suffix}@constructa.test`);
    const client = anonClient(token);

    const { data, error } = await client
      .from("worker_attendance")
      .select("id, organization_id");

    expect(error).toBeNull();
    expect(data?.every((a) => a.organization_id === orgAId)).toBe(true);
    expect(data?.some((a) => a.id === attendanceBId)).toBe(false);
  });

  it("user B cannot read org A attendance by id", async () => {
    const token = await signIn(`rls-b-${suffix}@constructa.test`);
    const client = anonClient(token);

    const { data } = await client
      .from("worker_attendance")
      .select("id")
      .eq("id", attendanceAId)
      .maybeSingle();

    expect(data).toBeNull();
  });

  it("user B cannot insert attendance into org A project", async () => {
    const token = await signIn(`rls-b-${suffix}@constructa.test`);
    const client = anonClient(token);

    const { data, error } = await client.from("worker_attendance").insert({
      organization_id: orgAId,
      project_id: projectAId,
      worker_id: workerAId,
      work_date: "2025-06-04",
      hours_worked: 8,
      attendance_type: "full",
      amount_paid: 150,
      created_by: userBId,
    });

    expect(data).toBeNull();
    expect(error).not.toBeNull();
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

describe("schedule and materials utils (unit)", () => {
  it("calculates stage delay days from planned end", async () => {
    const { calculateStageDelayDays } = await import("@constructa/utils");

    const delay = calculateStageDelayDays(
      "2025-06-01",
      null,
      "in_progress",
      "2025-06-10",
    );

    expect(delay).toBe(9);
  });

  it("returns zero delay when completed on time", async () => {
    const { calculateStageDelayDays } = await import("@constructa/utils");

    const delay = calculateStageDelayDays(
      "2025-06-10",
      "2025-06-08",
      "completed",
    );

    expect(delay).toBe(0);
  });

  it("calculates material deviation percentage", async () => {
    const { calculateMaterialDeviation } = await import("@constructa/utils");

    expect(calculateMaterialDeviation(100, 120)).toBe(20);
    expect(calculateMaterialDeviation(0, 10)).toBe(100);
    expect(calculateMaterialDeviation(50, 40)).toBe(-20);
  });
});

describe("attendance and payroll utils (unit)", () => {
  it("calculates hours from check-in and check-out", async () => {
    const { calculateHoursWorked } = await import("@constructa/utils");

    const hours = calculateHoursWorked(
      "2025-06-10T07:00:00.000Z",
      "2025-06-10T16:00:00.000Z",
      "full",
    );

    expect(hours).toBe(9);
  });

  it("returns zero hours for absent attendance", async () => {
    const { calculateHoursWorked } = await import("@constructa/utils");

    expect(calculateHoursWorked(null, null, "absent")).toBe(0);
  });

  it("calculates attendance amount by type", async () => {
    const { calculateAttendanceAmount } = await import("@constructa/utils");

    expect(calculateAttendanceAmount(200, "full")).toBe(200);
    expect(calculateAttendanceAmount(200, "half")).toBe(100);
    expect(calculateAttendanceAmount(200, "absent")).toBe(0);
    expect(calculateAttendanceAmount(200, "overtime")).toBe(300);
  });

  it("calculates overtime with extra hours beyond 8", async () => {
    const { calculateAttendanceAmount } = await import("@constructa/utils");

    const amount = calculateAttendanceAmount(160, "overtime", 10);
    expect(amount).toBe(220);
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
