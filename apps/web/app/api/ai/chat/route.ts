import { NextResponse } from "next/server";
import { AIChatRequestSchema } from "@constructa/schemas";
import { getAuthContext } from "@/lib/auth/get-organization";
import { AI_MAX_TOKENS, AI_MODEL, getAnthropicClient } from "@/lib/ai/anthropic";
import { buildOrganizationContext } from "@/lib/ai/context";
import {
  appendMessages,
  buildAnthropicMessages,
  createConversation,
  getConversation,
} from "@/lib/ai/conversations";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { mapAIErrorToMessage } from "@/lib/ai/error-messages";
import { checkAIQuota, logAIUsage } from "@/lib/ai/quota";

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quota = await checkAIQuota(
      auth.organization.id,
      auth.organization.plan,
      "assistant",
    );
    if (!quota.allowed) {
      return NextResponse.json({ error: quota.reason }, { status: 429 });
    }

    const body = await request.json();
    const parsed = AIChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { message, conversation_id, project_id } = parsed.data;

    let conversation =
      conversation_id
        ? await getConversation(
            conversation_id,
            auth.organization.id,
            auth.userId,
          )
        : null;

    if (conversation_id && !conversation) {
      return NextResponse.json(
        { error: "Conversación no encontrada" },
        { status: 404 },
      );
    }

    if (!conversation) {
      conversation = await createConversation({
        organizationId: auth.organization.id,
        userId: auth.userId,
        projectId: project_id,
      });
    }

    const context = await buildOrganizationContext(
      auth.organization.id,
      auth.organization.name,
      auth.organization.plan,
      project_id ?? conversation.project_id,
    );

    const systemPrompt = buildSystemPrompt(context);
    const anthropicMessages = buildAnthropicMessages(
      conversation.messages,
      message,
    );

    const client = getAnthropicClient();
    const stream = client.messages.stream({
      model: AI_MODEL,
      max_tokens: AI_MAX_TOKENS,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const conversationId = conversation.id;
    let fullResponse = "";
    let tokensInput = 0;
    let tokensOutput = 0;

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        function send(data: Record<string, unknown>) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          );
        }

        try {
          send({ type: "start", conversation_id: conversationId });

          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              fullResponse += event.delta.text;
              send({ type: "text", text: event.delta.text });
            }
          }

          const finalMessage = await stream.finalMessage();
          tokensInput = finalMessage.usage.input_tokens;
          tokensOutput = finalMessage.usage.output_tokens;

          await appendMessages(
            conversationId,
            auth!.organization.id,
            auth!.userId,
            [
              { role: "user", content: message },
              { role: "assistant", content: fullResponse },
            ],
            tokensInput + tokensOutput,
          );

          await logAIUsage({
            organizationId: auth!.organization.id,
            userId: auth!.userId,
            operation: "assistant",
            tokensInput,
            tokensOutput,
            latencyMs: Date.now() - startTime,
          });

          send({ type: "done", conversation_id: conversationId });
        } catch (err) {
          console.error("[ai/chat/stream]", err);
          send({ type: "error", message: mapAIErrorToMessage(err) });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[ai/chat/POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
