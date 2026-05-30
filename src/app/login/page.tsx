"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError("Senha incorreta");
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      padding: "24px",
    }}>
      <div className="card animate-fade-up" style={{ width: "100%", maxWidth: "380px", padding: "40px 32px" }}>
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            background: "var(--accent-dim)",
            border: "1px solid var(--accent-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "22px",
          }}>
            IA
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--text-1)",
            marginBottom: "6px",
          }}>
            Agente IA
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-2)" }}>
            Introduza a sua senha para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "var(--text-2)", marginBottom: "6px" }}>
              Senha
            </label>
            <input
              className="field-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              required
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "var(--error-dim)",
              border: "1px solid rgba(248,113,113,0.2)",
              color: "var(--error)",
              fontSize: "13px",
            }}>
              {error}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: "4px" }}>
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
