"use client";

import { useMemo, useState } from "react";
import { experienceData, Scenario, TrustState } from "@/lib/mining-v2/experienceData";
import TerrainTwin from "./TerrainTwin";
import styles from "./page.module.css";

type Lens = "decision" | "evidence" | "system";
type TimeMode = "history" | "now" | "forecast";

function StateDot({ state }: { state: TrustState }) {
  return <span className={`${styles.stateDot} ${styles[state]}`} aria-label={state} />;
}

function ScenarioStrip({
  scenario,
  active,
  onClick,
}: {
  scenario: Scenario;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className={active ? styles.scenarioActive : styles.scenario} onClick={onClick}>
      <span className={styles.scenarioLetter}>{scenario.id}</span>
      <div>
        <strong>{scenario.label}</strong>
        <small>{scenario.capital} · {scenario.horizon}</small>
      </div>
      <div className={styles.scenarioReturn}>
        <b>{scenario.returnMetric}</b>
        <small>{scenario.uncertainty} incertidumbre</small>
      </div>
    </button>
  );
}

function Timeline({ mode, setMode }: { mode: TimeMode; setMode: (mode: TimeMode) => void }) {
  return (
    <div className={styles.timeline}>
      <div className={styles.timelineLabels}>
        <button className={mode === "history" ? styles.timelineActive : ""} onClick={() => setMode("history")}>2018—2025</button>
        <button className={mode === "now" ? styles.timelineActive : ""} onClick={() => setMode("now")}>HOY</button>
        <button className={mode === "forecast" ? styles.timelineActive : ""} onClick={() => setMode("forecast")}>2027—2031</button>
      </div>
      <div className={styles.timelineTrack}>
        <span className={styles.historyTrack} />
        <span className={styles.nowMarker} />
        <span className={styles.forecastTrack} />
        <i style={{ left: "17%" }}><b>Campaña 01</b></i>
        <i style={{ left: "42%" }}><b>Modelo v3</b></i>
        <i style={{ left: "68%" }}><b>Gate G4</b></i>
        <i style={{ left: "86%" }}><b>Expansión</b></i>
      </div>
      <div className={styles.timelineCaption}>
        <span>observado</span>
        <span>presente</span>
        <span>proyección / escenario</span>
      </div>
    </div>
  );
}

function DecisionLens({ scenario }: { scenario: Scenario }) {
  return (
    <div className={styles.lensBody}>
      <section className={styles.heroDecision}>
        <span>DECISIÓN ABIERTA</span>
        <h2>{scenario.label}</h2>
        <p>{scenario.summary}</p>
      </section>

      <section className={styles.metricLine}>
        <div><span>Capital</span><strong>{scenario.capital}</strong></div>
        <div><span>Horizonte</span><strong>{scenario.horizon}</strong></div>
        <div><span>Retorno</span><strong>{scenario.returnMetric}</strong></div>
      </section>

      <section className={styles.tradeoffs}>
        <div><span>Reversibilidad</span><b>{scenario.reversibility}</b></div>
        <div><span>Presión hídrica</span><b>{scenario.water}</b></div>
        <div><span>Incertidumbre</span><b>{scenario.uncertainty}</b></div>
      </section>

      <section className={styles.blocker}>
        <span>PRINCIPAL BLOQUEO</span>
        <strong>Disponibilidad hídrica para expansión</strong>
        <p>La decisión permanece en HOLD hasta cerrar evidencia material y revisión humana.</p>
      </section>

      <section className={styles.decisionActions}>
        <button>Solicitar evidencia</button>
        <button className={styles.primaryAction}>Preparar revisión humana</button>
      </section>
    </div>
  );
}

function EvidenceLens() {
  return (
    <div className={styles.lensBody}>
      <section className={styles.heroDecision}>
        <span>TRAZABILIDAD</span>
        <h2>Qué sabemos. Qué no.</h2>
        <p>Cada afirmación se puede recorrer hasta la fuente que la sostiene.</p>
      </section>

      <div className={styles.evidenceStack}>
        {experienceData.evidence.map((item) => (
          <button className={styles.evidenceRow} key={item.id}>
            <StateDot state={item.state} />
            <div>
              <strong>{item.title}</strong>
              <span>{item.source} · {item.updated}</span>
            </div>
            <small>{item.id}</small>
          </button>
        ))}
      </div>

      <section className={styles.traceChain}>
        <span>TRACE ACTIVO</span>
        <div>
          <b>Fuente</b><i>→</i><b>Evidencia</b><i>→</i><b>Claim</b><i>→</i><b>Decisión</b>
        </div>
        <p>Ningún nodo puede elevarse de nivel epistemológico sin reglas explícitas del Meta-Harness.</p>
      </section>
    </div>
  );
}

function SystemLens() {
  return (
    <div className={styles.lensBody}>
      <section className={styles.heroDecision}>
        <span>SISTEMA DE CONFIANZA</span>
        <h2>No es un score. Es una membrana.</h2>
        <p>Praxios ejecuta el flujo. Meta-Harness determina qué puede cruzarlo.</p>
      </section>

      <div className={styles.systemStack}>
        {experienceData.architecture.map(([name, text], index) => (
          <div key={name} className={styles.systemLayer}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><strong>{name}</strong><p>{text}</p></div>
          </div>
        ))}
      </div>

      <section className={styles.equation}>
        <span>REGLA OPERACIONAL ACTIVA</span>
        <strong>S = max(0, 100 − 30B − 8W)</strong>
        <p>B = bloqueos · W = advertencias. No es una probabilidad de éxito.</p>
      </section>

      <section className={styles.testStatus}>
        <span>RUST CORE</span>
        <strong>Gate engine · tests activos</strong>
        <p>Decisiones high-impact requieren aprobación humana explícita.</p>
      </section>
    </div>
  );
}

export default function ExperienceV2() {
  const [lens, setLens] = useState<Lens>("decision");
  const [scenarioId, setScenarioId] = useState("A");
  const [timeMode, setTimeMode] = useState<TimeMode>("now");
  const [inspectorOpen, setInspectorOpen] = useState(true);

  const scenario = useMemo(
    () => experienceData.scenarios.find((item) => item.id === scenarioId) ?? experienceData.scenarios[0],
    [scenarioId]
  );

  async function logout() {
    await fetch("/api/mining-v2/logout", { method: "POST" });
    window.location.href = "/mining-v2/access";
  }

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.mark}>DA</div>
          <div><strong>DEEP ANALYTICA</strong><span>MINING INTELLIGENCE</span></div>
        </div>

        <div className={styles.projectCrumb}>
          <span>PROJECT / 014</span>
          <strong>LOS ANDES</strong>
          <small>Cu-Au · Chile</small>
        </div>

        <div className={styles.topActions}>
          <span className={styles.live}><i /> PRAXIOS LIVE</span>
          <button onClick={() => setInspectorOpen((value) => !value)}>{inspectorOpen ? "Ocultar contexto" : "Mostrar contexto"}</button>
          <button onClick={logout}>Salir</button>
        </div>
      </header>

      <nav className={styles.toolrail} aria-label="Herramientas">
        {[
          ["01", "Geo"],
          ["02", "Tiempo"],
          ["03", "Decidir"],
          ["04", "Evidencia"],
          ["05", "Riesgo"],
        ].map(([n, label], index) => (
          <button key={label} className={index === 0 ? styles.toolActive : ""}>
            <b>{n}</b><span>{label}</span>
          </button>
        ))}
        <div className={styles.toolSpacer} />
        <button className={styles.toolTrust}><b>68</b><span>Trust</span></button>
      </nav>

      <section className={styles.stage}>
        <TerrainTwin />

        <div className={styles.decisionRibbon}>
          <div className={styles.ribbonMain}>
            <span>DECISIÓN ACTIVA</span>
            <strong>¿Expandimos operación o compramos información?</strong>
          </div>
          <div><span>CAPITAL EXPUESTO</span><strong>{scenario.capital}</strong></div>
          <div><span>GATE</span><strong className={styles.hold}>HOLD</strong></div>
          <div><span>CONFIANZA</span><strong>{experienceData.project.trust}%</strong></div>
          <button onClick={() => { setLens("system"); setInspectorOpen(true); }}>Por qué está bloqueado →</button>
        </div>

        <div className={styles.viewSwitch}>
          <button className={timeMode === "history" ? styles.viewActive : ""} onClick={() => setTimeMode("history")}>REALIDAD</button>
          <button className={timeMode === "now" ? styles.viewActive : ""} onClick={() => setTimeMode("now")}>AHORA</button>
          <button className={timeMode === "forecast" ? styles.viewActive : ""} onClick={() => setTimeMode("forecast")}>ESCENARIO</button>
        </div>

        <div className={styles.objectCallout}>
          <span>OBJECT / T-NORTH</span>
          <strong>Target Norte</strong>
          <div><b>Hipótesis</b><b>Confianza moderada</b></div>
          <p>Continuidad y profundidad aún no confirmadas.</p>
        </div>

        <div className={styles.stageMetrics}>
          <div><span>NPV escenario</span><strong>{scenario.value}</strong></div>
          <div><span>Agua</span><strong>{scenario.water}</strong></div>
          <div><span>Reversibilidad</span><strong>{scenario.reversibility}</strong></div>
        </div>

        <Timeline mode={timeMode} setMode={setTimeMode} />

        <div className={styles.scenarioDock}>
          {experienceData.scenarios.map((item) => (
            <ScenarioStrip
              key={item.id}
              scenario={item}
              active={item.id === scenarioId}
              onClick={() => setScenarioId(item.id)}
            />
          ))}
        </div>

        {inspectorOpen && (
          <aside className={styles.inspector}>
            <div className={styles.inspectorTabs}>
              <button className={lens === "decision" ? styles.inspectorActive : ""} onClick={() => setLens("decision")}>Decisión</button>
              <button className={lens === "evidence" ? styles.inspectorActive : ""} onClick={() => setLens("evidence")}>Evidencia</button>
              <button className={lens === "system" ? styles.inspectorActive : ""} onClick={() => setLens("system")}>Sistema</button>
            </div>
            {lens === "decision" && <DecisionLens scenario={scenario} />}
            {lens === "evidence" && <EvidenceLens />}
            {lens === "system" && <SystemLens />}
          </aside>
        )}

        <div className={styles.harnessMembrane}>
          <span className={styles.membraneLabel}>META-HARNESS</span>
          <div className={styles.membraneLine}>
            <i className={styles.membranePass} />
            <i className={styles.membranePass} />
            <i className={styles.membraneWarn} />
            <i className={styles.membraneBlock} />
            <i className={styles.membranePending} />
          </div>
          <div className={styles.membraneText}>
            <span>datos</span><span>modelo</span><span>claim</span><span>gate</span><span>humano</span>
          </div>
        </div>
      </section>
    </main>
  );
}
