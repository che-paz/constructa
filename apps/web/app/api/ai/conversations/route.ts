import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/get-organization";
import { listConversations } from "@/lib/ai/conversations";
import { hasAIAccess } from "@/lib/ai/quota";

export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasAIAccess(auth.organization.plan)) {
      return NextResponse.json(
        { error: "El plan Básico no incluye asistente IA." },
        { status: 403 },
      );
    }

    const conversations = await listConversations(
      auth.organization.id,
      auth.userId,
    );

    const summaries = conversations.map((c) => {
      const lastUser = [...c.messages]
        .reverse()
        .find((m) => m.role === "user");
      return {
        id: c.id,
        project_id: c.project_id,
        preview: lastUser?.content.slice(0, 80) ?? "Nueva conversación",
        message_count: c.messages.length,
        updated_at: c.updated_at,
      };
    });

    return NextResponse.json({ conversations: summaries });
  } catch (error) {
    console.error("[ai/conversations/GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
