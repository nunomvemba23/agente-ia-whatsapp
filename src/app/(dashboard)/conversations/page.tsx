"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  role: string;
  content: string;
  tokens?: number | null;
  createdAt: string;
}

interface Conversation {
  id: string;
  phone: string | null;
  messages: Message[];
  updatedAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PhoneAvatar({ phone }: { phone: string | null }) {
  const label = phone ? phone.slice(-2) : "?";
  return (
    <div style={{
      width: 40,
      height: 40,
      borderRadius: "50%",
      background: "var(--surface-3)",
      border: "1px solid var(--border-2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--accent-text)",
      fontSize: "13px",
      fontWeight: 600,
      fontFamily: "var(--font-mono)",
      flexShrink: 0,
    }}>
      {label}
    </div>
  );
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations(phone?: string) {
    const url = phone ? `/api/conversations?phone=${encodeURIComponent(phone)}` : "/api/conversations";
    const res = await fetch(url);
    if (res.status === 401) { router.push("/login"); return; }
    const data = await res.json();
    setConversations(data);
    setLoading(false);
  }

  function handleSearch(value: string) {
    setSearch(value);
    loadConversations(value || undefined);
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left panel */}
      <div style={{
        width: "320px",
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        background: "var(--surface)",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 16px 12px", borderBottom: "1px solid var(--border)" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 700, color: "var(--text-1)", marginBottom: "12px" }}>
            Conversas WhatsApp
          </h1>
          <input
            className="field-input"
            placeholder="Buscar por número..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading && (
            <div style={{ padding: "24px 16px", color: "var(--text-3)", fontSize: "13px" }}>
              A carregar...
            </div>
          )}
          {!loading && conversations.length === 0 && (
            <div style={{ padding: "24px 16px", color: "var(--text-3)", fontSize: "13px" }}>
              Nenhuma conversa encontrada.
            </div>
          )}
          {conversations.map((conv) => {
            const isActive = selected?.id === conv.id;
            const lastMsg = conv.messages[conv.messages.length - 1];
            return (
              <div
                key={conv.id}
                onClick={() => setSelected(conv)}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--border)",
                  borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                  background: isActive ? "var(--surface-2)" : "transparent",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
              >
                <PhoneAvatar phone={conv.phone} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-1)", fontFamily: "var(--font-mono)" }}>
                      {conv.phone ?? "Desconhecido"}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-3)" }}>
                      {formatDate(conv.updatedAt)}
                    </span>
                  </div>
                  {lastMsg && (
                    <p style={{
                      fontSize: "12px",
                      color: "var(--text-2)",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}>
                      {lastMsg.role === "assistant" ? "IA: " : ""}{lastMsg.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, overflowY: "auto", background: "var(--bg)" }}>
        {!selected ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", fontSize: "14px" }}>
            Seleccione uma conversa para ver as mensagens
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Conversation header */}
            <div style={{
              padding: "14px 24px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <PhoneAvatar phone={selected.phone} />
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 500, color: "var(--text-1)" }}>
                  {selected.phone ?? "Desconhecido"}
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-3)" }}>
                  {selected.messages.length} mensagens
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {selected.messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-start" : "flex-end" }}
                >
                  <div style={{
                    maxWidth: "68%",
                    padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "14px 14px 14px 4px" : "14px 14px 4px 14px",
                    background: msg.role === "user" ? "var(--surface-3)" : "var(--ai-dim)",
                    border: msg.role === "user" ? "1px solid var(--border-2)" : "1px solid var(--ai-border)",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    color: "var(--text-1)",
                  }}>
                    <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
                    <p style={{ marginTop: "5px", fontSize: "11px", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                      {formatDate(msg.createdAt)}
                      {msg.role === "assistant" && msg.tokens ? ` · ${msg.tokens} tokens` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
