"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccessForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/mining-v2/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const body = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(body.error ?? "No fue posible validar el acceso.");
      return;
    }

    router.replace("/mining-v2");
    router.refresh();
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
      <label style={{ display: "grid", gap: 7, fontSize: 12, color: "#98a6b3" }}>
        CONTRASEÑA
        <input
          autoFocus
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          style={{
            border: "1px solid #2a3945",
            background: "#0a1116",
            color: "#fff",
            borderRadius: 10,
            padding: "13px 14px",
            outline: "none",
          }}
        />
      </label>
      {error && <p style={{ color: "#ff8a80", margin: 0, fontSize: 12 }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        style={{
          border: "1px solid #4e7890",
          background: "#122632",
          color: "#e7f5ff",
          borderRadius: 10,
          padding: "13px 16px",
          fontWeight: 700,
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "Validando…" : "Entrar a Mining Intelligence"}
      </button>
    </form>
  );
}
