"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/mining/ontology";
import { runDecisionWorkflow } from "@/lib/mining/praxios";
import styles from "./page.module.css";

const money = (value: number, currency: string) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export default function MiningWorkspace({ project }: { project: Project }) {
  const [decisionId, setDecisionId] = useState(project.decisions[0]?.id ?? "");
  const decision = project.decisions.find((item) => item.id === decisionId)!;
  const run = useMemo(() => runDecisionWorkflow(project, decisionId), [project, decisionId]);

  const evidenceById = new Map(project.evidence.map((e) => [e.id, e]));
  const sourceById = new Map(project.sources.map((s) => [s.id, s]));

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.eyebrow}>DEEP ANALYTICA</p>
          <h1>Mining Intelligence</h1>
          <p className={styles.muted}>Praxios OS × Meta-Harness</p>
        </div>
        <nav>
          <a className={styles.active}>Decisiones</a>
          <a>Activos</a>
          <a>Evidencia</a>
          <a>Forecasts</a>
          <a>Riesgos</a>
          <a>Deep Geo</a>
          <a>Audit</a>
        </nav>
        <div className={styles.trust}>
          <span>Trust core</span>
          <strong>{run.gate.status.toUpperCase()}</strong>
          <small>{run.gate.score}/100 readiness</small>
        </div>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <div className={styles.badges}>
              <span>Investor workspace</span>
              {project.demo && <span className={styles.demo}>DEMO DATA</span>}
            </div>
            <h2>{project.name}</h2>
            <p>{project.commodity} · {project.region} · {project.stage}</p>
          </div>
          <div className={styles.capital}>
            <span>Capital disponible</span>
            <strong>{money(project.capitalAvailable, project.currency)}</strong>
          </div>
        </header>

        <section className={styles.metrics}>
          <article><span>Evidencia</span><strong>{project.evidence.length}</strong><small>{project.evidence.filter(e => e.verified).length} verificada</small></article>
          <article><span>Afirmaciones</span><strong>{project.claims.length}</strong><small>separadas por nivel</small></article>
          <article><span>Riesgos materiales</span><strong>{project.risks.filter(r => ["high","critical"].includes(r.severity)).length}</strong><small>requieren tratamiento</small></article>
          <article><span>Decisiones</span><strong>{project.decisions.length}</strong><small>la llave es humana</small></article>
        </section>

        <section className={styles.grid}>
          <article className={styles.panelWide}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.eyebrow}>DECISION GRAPH</p>
                <h3>{decision.title}</h3>
                <p>{decision.question}</p>
              </div>
              <select value={decisionId} onChange={(e) => setDecisionId(e.target.value)}>
                {project.decisions.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
            </div>

            <div className={styles.options}>
              {decision.options.map((option) => (
                <div key={option.id} className={option.id === decision.proposedOptionId ? styles.optionFocus : styles.option}>
                  <div><span>{option.id}</span><strong>{option.label}</strong></div>
                  <b>{money(option.capital, option.currency)}</b>
                  <p>{option.rationale}</p>
                  <small>{option.reversible ? "Reversible" : "Compromiso alto"}</small>
                </div>
              ))}
            </div>
            <div className={styles.humanKey}>
              <div>
                <strong>La decisión sigue siendo humana.</strong>
                <p>El sistema compara evidencia, forecasts, riesgo e incertidumbre; no ejecuta la inversión.</p>
              </div>
              <span>{decision.humanDecision ? "DECIDIDO" : "PENDIENTE"}</span>
            </div>
          </article>

          <article className={styles.panel}>
            <p className={styles.eyebrow}>PRAXIOS RUN</p>
            <h3>Orquestación</h3>
            <div className={styles.steps}>
              {run.steps.map((step) => (
                <div key={step.id} className={styles.step}>
                  <span className={styles[step.status]} />
                  <p>{step.label}</p>
                  <small>{step.status}</small>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <p className={styles.eyebrow}>META-HARNESS</p>
            <h3>Gate de confianza</h3>
            <div className={styles.gauge}><strong>{run.gate.score}</strong><span>/100</span></div>
            {run.gate.blockers.map((f) => <div key={f.rule} className={styles.blocker}><b>{f.rule}</b><p>{f.message}</p></div>)}
            {run.gate.warnings.map((f) => <div key={f.rule} className={styles.warning}><b>{f.rule}</b><p>{f.message}</p></div>)}
          </article>

          <article className={styles.panelWide}>
            <p className={styles.eyebrow}>FORECAST</p>
            <h3>Series temporales con validación</h3>
            {project.forecasts.map((f) => (
              <div key={f.id} className={styles.forecast}>
                <div><span>{f.metric}</span><strong>{f.point} {f.unit}</strong><small>{f.lower}–{f.upper} · {f.horizon}</small></div>
                <div><span>Modelo</span><strong>{f.model}</strong><small>{f.backtestMetric} {f.backtestScore} vs baseline {f.baselineScore}</small></div>
                <div><span>Covariables</span><strong>{f.covariates.length}</strong><small>{f.covariates.join(" · ")}</small></div>
              </div>
            ))}
          </article>

          <article className={styles.panelWide}>
            <p className={styles.eyebrow}>TRACE</p>
            <h3>De la afirmación a la fuente</h3>
            <div className={styles.trace}>
              {project.claims.map((claim) => (
                <div key={claim.id} className={styles.claim}>
                  <div className={styles.claimTop}>
                    <span>{claim.level}</span>
                    <strong>{claim.confidence}</strong>
                  </div>
                  <p>{claim.statement}</p>
                  <div className={styles.evidenceRow}>
                    {claim.evidenceIds.map((id) => {
                      const evidence = evidenceById.get(id);
                      const source = evidence ? sourceById.get(evidence.sourceId) : undefined;
                      return (
                        <span key={id} title={source?.title}>
                          {id} · {evidence?.verified ? "verificada" : "pendiente"}
                        </span>
                      );
                    })}
                  </div>
                  {!!claim.uncertainty.length && <small>Incertidumbre: {claim.uncertainty.join(" · ")}</small>}
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
