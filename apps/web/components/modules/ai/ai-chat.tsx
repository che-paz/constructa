"use client";

import { useCallback, useRef, useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import type { AIChatMessage } from "@constructa/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ProjectOption {
  id: string;
  name: string;
}

interface AIChatProps {
  projects: ProjectOption[];
  initialProjectId?: string | null;
}

export function AIChat({ projects, initialProjectId }: AIChatProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string>(
    initialProjectId ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    const assistantIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId,
          project_id: projectId || null,
        }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(
          typeof err.error === "string"
            ? err.error
            : "No se pudo procesar la consulta",
        );
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Stream no disponible");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = JSON.parse(line.slice(6)) as {
            type: string;
            text?: string;
            conversation_id?: string;
            message?: string;
          };

          if (payload.type === "start" && payload.conversation_id) {
            setConversationId(payload.conversation_id);
          }

          if (payload.type === "text" && payload.text) {
            setMessages((prev) => {
              const updated = [...prev];
              const current = updated[assistantIndex];
              if (current?.role === "assistant") {
                updated[assistantIndex] = {
                  role: "assistant",
                  content: current.content + payload.text,
                };
              }
              return updated;
            });
            scrollToBottom();
          }

          if (payload.type === "error" && payload.message) {
            throw new Error(payload.message);
          }
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al consultar al asistente";
      setError(msg);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  return (
    <Card className="flex h-[calc(100vh-12rem)] flex-col">
      <CardHeader className="shrink-0 border-b pb-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Asistente IA</CardTitle>
            <CardDescription>
              Consulta gastos, materiales, pagos y avance de tus obras
            </CardDescription>
          </div>
        </div>
        {projects.length > 0 && (
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="mt-3 w-full max-w-xs rounded-md border bg-background px-3 py-2 text-sm"
            disabled={loading}
          >
            <option value="">Todos los proyectos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto p-4"
        >
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <Bot className="mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm">
                Pregúntame, por ejemplo: &quot;¿Cuánto gasté en cemento este
                mes?&quot;
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-lg px-4 py-2 text-sm",
                msg.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted",
              )}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}

          {loading && messages[messages.length - 1]?.content === "" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Pensando…
            </div>
          )}
        </div>

        {error && (
          <p className="px-4 pb-2 text-sm text-destructive">{error}</p>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex shrink-0 gap-2 border-t p-4"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu consulta…"
            rows={2}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSubmit(e);
              }
            }}
            className="min-h-[60px] resize-none"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
