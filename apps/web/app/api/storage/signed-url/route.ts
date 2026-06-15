import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/get-organization";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_BUCKETS = new Set([
  "payment-receipts",
  "material-invoices",
  "org-logos",
]);

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get("bucket");
    const path = searchParams.get("path");

    if (!bucket || !path || !ALLOWED_BUCKETS.has(bucket)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60);

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (error) {
    console.error("[storage/signed-url/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
