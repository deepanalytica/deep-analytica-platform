import { NextRequest, NextResponse } from "next/server";

type State = "VERIFIED" | "CORROBORATED" | "CONJECTURE" | "REVIEW";

function stableHash(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
}

function state(id: State) {
  return id;
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const statement =
    typeof body === "object" &&
    body !== null &&
    "statement" in body &&
    typeof (body as { statement?: unknown }).statement === "string"
      ? (body as { statement: string }).statement.trim()
      : "";

  if (statement.length < 12 || statement.length > 600) {
    return NextResponse.json(
      { error: "La afirmación debe tener entre 12 y 600 caracteres." },
      { status: 422 }
    );
  }

  const missionId = "PX-" + stableHash(statement).slice(0, 6);

  const run = {
    missionId,
    statement,
    verdict: "REVIEW" as const,
    claims: [
      {
        id: "C-001",
        text: statement,
        state: state("CONJECTURE"),
        confidence: null,
        evidence: ["E-001"],
        debt: "La entrada del usuario es una proposición, no evidencia independiente.",
      },
      {
        id: "C-002",
        text: "La misión debe descomponerse en claims verificables antes de adquirir autoridad.",
        state: state("CORROBORATED"),
        confidence: null,
        evidence: ["E-002"],
        debt: "Regla de proceso del vertical slice; falta conexión al runtime canónico.",
      },
      {
        id: "C-003",
        text: "Ninguna promoción causal o factual queda autorizada con la evidencia disponible en esta demo.",
        state: state("REVIEW"),
        confidence: null,
        evidence: ["E-001", "E-003"],
        debt: "Requiere Afuera: fuente, instrumento, test o medición realmente independiente.",
      },
      {
        id: "C-004",
        text: "La salida permanece retenida para revisión humana y no debe presentarse como hecho verificado.",
        state: state("REVIEW"),
        confidence: null,
        evidence: ["E-003"],
        debt: "Stop Gate activo hasta que exista evidencia suficiente y trazable.",
      },
    ],
    evidence: [
      {
        id: "E-001",
        label: "Entrada de usuario",
        kind: "USER_INPUT",
        independent: false,
      },
      {
        id: "E-002",
        label: "Política demo: separar proposición de evidencia",
        kind: "POLICY",
        independent: true,
      },
      {
        id: "E-003",
        label: "Harness demo sin instrumento externo",
        kind: "SYNTHETIC",
        independent: false,
      },
    ],
    trace: [
      { time: "00:00.2", actor: "Mission", event: "Entrada aceptada y normalizada." },
      { time: "00:00.5", actor: "Dreamer", event: "Registró la proposición sin promoverla.", state: state("CONJECTURE") },
      { time: "00:00.9", actor: "Decomposer", event: "Generó claims estructurales para revisión." },
      { time: "00:01.2", actor: "Instrumentist", event: "No encontró un Afuera real conectado en este vertical slice." },
      { time: "00:01.6", actor: "CustomsGate", event: "Bloqueó promociones de dominio no sustentadas.", state: state("REVIEW") },
      { time: "00:02.0", actor: "Shark", event: "Atacó independencia, provenance y posibilidad de refutación." },
      { time: "00:02.4", actor: "StopGate", event: "Retuvo emisión factual y escaló a humano.", state: state("REVIEW") },
    ],
  };

  return NextResponse.json(
    {
      mode: "DETERMINISTIC_DEMO",
      warning:
        "Este endpoint demuestra arquitectura de flujo. No ejecuta aún el runtime PRAXIOS ni constituye validación científica.",
      run,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
