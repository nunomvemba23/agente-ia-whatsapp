"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  role: string;
  content: string;
  tokens?: number | null;
}

interface Conversation {
  id: string;
  messages: Message[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedId = localStorage.getItem("conversationId");
    if (storedId) {
      setConversationId(storedId);
      loadHistory(storedId);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function loadHistory(convId: string) {
    const res = await fetch("/api/chat");
    if (res.status === 401) { router.push("/login"); return; }
    const convs: Conversation[] = await res.json();
    const conv = convs.find((c) => c.id === convId);
    if (conv) setMessages(conv.messages);
  }

  async function send() {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setLoading(true);

    const userMsg: Message = { id: `tmp-${Date.now()}`, role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, conversationId }),
    });

    if (res.status === 401) { router.push("/login"); return; }

    const data = await res.json();

    if (!conversationId) {
      setConversationId(data.conversationId);
      localStorage.setItem("conversationId", data.conversationId);
    }

    setMessages((prev) => [...prev, data.message]);
    setLoading(false);
  }

  function newConversation() {
    localStorage.removeItem("conversationId");
    setConversationId(null);
    setMessages([]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "18px 28px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 700, color: "var(--text-1)" }}>
            Chat de Teste
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "2px" }}>
            Teste o agente IA directamente no navegador
          </p>
        </div>
        <button className="btn-ghost" onClick={newConversation} style={{ fontSize: "13px", padding: "8px 14px" }}>
          Nova conversa
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {messages.length === 0 && !loading && (
          <div style={{ textAlign: "center", color: "var(--text-3)", marginTop: "64px" }}>
            <p style={{ fontSize: "15px", marginBottom: "6px" }}>Sem mensagens ainda.</p>
            <p style={{ fontSize: "13px" }}>Envie uma mensagem para começar a conversa.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "68%",
              padding: "12px 16px",
              borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: msg.role === "user" ? "var(--surface-3)" : "var(--ai-dim)",
              border: msg.role === "user" ? "1px solid var(--border-2)" : "1px solid var(--ai-border)",
              fontSize: "14px",
              lineHeight: "1.65",
              color: "var(--text-1)",
            }}>
              <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
              {msg.role === "assistant" && msg.tokens && (
                <p style={{ marginTop: "6px", fontSize: "11px", color: "var(--ai)", fontFamily: "var(--font-mono)" }}>
                  {msg.tokens} tokens
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "14px 18px",
              borderRadius: "14px 14px 14px 4px",
              background: "var(--ai-dim)",
              border: "1px solid var(--ai-border)",
            }}>
              <div className="dot-pulse">
                <span />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "16px 28px",
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
      }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <input
            className="field-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Digite uma mensagem..."
            disabled={loading}
          />
          <button
            className="btn-primary"
            onClick={send}
            disabled={loading || !input.trim()}
            style={{ whiteSpace: "nowrap", padding: "0 22px" }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
