"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Config {
  id: string;
  name: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  historyLimit: number;
  enabled: boolean;
  allowedPhones: string;
  evolutionUrl: string;
  evolutionApiKey: string;
  instanceId: string;
  aiProvider: string;
  openaiApiKey: string;
  openaiModel: string;
  groqApiKey: string;
  groqModel: string;
}

const OPENAI_MODELS = ["gpt-4.1-mini", "gpt-4.1", "gpt-4o", "gpt-4o-mini"];
const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it", "mixtral-8x7b-32768"];

export default function ConfigPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [status, setStatus] = useState<"" | "saved" | "error">("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [webhookCopied, setWebhookCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/config")
      .then((r) => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.json();
      })
      .then((data) => { if (data) setConfig(data); setLoading(false); });
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setStatus("");
    const res = await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setStatus(res.ok ? "saved" : "error");
    setSaving(false);
    setTimeout(() => setStatus(""), 3000);
  }

  function set<K extends keyof Config>(key: K, value: Config[K]) {
    setConfig((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  function copyWebhook() {
    const url = `${window.location.origin}/api/webhook`;
    navigator.clipboard.writeText(url);
    setWebhookCopied(true);
    setTimeout(() => setWebhookCopied(false), 2000);
  }

  if (loading) {
    return (
      <div style={{ padding: "48px", color: "var(--text-3)", fontSize: "14px" }}>
        A carregar configurações...
      </div>
    );
  }

  if (!config) return null;

  const sectionStyle = { marginBottom: "32px" };
  const labelStyle = { display: "block" as const, fontSize: "13px", color: "var(--text-2)", marginBottom: "6px" };
  const fieldGroupStyle = { display: "flex" as const, flexDirection: "column" as const, gap: "16px" };
  const rowStyle = { display: "grid" as const, gridTemplateColumns: "1fr 1fr", gap: "16px" };
  const headingStyle = {
    fontFamily: "var(--font-display)",
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text-3)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: "16px",
    paddingBottom: "10px",
    borderBottom: "1px solid var(--border)",
  };

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
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
            Configurações
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "2px" }}>
            Configure o agente IA e a integração com o WhatsApp
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {status === "saved" && (
            <span style={{ fontSize: "13px", color: "var(--success)" }}>Guardado com sucesso</span>
          )}
          {status === "error" && (
            <span style={{ fontSize: "13px", color: "var(--error)" }}>Erro ao guardar</span>
          )}
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "A guardar..." : "Guardar"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ padding: "28px", maxWidth: "800px" }}>

        {/* Agente */}
        <div style={sectionStyle}>
          <p style={headingStyle}>Agente</p>
          <div style={fieldGroupStyle}>
            <div>
              <label style={labelStyle}>Nome do Agente</label>
              <input className="field-input" value={config.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Prompt do Sistema</label>
              <textarea
                className="field-input"
                rows={4}
                value={config.systemPrompt}
                onChange={(e) => set("systemPrompt", e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>
            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Temperatura ({config.temperature})</label>
                <input
                  type="range"
                  min={0} max={2} step={0.1}
                  value={config.temperature}
                  onChange={(e) => set("temperature", parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--accent)" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Máx. Tokens</label>
                <input
                  className="field-input"
                  type="number"
                  min={1} max={16000}
                  value={config.maxTokens}
                  onChange={(e) => set("maxTokens", parseInt(e.target.value))}
                />
              </div>
            </div>
            <div style={rowStyle}>
              <div>
                <label style={labelStyle}>Histórico (mensagens)</label>
                <input
                  className="field-input"
                  type="number"
                  min={1} max={100}
                  value={config.historyLimit}
                  onChange={(e) => set("historyLimit", parseInt(e.target.value))}
                />
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => set("enabled", !config.enabled)}
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "12px",
                      border: "none",
                      cursor: "pointer",
                      background: config.enabled ? "var(--success)" : "var(--border-3)",
                      position: "relative",
                      transition: "background 0.2s",
                    }}
                  >
                    <span style={{
                      position: "absolute",
                      top: "3px",
                      left: config.enabled ? "23px" : "3px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left 0.2s",
                    }} />
                  </button>
                  <span style={{ fontSize: "13px", color: config.enabled ? "var(--success)" : "var(--text-3)" }}>
                    {config.enabled ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Números Permitidos (CSV, vazio = todos)</label>
              <input
                className="field-input"
                value={config.allowedPhones}
                onChange={(e) => set("allowedPhones", e.target.value)}
                placeholder="351912345678, 351987654321"
              />
            </div>
          </div>
        </div>

        {/* Provedor de IA */}
        <div style={sectionStyle}>
          <p style={headingStyle}>Provedor de IA</p>
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            {["openai", "groq"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => set("aiProvider", p)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "10px",
                  border: config.aiProvider === p ? "1px solid var(--accent-border)" : "1px solid var(--border-2)",
                  background: config.aiProvider === p ? "var(--accent-dim)" : "transparent",
                  color: config.aiProvider === p ? "var(--accent)" : "var(--text-2)",
                  fontWeight: config.aiProvider === p ? 600 : 400,
                  cursor: "pointer",
                  fontSize: "13px",
                  transition: "all 0.15s",
                }}
              >
                {p === "openai" ? "OpenAI" : "Groq (grátis)"}
              </button>
            ))}
          </div>

          {config.aiProvider === "openai" ? (
            <div style={fieldGroupStyle}>
              <div>
                <label style={labelStyle}>OpenAI API Key</label>
                <input
                  className="field-input"
                  type="password"
                  value={config.openaiApiKey}
                  onChange={(e) => set("openaiApiKey", e.target.value)}
                  placeholder="sk-..."
                />
              </div>
              <div>
                <label style={labelStyle}>Modelo</label>
                <select
                  className="field-input"
                  value={config.openaiModel}
                  onChange={(e) => set("openaiModel", e.target.value)}
                >
                  {OPENAI_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div style={fieldGroupStyle}>
              <div>
                <label style={labelStyle}>Groq API Key</label>
                <input
                  className="field-input"
                  type="password"
                  value={config.groqApiKey}
                  onChange={(e) => set("groqApiKey", e.target.value)}
                  placeholder="gsk_..."
                />
              </div>
              <div>
                <label style={labelStyle}>Modelo</label>
                <select
                  className="field-input"
                  value={config.groqModel}
                  onChange={(e) => set("groqModel", e.target.value)}
                >
                  {GROQ_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Evolution API */}
        <div style={sectionStyle}>
          <p style={headingStyle}>Evolution API (WhatsApp)</p>
          <div style={fieldGroupStyle}>
            <div>
              <label style={labelStyle}>URL da Evolution API</label>
              <input
                className="field-input"
                value={config.evolutionUrl}
                onChange={(e) => set("evolutionUrl", e.target.value)}
                placeholder="https://api.evolution.example.com"
              />
            </div>
            <div>
              <label style={labelStyle}>API Key</label>
              <input
                className="field-input"
                type="password"
                value={config.evolutionApiKey}
                onChange={(e) => set("evolutionApiKey", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>ID da Instância</label>
              <input
                className="field-input"
                value={config.instanceId}
                onChange={(e) => set("instanceId", e.target.value)}
                placeholder="minha-instancia"
              />
            </div>
          </div>
        </div>

        {/* Webhook */}
        <div style={sectionStyle}>
          <p style={headingStyle}>Webhook</p>
          <p style={{ fontSize: "13px", color: "var(--text-2)", marginBottom: "12px" }}>
            Configure este URL na Evolution API com o evento <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)", background: "var(--accent-dim)", padding: "2px 6px", borderRadius: "4px" }}>messages.upsert</code>
          </p>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "10px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              color: "var(--text-2)",
            }}>
              {typeof window !== "undefined" ? `${window.location.origin}/api/webhook` : "/api/webhook"}
            </div>
            <button type="button" className="btn-ghost" onClick={copyWebhook} style={{ whiteSpace: "nowrap" }}>
              {webhookCopied ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
