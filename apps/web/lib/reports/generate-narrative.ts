import { AI_MAX_TOKENS, AI_MODEL, getAnthropicClient } from "@/lib/ai/anthropic";
import { buildReportPrompt } from "@/lib/ai/prompts";
import type { ReportDataSnapshot } from "@constructa/types";

export async function generateReportNarrative(params: {
  orgName: string;
  snapshot: ReportDataSnapshot;
}): Promise<{ narrative: string; tokensInput: number; tokensOutput: number }> {
  const client = getAnthropicClient();
  const clientName = params.snapshot.project.client_name ?? "Cliente";
  const dataJson = JSON.stringify(params.snapshot, null, 2);

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: AI_MAX_TOKENS,
    messages: [
      {
        role: "user",
        content: buildReportPrompt({
          orgName: params.orgName,
          clientName,
          projectName: params.snapshot.project.name,
          dataJson,
        }),
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const narrative = textBlock?.type === "text" ? textBlock.text : "";

  return {
    narrative,
    tokensInput: response.usage.input_tokens,
    tokensOutput: response.usage.output_tokens,
  };
}
