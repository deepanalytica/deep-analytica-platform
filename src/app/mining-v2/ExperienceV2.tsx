"use client";

import { useMemo, useState } from "react";
import { experienceData, Scenario, TrustState } from "@/lib/mining-v2/experienceData";
import TerrainTwin from "./TerrainTwin";
import styles from "./page.module.css";

type RailTab = "evidence" | "architecture" | "tests" | "math";

function StateBadge({ state }: { state: TrustState }) {
  const label = state === "verified" ? "Validado" : state === "conditional" ? "Condicional" : state === "blocked" ? "Bloqueo" : "Pendiente";
  return <span className={styles[state]}>{label}</span>;
}

function Sparkline() {
  return (
    <svg className={styles.sparkline} viewBox="0 0 260 70" role="img" aria-label="Serie histórica y rango de forecast ilustrativo">
      <defs>
        <linearGradient id="range" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#55d6c2" stopOpacity=".32" />
          <stop offset="100%" stopColor="#55d6c2" stopOpacity=".02" />
        </linearGradient>
      </defs>
      <path d="M8 52 L34 49 L59 53 L84 43 L109 41 L135 34 L160 31 L185 26 L210 22 L252 17 L252 43 L210 46 L185 48 L160 47 L135 45 Z" fill="url(#range)" />
      <polyline points="8,52 34,49 59,53 84,43 109,41 135,34" fill="none" stroke="#d4dde2" strokeWidth="2" />
      <polyline points="135,34 160,32 185,29 210,25 252,22" fill="none" stroke="#55d6c2" strokeWidth="2" strokeDasharray="5 4" />
      <circle cx="135" cy="34" r="3.5" fill="#e2b454" />
    </svg>
  );
}

function Rail({ tab, setTab }: { tab: RailTab; setTab: (tab: RailTab) => void }) {
  return (
    <aside className={styles.rail}>
      <div className={styles.railHead}>
        <div>
          <span>EVIDENCIA / CONFIANZA</span>
          <strong>Sin cajas negras</strong>
        </div>
        <button title="Filtrar">+</button>
      </div>
      <div className={styles.railTabs}>
        {(["evidence","architecture","tests","math"] as RailTab[]).map((item) => (
          <button key={item} onClick={() => setTab(item)} className={tab === item ? styles.railActive : ""}>
            {item === "evidence" ? "Evidencia" : item === "architecture" ? "Arquitectura" : item === "tests" ? "Pruebas" : "Matemática"}
          </button>
        ))}
      </div>

      <div className={styles.railBody}>
        {tab === "evidence" && experienceData.evidence.map((item) => (
          <article className={styles.evidenceItem} key={item.id}>
            <div className={styles.evidenceIcon}>{item.id.split("-")[1]}</div>
            <div>
              <strong>{item.title}</strong>
              <p>{item.source} · actualizado hace {item.updated}</p>
              <small>{item.note}</small>
            </div>
            <StateBadge state={item.state} />
          </article>
        ))}

        {tab === "architecture" && (
          <div className={styles.architecture}>
            {experienceData.architecture.map(([name, text], index) => (
              <article key={name}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{name}</strong><p>{text}</p></div>
              </article>
            ))}
            <div className={styles.archFlow}>
              <span>Deep Geo</span><i>→</i><span>Praxios</span><i>→</i><span>Meta-Harness</span><i>→</i><span>Humano</span>
            </div>
          </div>
        )}

        {tab === "tests" && (
          <div className={styles.testList}>
            {experienceData.tests.map(([id, name, state]) => (
              <article key={id}>
                <div><b>{id}</b><strong>{name}</strong></div>
                <span className={state === "definido" ? styles.testDefined : styles.testPending}>{state}</span>
              </article>
            ))}
            <p className={styles.disclaimer}>La interfaz distingue reglas definidas de pruebas realmente ejecutadas. No se presenta un check verde sin evidencia de ejecución.</p>
          </div>
        )}

        {tab === "math" && (
          <div className={styles.math}>
            <article><span>Trust gate v0.1</span><strong>S = max(0, 100 − 30B − 8W)</strong><p>B = bloqueos · W = advertencias. Regla operacional, no probabilidad.</p></article>
            <article><span>Forecast gate</span><strong>E(model) &lt; E(baseline)</strong><p>Si no supera baseline en backtest, el forecast no gana peso decisional.</p></article>
            <article><span>Epistemic transition</span><strong>Source → Evidence → Claim → Decision</strong><p>Una inferencia no puede mutar silenciosamente a hecho.</p></article>
            <article><span>Human key</span><strong>impact = high ⇒ approval ≠ ∅</strong><p>La arquitectura bloquea ejecución sin decisión humana explícita.</p></article>
          </div>
        )}
      </div>
    </aside>
  );
}

function ScenarioCard({ scenario, active, onSelect }: { scenario: Scenario; active: boolean; onSelect: () => void }) {
  return (
    <button className={active ? styles.scenarioActive : styles.scenario} onClick={onSelect}>
      <div className={styles.scenarioTitle}><span>{scenario.id}</span><div><strong>{scenario.label}</strong><small>{scenario.subtitle}</small></div></div>
      <div className={styles.scenarioMetrics}>
        <div><span>Capital</span><b>{scenario.capital}</b></div>
        <div><span>Horizonte</span><b>{scenario.horizon}</b></div>
        <div><span>Valor escenario</span><b>{scenario.value}</b></div>
        <div><span>Retorno</span><b>{scenario.returnMetric}</b></div>
      </div>
      <p>{scenario.summary}</p>
    </button>
  );
}

export default function ExperienceV2() {
  const [railTab, setRailTab] = useState<RailTab>("evidence");
  const [scenarioId, setScenarioId] = useState("A");
  const selected = useMemo(() => experienceData.scenarios.find((s) => s.id === scenarioId)!, [scenarioId]);

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
          <p>FROM EARTH DATA<br/>TO BETTER DECISIONS</p>
        </div>
        <nav>
          <button className={styles.navActive}>Decisión</button>
          <button>Portafolio</button>
          <button>Exploración</button>
          <button>Operaciones</button>
          <button>Mercado</button>
          <button>Riesgo</button>
        </nav>
        <div className={styles.system}>
          <span><i /> Praxios OS</span>
          <button onClick={logout}>Salir</button>
        </div>
      </header>

      <aside className={styles.leftbar}>
        {["⌂","◎","◇","△","≋","!","▥"].map((icon, index) => (
          <button key={index} className={index === 1 ? styles.leftActive : ""}><b>{icon}</b><span>{["Inicio","Deep Geo","Decisiones","Escenarios","Evidencia","Riesgos","Mercado"][index]}</span></button>
        ))}
        <small>V2 · PRIVATE</small>
      </aside>

      <section className={styles.command}>
        <div className={styles.activeDecision}>
          <span>DECISIÓN ACTIVA</span>
          <strong>Expandir Operación Los Andes</strong>
          <small>{experienceData.project.subtitle}</small>
        </div>
        <div><span>CAPITAL EN JUEGO</span><strong>{experienceData.project.capital}</strong><small>escenario seleccionado</small></div>
        <div><span>HORIZONTE</span><strong>{experienceData.project.horizon}</strong><small>ventana estratégica</small></div>
        <div className={styles.trustKpi}>
          <span>ESTADO DE CONFIANZA</span>
          <div className={styles.ring} style={{ "--score": experienceData.project.trust } as React.CSSProperties}><b>{experienceData.project.trust}%</b></div>
          <small>{experienceData.project.trustLabel}</small>
        </div>
        <div className={styles.nextAction}><span>ACCIÓN PENDIENTE</span><strong>{experienceData.project.nextAction}</strong><button>Ver bloqueos →</button></div>
      </section>

      <section className={styles.workspace}>
        <div className={styles.center}>
          <TerrainTwin />

          <section className={styles.scenarios}>
            <div className={styles.sectionHead}>
              <div><span>ESCENARIOS / COMPARAR</span><strong>Evalúa alternativas. La decisión es tuya.</strong></div>
              <div className={styles.scenarioMeta}><span>Seleccionado</span><b>{selected.label}</b></div>
            </div>
            <div className={styles.scenarioGrid}>
              {experienceData.scenarios.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario} active={scenario.id === scenarioId} onSelect={() => setScenarioId(scenario.id)} />
              ))}
              <article className={styles.forecastCard}>
                <div><span>SERIE / FORECAST</span><strong>Producción mensual</strong></div>
                <Sparkline />
                <div className={styles.forecastMeta}><span>TimesFM adapter</span><span>sMAPE 11.8</span><span>baseline 15.6</span></div>
                <small>Rango predictivo visible; forecast ≠ hecho observado.</small>
              </article>
            </div>
          </section>

          <section className={styles.harnessBar}>
            <div className={styles.harnessIntro}><span>META-HARNESS</span><strong>Membrana de confianza y trazabilidad</strong></div>
            <div className={styles.harnessFlow}>
              <div className={styles.flowOk}><b>Datos</b><small>3 fuentes condicionadas</small></div>
              <i>→</i>
              <div className={styles.flowWarn}><b>Modelos</b><small>1 advertencia</small></div>
              <i>→</i>
              <div className={styles.flowBlock}><b>Afirmaciones</b><small>2 bloqueos</small></div>
              <i>→</i>
              <div className={styles.flowWarn}><b>Decisión</b><small>espera validación</small></div>
            </div>
            <div className={styles.harnessAction}><p>La decisión no puede avanzar mientras existan afirmaciones críticas sin evidencia suficiente.</p><button onClick={() => setRailTab("tests")}>Abrir pruebas →</button></div>
          </section>
        </div>

        <Rail tab={railTab} setTab={setRailTab} />
      </section>

      <section className={styles.approval}>
        <div><span>PRAXIOS / ACCIÓN</span><strong>4 · Revisión técnica y financiera</strong><small>La aprobación humana sigue pendiente.</small></div>
        <ol>
          <li className={styles.done}>Análisis multifuente</li>
          <li className={styles.warn}>Validación Meta-Harness</li>
          <li>Revisión técnica</li>
          <li>Aprobación humana</li>
          <li>Ejecución / monitoreo</li>
        </ol>
        <div className={styles.approvalButtons}><button>Solicitar más análisis</button><button disabled>Aprobar siguiente fase</button></div>
      </section>
    </main>
  );
}
