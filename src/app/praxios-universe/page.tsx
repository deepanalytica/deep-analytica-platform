"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./praxios-universe.module.css";

type EpistemicState = "VERIFIED" | "CORROBORATED" | "CONJECTURE" | "REVIEW" | "BLOCK" | "UNKNOWN";

type Claim = {
  id: string;
  text: string;
  state: EpistemicState;
  confidence: number | null;
  evidence: string[];
  debt: string;
};

type TraceEvent = {
  time: string;
  actor: string;
  event: string;
  state?: EpistemicState;
};

type DemoRun = {
  missionId: string;
  statement: string;
  verdict: "PASS" | "REVIEW" | "BLOCK";
  claims: Claim[];
  evidence: { id: string; label: string; kind: string; independent: boolean }[];
  trace: TraceEvent[];
};

const genealogy = [
  { id: "euler", index: "00", title: "Súper Prompt Euler", role: "Método cognitivo", body: "Nombrar, observar, demoler, conjeturar, verificar, unificar, conservar proceso y terminar en la frontera." },
  { id: "chi", index: "01", title: "χ · La Característica", role: "Invariantes heredables", body: "Diseña leyes que sobreviven cuando sistemas crean sistemas: observación, conservación, audacia, verificación, variedad, poder mínimo, contestabilidad, Afuera y alto." },
  { id: "bridge", index: "02", title: "EL PUENTE", role: "Doctrina epistemológica", body: "No se cura al soñador. Se construye el laboratorio alrededor del sueño. Imaginación y autoridad quedan separadas." },
  { id: "family", index: "03", title: "Familia de Harnesses", role: "Instrumentos de crítica", body: "Newton, Gauss, Ramanujan, Poincaré, Einstein y Feynman agregan experimento discriminante, error instrumental, deuda, autopsia y refutación." },
  { id: "math", index: "04", title: "Harness Matemático", role: "Formalización", body: "Estados epistemológicos, operadores, transferencia de dominio, profundidad refutativa y reglas de promoción." },
  { id: "gear", index: "05", title: "EL ENGRANAJE", role: "Máquina ejecutable", body: "La doctrina empieza a convertirse en software, tests, medición y artefactos reproducibles." },
  { id: "shark", index: "06", title: "THE SHARK", role: "Operador adversarial", body: "No ayuda ni felicita: intenta destruir claims, recomputa, desafía instrumentos, busca deuda y clasifica lo que sobrevive." },
  { id: "harness", index: "07", title: "META-HARNESS", role: "Assurance plane", body: "Controla qué información tiene derecho a ascender: claim, evidence, provenance, uncertainty, contradiction, risk, policy y authorization." },
  { id: "praxios", index: "08", title: "PRAXIOS OS", role: "Execution plane", body: "Mantiene misión, estado, workflow, agentes, herramientas, checkpoints, recuperación, acciones y outcomes fuera del LLM." },
  { id: "room", index: "09", title: "CONTROL & DECISION ROOM", role: "Autoridad humana", body: "Superficie para inspeccionar evidencia, lineage, gates, escenarios, decisiones, acciones y resultados." },
];

const seedRun: DemoRun = {
  missionId: "PX-DEMO-042",
  statement: "La alteración hidrotermal observada podría ser compatible con un sistema mineralizado, pero no autoriza por sí sola una conclusión causal.",
  verdict: "REVIEW",
  claims: [
    { id: "C-001", text: "Existe una observación declarada que requiere trazabilidad a una fuente o instrumento.", state: "CORROBORATED", confidence: 0.72, evidence: ["E-001"], debt: "Falta instrumento primario independiente en esta demo." },
    { id: "C-002", text: "La compatibilidad entre una señal y una hipótesis no equivale a causalidad.", state: "VERIFIED", confidence: null, evidence: ["E-002"], debt: "Regla de Aduana, no afirmación sobre un yacimiento real." },
    { id: "C-003", text: "La inferencia principal permanece como conjetura hasta incorporar evidencia independiente y experimentos discriminantes.", state: "CONJECTURE", confidence: 0.46, evidence: ["E-001", "E-003"], debt: "Requiere Afuera: mediciones, fuentes o instrumentos externos." },
    { id: "C-004", text: "No existe autorización para emitir una conclusión operativa como hecho verificado.", state: "REVIEW", confidence: null, evidence: ["E-003"], debt: "Stop Gate mantiene la promoción detenida." },
  ],
  evidence: [
    { id: "E-001", label: "Entrada de misión", kind: "USER_INPUT", independent: false },
    { id: "E-002", label: "Regla de transferencia: compatibilidad ≠ causalidad", kind: "POLICY", independent: true },
    { id: "E-003", label: "Instrumento demo sin fuente física", kind: "SYNTHETIC", independent: false },
  ],
  trace: [
    { time: "00:00.4", actor: "Dreamer", event: "Propuso hipótesis candidata.", state: "CONJECTURE" },
    { time: "00:00.8", actor: "Decomposer", event: "Separó la misión en cuatro claims atómicos." },
    { time: "00:01.1", actor: "Instrumentist", event: "Detectó que la evidencia disponible es de demostración." },
    { time: "00:01.5", actor: "CustomsGate", event: "Bloqueó promoción de compatibilidad a causalidad.", state: "REVIEW" },
    { time: "00:02.0", actor: "Shark", event: "Exigió independencia de evidencia y alternativa rival." },
    { time: "00:02.4", actor: "StopGate", event: "Salida final retenida para revisión humana.", state: "REVIEW" },
  ],
};

const stages = [
  { name: "DREAM", detail: "Generar sin autoridad", state: "CONJECTURE" },
  { name: "DECOMPOSE", detail: "Claims atómicos", state: "CORROBORATED" },
  { name: "INSTRUMENT", detail: "Tocar el Afuera", state: "REVIEW" },
  { name: "CUSTOMS", detail: "Control de transferencia", state: "REVIEW" },
  { name: "SKEPTIC", detail: "Alternativa rival", state: "CORROBORATED" },
  { name: "METAMATH", detail: "Formalizar cuando aplica", state: "UNKNOWN" },
  { name: "SHARK", detail: "Ataque adversarial", state: "REVIEW" },
  { name: "STOP", detail: "Autoridad de salida", state: "REVIEW" },
];

const inverseCandidates = [
  { id: "H1", name: "Historia candidata A", score: 18, result: "DEAD" },
  { id: "H2", name: "Historia candidata B", score: 61, result: "MORDIDO" },
  { id: "H3", name: "Historia candidata C", score: 84, result: "SURVIVES" },
  { id: "H4", name: "Historia candidata D", score: 31, result: "DEAD" },
];

function stateClass(state: EpistemicState) {
  if (state === "VERIFIED") return styles.verified;
  if (state === "CORROBORATED") return styles.corroborated;
  if (state === "CONJECTURE") return styles.conjecture;
  if (state === "BLOCK") return styles.block;
  if (state === "REVIEW") return styles.review;
  return styles.unknown;
}

export default function PraxiosUniversePage() {
  const [selectedNode, setSelectedNode] = useState("bridge");
  const [run, setRun] = useState<DemoRun>(seedRun);
  const [selectedClaimId, setSelectedClaimId] = useState(seedRun.claims[0].id);
  const [statement, setStatement] = useState(seedRun.statement);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeNode = useMemo(
    () => genealogy.find((node) => node.id === selectedNode) ?? genealogy[0],
    [selectedNode]
  );

  const activeClaim = useMemo(
    () => run.claims.find((claim) => claim.id === selectedClaimId) ?? run.claims[0],
    [run, selectedClaimId]
  );

  async function crossBridge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/praxios-universe/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statement }),
      });

      if (!response.ok) {
        throw new Error("No fue posible crear la misión demo.");
      }

      const payload = (await response.json()) as { run: DemoRun };
      setRun(payload.run);
      setSelectedClaimId(payload.run.claims[0]?.id ?? "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.root}>
      <div className={styles.gridGlow} aria-hidden="true" />

      <header className={styles.topbar}>
        <a className={styles.brand} href="#top" aria-label="PRAXIOS Universe">
          <span className={styles.brandMark}>PX</span>
          <span>
            <strong>PRAXIOS</strong>
            <small>UNIVERSE / META-HARNESS</small>
          </span>
        </a>

        <nav className={styles.nav} aria-label="Secciones">
          <a href="#genealogy">Genealogía</a>
          <a href="#bridge">Cross the Bridge</a>
          <a href="#control">Control Room</a>
          <a href="#inverse">Inverse Reality Lab</a>
        </nav>

        <div className={styles.liveBadge}>
          <i />
          VERTICAL SLICE · DEMO
        </div>
      </header>

      <section className={styles.hero} id="top">
        <div className={styles.eyebrow}>
          EL PUENTE → META-HARNESS → PRAXIOS → HUMAN AUTHORITY
        </div>
        <h1>
          El laboratorio alrededor
          <span> del sueño.</span>
        </h1>
        <p className={styles.heroCopy}>
          Una superficie ejecutable para separar imaginación de autoridad, conservar evidencia,
          atacar claims y devolver la decisión final al humano.
        </p>

        <div className={styles.heroActions}>
          <a className={styles.primaryButton} href="#bridge">Cross the Bridge</a>
          <a className={styles.secondaryButton} href="#genealogy">Explorar genealogía</a>
        </div>

        <div className={styles.doctrineRail}>
          <span>REALITY OVER NARRATIVE</span>
          <span>EVIDENCE OVER CONFIDENCE</span>
          <span>PROCESS OVER ANSWERS</span>
          <span>HUMAN AUTHORITY</span>
        </div>
      </section>

      <section className={styles.section} id="genealogy">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.kicker}>01 / ORIGIN</span>
            <h2>Genealogía ejecutable</h2>
          </div>
          <p>
            No son marcas aisladas. Cada capa hereda restricciones de la anterior y añade
            capacidad sin borrar su deuda.
          </p>
        </div>

        <div className={styles.genealogyShell}>
          <div className={styles.genealogyRail} role="list">
            {genealogy.map((node) => (
              <button
                type="button"
                key={node.id}
                className={node.id === selectedNode ? styles.nodeActive : styles.node}
                onClick={() => setSelectedNode(node.id)}
              >
                <span>{node.index}</span>
                <strong>{node.title}</strong>
                <small>{node.role}</small>
              </button>
            ))}
          </div>

          <article className={styles.nodeInspector}>
            <span className={styles.inspectorIndex}>{activeNode.index}</span>
            <div>
              <p className={styles.monoLabel}>{activeNode.role}</p>
              <h3>{activeNode.title}</h3>
              <p>{activeNode.body}</p>
            </div>
            <div className={styles.inheritance}>
              <span>INHERITANCE RULE</span>
              <strong>La capa superior no puede reclamar más autoridad que la evidencia heredada.</strong>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.section} id="bridge">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.kicker}>02 / LIVE DEMO</span>
            <h2>Cross the Bridge</h2>
          </div>
          <p>
            Esta demo ejecuta una traza estructural. No simula validación científica ni convierte
            entradas del usuario en evidencia independiente.
          </p>
        </div>

        <form className={styles.bridgeForm} onSubmit={crossBridge}>
          <label htmlFor="mission">Afirmación o misión</label>
          <textarea
            id="mission"
            value={statement}
            maxLength={600}
            onChange={(event) => setStatement(event.target.value)}
            placeholder="Escribe una afirmación que deba cruzar el sistema..."
          />
          <div className={styles.formFooter}>
            <span>{statement.length}/600 · DEMO EPISTEMOLÓGICA</span>
            <button type="submit" disabled={loading || statement.trim().length < 12}>
              {loading ? "EJECUTANDO…" : "CROSS THE BRIDGE →"}
            </button>
          </div>
          {error ? <p className={styles.error}>{error}</p> : null}
        </form>

        <div className={styles.pipeline}>
          {stages.map((stage, index) => (
            <div className={styles.stageWrap} key={stage.name}>
              <article className={styles.stage}>
                <div className={styles.stageTop}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <i className={stateClass(stage.state as EpistemicState)} />
                </div>
                <strong>{stage.name}</strong>
                <small>{stage.detail}</small>
              </article>
              {index < stages.length - 1 ? <span className={styles.connector}>→</span> : null}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.controlSection} id="control">
        <div className={styles.controlHeader}>
          <div>
            <span className={styles.kicker}>03 / EXECUTION SURFACE</span>
            <h2>Control & Decision Room</h2>
          </div>
          <div className={styles.missionMeta}>
            <span>MISSION</span>
            <strong>{run.missionId}</strong>
            <span className={styles.verdict}>{run.verdict}</span>
          </div>
        </div>

        <div className={styles.controlGrid}>
          <aside className={styles.claimPanel}>
            <div className={styles.panelTitle}>
              <span>CLAIMS</span>
              <b>{run.claims.length}</b>
            </div>

            <div className={styles.claimList}>
              {run.claims.map((claim) => (
                <button
                  type="button"
                  key={claim.id}
                  className={[
                    styles.claimRow,
                    claim.id === activeClaim?.id ? styles.claimRowActive : "",
                  ].join(" ")}
                  onClick={() => setSelectedClaimId(claim.id)}
                >
                  <span className={stateClass(claim.state)} />
                  <div>
                    <strong>{claim.id}</strong>
                    <p>{claim.text}</p>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <div className={styles.executionPanel}>
            <div className={styles.panelTitle}>
              <span>EXECUTION GRAPH</span>
              <b>STATE OUTSIDE LLM</b>
            </div>

            <div className={styles.orbit}>
              <div className={styles.orbitRingOne} />
              <div className={styles.orbitRingTwo} />
              <div className={styles.coreNode}>
                <small>MISSION</small>
                <strong>{run.missionId}</strong>
              </div>
              <div className={[styles.satellite, styles.satOne].join(" ")}>
                <small>DREAMER</small><strong>H</strong>
              </div>
              <div className={[styles.satellite, styles.satTwo].join(" ")}>
                <small>TOOLS</small><strong>I</strong>
              </div>
              <div className={[styles.satellite, styles.satThree].join(" ")}>
                <small>SHARK</small><strong>D</strong>
              </div>
              <div className={[styles.satellite, styles.satFour].join(" ")}>
                <small>HUMAN</small><strong>A</strong>
              </div>
            </div>

            <div className={styles.membrane}>
              <span>META-HARNESS MEMBRANE</span>
              <div className={styles.gates}>
                <b>CLAIM</b><b>EVIDENCE</b><b>PROVENANCE</b><b>UNCERTAINTY</b><b>AUTHORITY</b>
              </div>
            </div>
          </div>

          <aside className={styles.evidencePanel}>
            <div className={styles.panelTitle}>
              <span>INSPECTOR</span>
              <b>{activeClaim?.id}</b>
            </div>

            {activeClaim ? (
              <>
                <div className={styles.stateHeader}>
                  <i className={stateClass(activeClaim.state)} />
                  <div>
                    <small>EPISTEMIC STATE</small>
                    <strong>{activeClaim.state}</strong>
                  </div>
                </div>

                <p className={styles.claimText}>{activeClaim.text}</p>

                <div className={styles.metricRow}>
                  <span>Confidence</span>
                  <strong>{activeClaim.confidence === null ? "N/A" : Math.round(activeClaim.confidence * 100) + "%"}</strong>
                </div>

                <div className={styles.evidenceList}>
                  <span>EVIDENCE LINKS</span>
                  {activeClaim.evidence.map((id) => {
                    const item = run.evidence.find((evidence) => evidence.id === id);
                    return (
                      <div key={id}>
                        <b>{id}</b>
                        <span>{item?.label ?? "Sin metadatos"}</span>
                        <em>{item?.independent ? "INDEPENDENT" : "DEPENDENT"}</em>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.debtBox}>
                  <span>OPEN DEBT</span>
                  <p>{activeClaim.debt}</p>
                </div>
              </>
            ) : null}
          </aside>
        </div>

        <div className={styles.lowerGrid}>
          <section className={styles.tracePanel}>
            <div className={styles.panelTitle}>
              <span>LIVE TRACE / EVENT LEDGER</span>
              <b>APPEND-ONLY VIEW</b>
            </div>
            <div className={styles.traceList}>
              {run.trace.map((entry, index) => (
                <div key={entry.time + entry.actor + index}>
                  <time>{entry.time}</time>
                  <strong>{entry.actor}</strong>
                  <p>{entry.event}</p>
                  {entry.state ? <span className={stateClass(entry.state)}>{entry.state}</span> : <span>EVENT</span>}
                </div>
              ))}
            </div>
          </section>

          <section className={styles.stopPanel}>
            <div className={styles.sharkLine}>
              <span>THE SHARK</span>
              <strong>¿Qué parte no sobrevive a un ataque serio?</strong>
            </div>
            <div className={styles.stopVerdict}>
              <small>STOP GATE</small>
              <strong>{run.verdict}</strong>
              <p>
                La misión no puede ascender a hecho verificado mientras dependa de evidencia sintética
                o no independiente.
              </p>
            </div>
            <div className={styles.humanControl}>
              <span>FINAL AUTHORITY</span>
              <strong>HUMAN</strong>
            </div>
          </section>
        </div>
      </section>

      <section className={styles.section} id="inverse">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.kicker}>04 / RESEARCH DOMAIN</span>
            <h2>Inverse Reality Lab</h2>
          </div>
          <p>
            El laboratorio usa el stack para reducir espacios de historias compatibles con evidencia.
            La barra es una visualización demo, no probabilidad científica.
          </p>
        </div>

        <div className={styles.inverseGrid}>
          <div className={styles.observedPanel}>
            <span className={styles.monoLabel}>OBSERVED REALITY</span>
            <h3>Estado actual</h3>
            <div className={styles.constraintStack}>
              <span>GEOMETRY</span>
              <span>STRUCTURE</span>
              <span>MATERIALS</span>
              <span>CHRONOLOGY</span>
              <span>MEASUREMENTS</span>
            </div>
            <div className={styles.inverseArrow}>↓</div>
            <strong>CONSTRAINT SPACE</strong>
          </div>

          <div className={styles.candidatesPanel}>
            <div className={styles.panelTitle}>
              <span>CANDIDATE HISTORIES</span>
              <b>FORWARD SIMULATION → COMPARE → REFUTE</b>
            </div>
            {inverseCandidates.map((candidate) => (
              <div className={styles.candidate} key={candidate.id}>
                <div>
                  <strong>{candidate.id}</strong>
                  <span>{candidate.name}</span>
                  <em>{candidate.result}</em>
                </div>
                <div className={styles.scoreTrack}>
                  <span style={{ width: candidate.score + "%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.bookSection}>
        <div>
          <span className={styles.kicker}>05 / MEMORY</span>
          <h2>Book of Audacities</h2>
          <p>
            Las conjeturas no demostradas no desaparecen. Se conservan con deuda, linaje, causas de
            muerte y condiciones explícitas para reabrirse.
          </p>
        </div>

        <article className={styles.bookCard}>
          <div className={styles.bookCardTop}>
            <span>HYPOTHESIS H-228</span>
            <b>DORMANT</b>
          </div>
          <h3>La explicación candidata sobrevive parcialmente al modelo, pero falla una restricción temporal.</h3>
          <dl>
            <div><dt>Origin</dt><dd>Dreamer / Run PX-042</dd></div>
            <div><dt>Killed by</dt><dd>Shark Attack #19</dd></div>
            <div><dt>Reason</dt><dd>Temporal incompatibility</dd></div>
            <div><dt>Reopen with</dt><dd>Independent chronology</dd></div>
          </dl>
        </article>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>PRAXIOS UNIVERSE</strong>
          <span>Deep Analytica · vertical slice v0.1</span>
        </div>
        <p>
          Esta superficie demuestra arquitectura e interacción. Los resultados demo no constituyen
          verificación científica, diagnóstico, predicción ni decisión operativa.
        </p>
      </footer>
    </main>
  );
}
