import type { AIChatMessage, AIConversation } from "@constructa/types";
import { createClient } from "@/lib/supabase/server";

const MAX_HISTORY = 10;

export async function getConversation(
  conversationId: string,
  organizationId: string,
  userId: string,
): Promise<AIConversation | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    messages: (data.messages as AIChatMessage[]) ?? [],
  };
}

export async function listConversations(
  organizationId: string,
  userId: string,
  limit = 20,
): Promise<AIConversation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...row,
    messages: (row.messages as AIChatMessage[]) ?? [],
  }));
}

export async function createConversation(params: {
  organizationId: string;
  userId: string;
  projectId?: string | null;
}): Promise<AIConversation> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({
      organization_id: params.organizationId,
      user_id: params.userId,
      project_id: params.projectId ?? null,
      messages: [],
    })
    .select("*")
    .single();

  if (error || !data) throw error ?? new Error("Failed to create conversation");

  return {
    ...data,
    messages: [],
  };
}

export function trimMessageHistory(messages: AIChatMessage[]): AIChatMessage[] {
  return messages.slice(-MAX_HISTORY);
}

export async function appendMessages(
  conversationId: string,
  organizationId: string,
  userId: string,
  newMessages: AIChatMessage[],
  tokensUsed: number,
): Promise<void> {
  const supabase = await createClient();

  const existing = await getConversation(conversationId, organizationId, userId);
  if (!existing) throw new Error("Conversation not found");

  const updated = trimMessageHistory([...existing.messages, ...newMessages]);

  const { error } = await supabase
    .from("ai_conversations")
    .update({
      messages: updated,
      tokens_used: existing.tokens_used + tokensUsed,
    })
    .eq("id", conversationId)
    .eq("organization_id", organizationId)
    .eq("user_id", userId);

  if (error) throw error;
}

export function buildAnthropicMessages(
  history: AIChatMessage[],
  newMessage: string,
): Array<{ role: "user" | "assistant"; content: string }> {
  const recent = trimMessageHistory(history);
  return [...recent, { role: "user" as const, content: newMessage }];
}
