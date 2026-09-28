"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./praxios.module.css";
import { fixtureRuntime } from "./lib/fixture";
import { remoteRuntime } from "./lib/client";
import type {
  Action,
  AppMode,
  Authorization,
  Claim,
  CreateClaimInput,
  CreateEvidenceInput,
  Decision,
  EpistemicClass,
  GateStatus,
  PraxiosSnapshot,
  RuntimeHealth,
} from "./lib/types";

type ViewId =
  | "overview"
  | "mission"
  | "orchestration"
  | "evidence"
  | "claims"
  | "decision"
  | "actions"
  | "ledger"
  | "architecture"
  | "settings";

const VIEWS: Array<{ id: ViewId; label: string; code: string }> = [
  { id: "overview", label: "Overview", code: "OV" },
  { id: "mission", label: "Mission", code: "MI" },
  { id: "orchestration", label: "Orchestration", code: "OR" },
  { id: "evidence", label: "Evidence", code: "EV" },
  { id: "claims", label: "Claims", code: "CL" },
  { id: "decision", label: "Decision Room", code: "DR" },
  { id: "actions", label: "Actions", code: "AC" },
  { id: "ledger", label: "Event Ledger", code: "LG" },
  { id: "architecture", label: "Architecture", code: "AR" },
  { id: "settings", label: "Settings", code: "ST" },
];

const PHASES = ["OBSERVE", "REASON", "PROPOSE", "VERIFY", "AUTHORIZE", "EXECUTE", "OBSERVE"];

const ARCH = [
  { title: "EL PUENTE", role: "Epistemic doctrine", body: "Imagination is allowed to explore. Authority is earned through evidence, instruments, refutation and explicit epistemic state." },
  { title: "Mathematical Harness", role: "Formal layer", body: "Epistemic states, promotion rules, transfer constraints and refutational structure are made explicit enough to be inspected and computed." },
  { title: "The Shark", role: "Adversarial operator", body: "A role with no incentive to help a result survive. It attacks provenance, alternative explanations, reproducibility, instruments and debt." },
  { title: "Meta-Harness", role: "Assurance plane", body: "The policy decision point between model output and accepted claims or executable actions. PASS, REVIEW and BLOCK are first-class states." },
  { title: "PRAXIOS OS", role: "Execution plane", body: "Owns canonical state, tasks, tools, checkpoints, authorizations, decisions, actions and outcomes outside any individual language model." },
  { title: "Decision Room", role: "Human authority", body: "Projects canonical state for judgment. Findings, unknowns, excluded claims, risks and options remain distinct from action authorization." },
  { title: "Inverse Reality Lab", role: "Research domain", body: "Uses terminal observations and constraints to reduce the space of compatible histories while preserving non-identifiability when evidence cannot discriminate." },
];

function statusTone(status?: string | null) {
  if (status === "PASS" || status === "APPROVED" || status === "COMPLETED" || status === "EXECUTED") return styles.tonePass;
  if (status === "BLOCK" || status === "DENIED" || status === "FAILED") return styles.toneBlock;
  if (status === "REVIEW" || status === "PENDING" || status === "PROPOSED") return styles.toneReview;
  return styles.toneNeutral;
}

function shortId(id?: string | null) {
  if (!id) return "—";
  return id.length > 18 ? id.slice(0, 9) + "…" + id.slice(-5) : id;
}

function relativeTime(value?: string | null) {
  if (!value) return "—";
  const ms = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(ms)) return value;
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return minutes + "m";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h";
  return Math.floor(hours / 24) + "d";
}

function gateCounts(claims: Claim[]) {
  const out = { PASS: 0, REVIEW: 0, BLOCK: 0 };
  for (const claim of claims) {
    if (claim.verdict && claim.verdict in out) out[claim.verdict as GateStatus] += 1;
  }
  return out;
}

function latestDebt(snapshot: PraxiosSnapshot | null) {
  if (!snapshot) return "No mission loaded.";
  const blocked = snapshot.state.claims.find((claim) => claim.verdict === "BLOCK");
  if (blocked) return "Blocked claim " + blocked.id + ": " + blocked.text;
  const review = snapshot.state.claims.find((claim) => claim.verdict === "REVIEW" || !claim.verdict);
  if (review) return "Open epistemic debt on " + review.id + ": " + review.text;
  if (!snapshot.state.evidence.length) return "No evidence has been registered yet.";
  return "No blocking debt detected in the current fixture state.";
}

export default function PraxiosAppPage() {
  const [mode, setMode] = useState<AppMode>("fixture");
  const [view, setView] = useState<ViewId>("overview");
  const [health, setHealth] = useState<RuntimeHealth | null>(null);
  const [snapshot, setSnapshot] = useState<PraxiosSnapshot | null>(null);
  const [sessions, setSessions] = useState<PraxiosSnapshot[]>([]);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [remoteSessionId, setRemoteSessionId] = useState("");
  const [selectedClaimId, setSelectedClaimId] = useState<string>("");
  const [selectedArch, setSelectedArch] = useState(3);
  const [audit, setAudit] = useState<Record<string, unknown> | null>(null);

  const [missionGoal, setMissionGoal] = useState("Assess whether the available evidence supports an operational conclusion and identify the next discriminating measurement.");
  const [evidenceForm, setEvidenceForm] = useState<CreateEvidenceInput>({
    kind: "reported",
    summary: "",
    sourceTitle: "",
    sourceUri: "",
    peerReviewed: false,
    uncertainty: "",
  });
  const [claimForm, setClaimForm] = useState<CreateClaimInput>({
    text: "",
    epistemic: "HYPOTHESIS",
    evidenceIds: [],
    method: "",
    uncertainty: "",
    confidence: null,
    identifiability: "I0",
    requestedUse: "internal",
    requireIndependentReview: true,
  });
  const [reviewSummary, setReviewSummary] = useState("Independent review completed. No promotion beyond the evidence is authorized.");
  const [actionForm, setActionForm] = useState({
    title: "Create bounded measurement-design artifact",
    executor: "measurement-design",
    effect: "write",
    payload: '{"purpose":"next discriminating measurement"}',
  });
  const [authReason, setAuthReason] = useState("Human authority approves this exact bounded action.");
  const [decisionRationale, setDecisionRationale] = useState("Selected after reviewing findings, unknowns, exclusions and action boundaries.");

  const [plannerProvider, setPlannerProvider] = useState("openai");
  const [plannerModel, setPlannerModel] = useState("");
  const [workerProvider, setWorkerProvider] = useState("openai");
  const [workerModel, setWorkerModel] = useState("");
  const [verifierProvider, setVerifierProvider] = useState("anthropic");
  const [verifierModel, setVerifierModel] = useState("");

  const claims = snapshot?.state.claims || [];
  const evidence = snapshot?.state.evidence || [];
  const selectedClaim = useMemo(
    () => claims.find((claim) => claim.id === selectedClaimId) || claims[0] || null,
    [claims, selectedClaimId],
  );
  const counts = useMemo(() => gateCounts(claims), [claims]);
  const findings = claims.filter((claim) => claim.verdict === "PASS");
  const unknowns = claims.filter((claim) => claim.verdict === "REVIEW" || !claim.verdict);
  const excluded = claims.filter((claim) => claim.verdict === "BLOCK");
  const pendingAuth = snapshot?.state.authorizations.filter((item) => item.status === "PENDING") || [];

  useEffect(() => {
    const storedMode = window.localStorage.getItem("praxios.webos.mode");
    if (storedMode === "remote" || storedMode === "fixture") setMode(storedMode);
    const storedAdmin = window.sessionStorage.getItem("praxios.webos.adminToken");
    if (storedAdmin) setAdminToken(storedAdmin);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("praxios.webos.mode", mode);
    void bootstrap(mode);
  }, [mode]);

  useEffect(() => {
    if (selectedClaim && !selectedClaimId) setSelectedClaimId(selectedClaim.id);
  }, [selectedClaim, selectedClaimId]);

  async function bootstrap(nextMode: AppMode) {
    setError("");
    setNotice("");
    setAudit(null);
    if (nextMode === "fixture") {
      const list = fixtureRuntime.listSessions();
      setSessions(list);
      setHealth(fixtureRuntime.health());
      if (list[0]) {
        setSnapshot(list[0]);
        setSelectedClaimId(list[0].state.claims[0]?.id || "");
      } else {
        setSnapshot(null);
      }
      return;
    }
    try {
      const remoteHealth = await remoteRuntime.health();
      setHealth({ ...remoteHealth, mode: remoteHealth.ok ? "remote" : "unconfigured" });
      setSessions([]);
      setSnapshot(null);
    } catch (cause) {
      setHealth({ ok: false, mode: "unconfigured", error: cause instanceof Error ? cause.message : "Runtime unavailable." });
      setSnapshot(null);
    }
  }

  function clearMessages() {
    setError("");
    setNotice("");
  }

  async function createMission(event?: FormEvent) {
    event?.preventDefault();
    clearMessages();
    if (missionGoal.trim().length < 8) return setError("Mission goal is too short.");
    setBusy("create-session");
    try {
      const next = mode === "fixture"
        ? fixtureRuntime.createSession(missionGoal.trim())
        : await remoteRuntime.createSession(missionGoal.trim());
      setSnapshot(next);
      setSelectedClaimId(next.state.claims[0]?.id || "");
      if (mode === "fixture") setSessions(fixtureRuntime.listSessions());
      setView("mission");
      setNotice("Mission created. Canonical state is now active.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create mission.");
    } finally {
      setBusy("");
    }
  }

  async function attachRemote(event: FormEvent) {
    event.preventDefault();
    clearMessages();
    if (!remoteSessionId.trim()) return;
    setBusy("attach");
    try {
      const next = await remoteRuntime.getSession(remoteSessionId.trim());
      setSnapshot(next);
      setSelectedClaimId(next.state.claims[0]?.id || "");
      setNotice("Remote session attached.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not attach session.");
    } finally {
      setBusy("");
    }
  }

  async function refreshSnapshot() {
    if (!snapshot) return;
    clearMessages();
    try {
      const next = mode === "fixture"
        ? fixtureRuntime.getSession(snapshot.state.sessionId)
        : await remoteRuntime.getSession(snapshot.state.sessionId);
      setSnapshot(next);
      if (mode === "fixture") setSessions(fixtureRuntime.listSessions());
      setNotice("Canonical snapshot refreshed.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Refresh failed.");
    }
  }

  async function addEvidence(event: FormEvent) {
    event.preventDefault();
    if (!snapshot) return;
    clearMessages();
    if (!evidenceForm.summary.trim()) return setError("Evidence summary is required.");
    setBusy("evidence");
    try {
      const result = mode === "fixture"
        ? fixtureRuntime.addEvidence(snapshot.state.sessionId, evidenceForm)
        : await remoteRuntime.addEvidence(snapshot.state.sessionId, evidenceForm);
      setSnapshot(result.snapshot);
      if (mode === "fixture") setSessions(fixtureRuntime.listSessions());
      setEvidenceForm({ kind: "reported", summary: "", sourceTitle: "", sourceUri: "", peerReviewed: false, uncertainty: "" });
      setNotice("Evidence registered in canonical state.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Evidence registration failed.");
    } finally {
      setBusy("");
    }
  }

  async function addClaim(event: FormEvent) {
    event.preventDefault();
    if (!snapshot) return;
    clearMessages();
    if (!claimForm.text.trim()) return setError("Claim text is required.");
    setBusy("claim");
    try {
      const result = mode === "fixture"
        ? fixtureRuntime.addClaim(snapshot.state.sessionId, claimForm)
        : await remoteRuntime.addClaim(snapshot.state.sessionId, claimForm);
      setSnapshot(result.snapshot);
      const created = (result.claim as { id?: string })?.id;
      if (created) setSelectedClaimId(created);
      if (mode === "fixture") setSessions(fixtureRuntime.listSessions());
      setClaimForm((value) => ({ ...value, text: "", method: "", uncertainty: "", confidence: null }));
      setNotice("Claim admitted as PROPOSED. It has not been verified.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Claim admission failed.");
    } finally {
      setBusy("");
    }
  }

  async function reviewAndVerify(claim: Claim) {
    if (!snapshot) return;
    clearMessages();
    setBusy("verify:" + claim.id);
    try {
      let next: PraxiosSnapshot;
      if (mode === "fixture") {
        next = fixtureRuntime.reviewClaim(snapshot.state.sessionId, claim.id, reviewSummary);
        const verified = fixtureRuntime.verifyClaim(snapshot.state.sessionId, claim.id);
        next = verified.snapshot;
      } else {
        const reviewed = await remoteRuntime.reviewClaim(snapshot.state.sessionId, claim.id, {
          summary: reviewSummary,
          uncertainty: claim.uncertainty || "Uncertainty reviewed in Web OS.",
          identifiability: claim.identifiability,
        });
        const verified = await remoteRuntime.verifyClaim(reviewed.snapshot.state.sessionId, claim.id);
        next = verified.snapshot;
      }
      setSnapshot(next);
      if (mode === "fixture") setSessions(fixtureRuntime.listSessions());
      setNotice("Independent review recorded and Meta-Harness evaluation executed.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Verification failed.");
    } finally {
      setBusy("");
    }
  }

  async function verifyOnly(claim: Claim) {
    if (!snapshot) return;
    clearMessages();
    setBusy("verify:" + claim.id);
    try {
      const result = mode === "fixture"
        ? fixtureRuntime.verifyClaim(snapshot.state.sessionId, claim.id)
        : await remoteRuntime.verifyClaim(snapshot.state.sessionId, claim.id);
      setSnapshot(result.snapshot);
      if (mode === "fixture") setSessions(fixtureRuntime.listSessions());
      setNotice("Meta-Harness gates executed.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Verification failed.");
    } finally {
      setBusy("");
    }
  }

  async function requestAuthorization(event: FormEvent) {
    event.preventDefault();
    if (!snapshot) return;
    clearMessages();
    setBusy("authorization");
    try {
      let payload: unknown = null;
      try {
        payload = actionForm.payload.trim() ? JSON.parse(actionForm.payload) : null;
      } catch {
        throw new Error("Action payload must be valid JSON.");
      }
      const input = {
        title: actionForm.title,
        executor: actionForm.executor,
        effect: actionForm.effect,
        payload,
        requiredClaimIds: findings.map((claim) => claim.id),
        claimThreshold: "PASS" as const,
      };
      const result = mode === "fixture"
        ? fixtureRuntime.requestAuthorization(snapshot.state.sessionId, input)
        : await remoteRuntime.requestAuthorization(snapshot.state.sessionId, input);
      setSnapshot(result.snapshot);
      if (mode === "fixture") setSessions(fixtureRuntime.listSessions());
      setNotice("Action passed through claim dependencies and authorization request.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authorization request failed.");
    } finally {
      setBusy("");
    }
  }

  async function decideAuthorization(item: Authorization, approved: boolean) {
    if (!snapshot) return;
    clearMessages();
    setBusy("auth:" + item.id);
    try {
      let next: PraxiosSnapshot;
      if (mode === "fixture") {
        next = fixtureRuntime.decideAuthorization(snapshot.state.sessionId, item.id, approved, authReason);
      } else {
        const result = await remoteRuntime.decideAuthorization(
          snapshot.state.sessionId,
          item.id,
          approved,
          authReason,
          adminToken,
        );
        next = result.snapshot;
      }
      setSnapshot(next);
      if (mode === "fixture") setSessions(fixtureRuntime.listSessions());
      setNotice(approved ? "Exact action approved by human authority." : "Action denied by human authority.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authorization decision failed.");
    } finally {
      setBusy("");
    }
  }

  async function executeAction(action: Action) {
    if (!snapshot) return;
    clearMessages();
    setBusy("execute:" + action.id);
    try {
      const authorization = snapshot.state.authorizations.find((item) => item.actionId === action.id && item.status === "APPROVED" && !item.consumed);
      const result = mode === "fixture"
        ? fixtureRuntime.executeAction(snapshot.state.sessionId, action.id)
        : await remoteRuntime.executeAction(snapshot.state.sessionId, action, authorization?.id || null);
      setSnapshot(result.snapshot);
      if (mode === "fixture") setSessions(fixtureRuntime.listSessions());
      setNotice("Action executed and outcome returned to OBSERVE.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Execution failed.");
    } finally {
      setBusy("");
    }
  }

  async function selectDecision(decision: Decision, optionId: string) {
    if (!snapshot) return;
    clearMessages();
    setBusy("decision:" + decision.id);
    try {
      let next: PraxiosSnapshot;
      if (mode === "fixture") {
        next = fixtureRuntime.selectDecision(snapshot.state.sessionId, decision.id, optionId, decisionRationale);
      } else {
        const result = await remoteRuntime.selectDecision(
          snapshot.state.sessionId,
          decision.id,
          optionId,
          decisionRationale,
          adminToken,
        );
        next = result.snapshot;
      }
      setSnapshot(next);
      if (mode === "fixture") setSessions(fixtureRuntime.listSessions());
      setNotice("Human decision recorded separately from action authorization.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Decision selection failed.");
    } finally {
      setBusy("");
    }
  }

  async function runAudit() {
    if (!snapshot) return;
    clearMessages();
    setBusy("audit");
    try {
      const result = mode === "fixture"
        ? fixtureRuntime.audit(snapshot.state.sessionId)
        : await remoteRuntime.audit(snapshot.state.sessionId);
      setAudit(result as Record<string, unknown>);
      setNotice(result.ok ? "Audit passed." : "Audit reported a mismatch.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Audit failed.");
    } finally {
      setBusy("");
    }
  }

  async function runOrchestration(event: FormEvent) {
    event.preventDefault();
    clearMessages();
    if (!missionGoal.trim()) return;
    setBusy("orchestrate");
    try {
      if (mode === "fixture") {
        let next = fixtureRuntime.createSession(missionGoal.trim());
        const ev = fixtureRuntime.addEvidence(next.state.sessionId, {
          kind: "synthetic",
          summary: "Fixture orchestration seed. This is not independent evidence.",
          sourceTitle: "PRAXIOS Web OS fixture",
          sourceUri: "",
          uncertainty: "Synthetic demo evidence.",
        });
        next = ev.snapshot;
        const cl = fixtureRuntime.addClaim(next.state.sessionId, {
          text: "The mission requires independent evidence before an operational conclusion can be authorized.",
          epistemic: "HYPOTHESIS",
          evidenceIds: [ev.evidence.id],
          uncertainty: "Fixture mode cannot supply an independent Outside.",
          identifiability: "I0",
          requestedUse: "internal",
          requireIndependentReview: true,
        });
        next = cl.snapshot;
        next = fixtureRuntime.reviewClaim(next.state.sessionId, cl.claim.id, "Fixture independent-review role executed.");
        next = fixtureRuntime.verifyClaim(next.state.sessionId, cl.claim.id).snapshot;
        setSnapshot(next);
        setSessions(fixtureRuntime.listSessions());
        setSelectedClaimId(cl.claim.id);
        setNotice("Fixture orchestration completed. Synthetic evidence remains REVIEW-bound.");
      } else {
        if (!plannerModel || !workerModel || !verifierModel) {
          throw new Error("Planner, worker and verifier models are required in Remote mode.");
        }
        const result = await remoteRuntime.orchestrate({
          goal: missionGoal.trim(),
          planner: { provider: plannerProvider, model: plannerModel },
          workers: {
            analyst: { provider: workerProvider, model: workerModel },
          },
          verifier: { provider: verifierProvider, model: verifierModel },
          actor: "human:webos",
          decision: {
            id: "DR-WEBOS-001",
            title: "PRAXIOS Web OS decision package",
            situation: missionGoal.trim(),
            risks: ["Do not promote REVIEW/BLOCK claims into operational premises."],
          },
        });
        setSnapshot(result.snapshot);
        setSelectedClaimId(result.snapshot.state.claims[0]?.id || "");
        setNotice("Canonical remote orchestration completed.");
      }
      setView("overview");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Orchestration failed.");
    } finally {
      setBusy("");
    }
  }

  function saveAdminToken(value: string) {
    setAdminToken(value);
    if (value) window.sessionStorage.setItem("praxios.webos.adminToken", value);
    else window.sessionStorage.removeItem("praxios.webos.adminToken");
  }

  function resetFixture() {
    if (mode !== "fixture") return;
    fixtureRuntime.reset();
    setSessions([]);
    setSnapshot(null);
    setAudit(null);
    setSelectedClaimId("");
    setNotice("Local fixture state cleared.");
  }

  function renderOverview() {
    return (
      <>
        <div className={styles.pageHeader}>
          <div>
            <span className={styles.kicker}>CONTROL PLANE / LIVE STATE</span>
            <h1>Mission overview</h1>
            <p>Canonical state, assurance status, open debt and human authority in one surface.</p>
          </div>
          <button className={styles.secondaryButton} onClick={() => void refreshSnapshot()} disabled={!snapshot}>Refresh state</button>
        </div>

        {!snapshot ? (
          <EmptyMission onStart={() => setView("mission")} />
        ) : (
          <>
            <div className={styles.metricGrid}>
              <Metric label="Revision" value={String(snapshot.state.revision)} detail={snapshot.state.status} />
              <Metric label="Evidence" value={String(evidence.length)} detail={evidence.filter((item) => item.peerReviewed).length + " peer-reviewed"} />
              <Metric label="Claims" value={String(claims.length)} detail={counts.PASS + " PASS · " + counts.REVIEW + " REVIEW · " + counts.BLOCK + " BLOCK"} />
              <Metric label="Authorizations" value={String(snapshot.state.authorizations.length)} detail={pendingAuth.length + " pending"} />
            </div>

            <section className={styles.commandGrid}>
              <article className={styles.phaseCard}>
                <div className={styles.panelTitle}><span>PRAXIOS LOOP</span><b>{snapshot.state.phase}</b></div>
                <div className={styles.phaseLoop}>
                  {PHASES.map((phase, index) => (
                    <div key={phase + index} className={phase === snapshot.state.phase ? styles.phaseActive : styles.phaseNode}>
                      <span>{String(index + 1).padStart(2, "0")}</span><strong>{phase}</strong>
                    </div>
                  ))}
                </div>
              </article>

              <article className={styles.debtCard}>
                <div className={styles.panelTitle}><span>OPEN DEBT</span><b>BOOK</b></div>
                <div className={styles.debtBody}>
                  <span>THE CURRENT WEAK LINK</span>
                  <p>{latestDebt(snapshot)}</p>
                  <button onClick={() => setView("claims")}>Inspect claims →</button>
                </div>
              </article>
            </section>

            <section className={styles.assuranceGrid}>
              <article className={styles.assuranceCard}>
                <div className={styles.panelTitle}><span>META-HARNESS</span><b>CLAIM ASSURANCE</b></div>
                <div className={styles.verdictStack}>
                  <div><span className={styles.tonePass}>PASS</span><strong>{counts.PASS}</strong><small>Admissible under current gates</small></div>
                  <div><span className={styles.toneReview}>REVIEW</span><strong>{counts.REVIEW}</strong><small>Debt or uncertainty remains</small></div>
                  <div><span className={styles.toneBlock}>BLOCK</span><strong>{counts.BLOCK}</strong><small>Must not ascend</small></div>
                </div>
              </article>
              <article className={styles.sharkCard}>
                <div className={styles.panelTitle}><span>THE SHARK</span><b>ADVERSARIAL PRESSURE</b></div>
                <div className={styles.sharkBody}>
                  <strong>What would kill the current conclusion?</strong>
                  <p>Look for missing provenance, same-actor verification, weak identifiability, alternative explanations and action premises that depend on non-PASS claims.</p>
                  <button onClick={() => setView("ledger")}>Trace the process →</button>
                </div>
              </article>
            </section>

            <section className={styles.latestEvents}>
              <div className={styles.panelTitle}><span>LATEST EVENTS</span><b>{snapshot.ledger.length} TOTAL</b></div>
              {snapshot.ledger.slice(-6).reverse().map((event) => (
                <div className={styles.eventRow} key={event.seq}>
                  <time>{String(event.seq).padStart(4, "0")}</time>
                  <strong>{event.type}</strong>
                  <span>{event.actor || "system"}</span>
                  <em>{relativeTime(event.timestamp)}</em>
                </div>
              ))}
            </section>
          </>
        )}
      </>
    );
  }

  function renderMission() {
    return (
      <>
        <div className={styles.pageHeader}>
          <div><span className={styles.kicker}>MISSION CONTROL</span><h1>Mission</h1><p>Create or attach a canonical PRAXIOS session.</p></div>
        </div>
        <div className={styles.twoCol}>
          <form className={styles.formCard} onSubmit={createMission}>
            <div className={styles.panelTitle}><span>NEW MISSION</span><b>{mode.toUpperCase()}</b></div>
            <label>Goal<textarea value={missionGoal} onChange={(e) => setMissionGoal(e.target.value)} maxLength={1600} /></label>
            <button className={styles.primaryButton} disabled={busy === "create-session"}>{busy === "create-session" ? "Creating…" : "Create canonical session"}</button>
          </form>
          <section className={styles.formCard}>
            <div className={styles.panelTitle}><span>ACTIVE SESSION</span><b>{snapshot ? shortId(snapshot.state.sessionId) : "NONE"}</b></div>
            {snapshot ? (
              <div className={styles.detailList}>
                <Detail label="Goal" value={snapshot.state.goal || "—"} />
                <Detail label="Status" value={snapshot.state.status} />
                <Detail label="Phase" value={snapshot.state.phase} />
                <Detail label="Revision" value={String(snapshot.state.revision)} />
                <Detail label="Updated" value={snapshot.state.updatedAt || "—"} />
              </div>
            ) : <p className={styles.muted}>No session loaded.</p>}
            {mode === "remote" ? (
              <form className={styles.inlineForm} onSubmit={attachRemote}>
                <label>Attach by session ID<input value={remoteSessionId} onChange={(e) => setRemoteSessionId(e.target.value)} placeholder="session-…" /></label>
                <button className={styles.secondaryButton} disabled={busy === "attach"}>Attach</button>
              </form>
            ) : null}
          </section>
        </div>
        {mode === "fixture" && sessions.length ? (
          <section className={styles.tableCard}>
            <div className={styles.panelTitle}><span>LOCAL SESSIONS</span><b>{sessions.length}</b></div>
            {sessions.map((item) => (
              <button key={item.state.sessionId} className={styles.sessionRow} onClick={() => {
                setSnapshot(fixtureRuntime.getSession(item.state.sessionId));
                setSelectedClaimId(item.state.claims[0]?.id || "");
              }}>
                <span>{shortId(item.state.sessionId)}</span><strong>{item.state.goal}</strong><em>{relativeTime(item.state.updatedAt)}</em>
              </button>
            ))}
          </section>
        ) : null}
      </>
    );
  }

  function renderOrchestration() {
    return (
      <>
        <div className={styles.pageHeader}>
          <div><span className={styles.kicker}>PLANNER → WORKERS → VERIFIER</span><h1>Orchestration</h1><p>Execute a governed multi-model goal through the canonical runtime or a clearly marked local fixture.</p></div>
        </div>
        <form className={styles.formCard} onSubmit={runOrchestration}>
          <label>Goal<textarea value={missionGoal} onChange={(e) => setMissionGoal(e.target.value)} maxLength={1600} /></label>
          <div className={styles.modelGrid}>
            <ModelSlot title="PLANNER" provider={plannerProvider} model={plannerModel} setProvider={setPlannerProvider} setModel={setPlannerModel} disabled={mode === "fixture"} />
            <ModelSlot title="WORKER / ANALYST" provider={workerProvider} model={workerModel} setProvider={setWorkerProvider} setModel={setWorkerModel} disabled={mode === "fixture"} />
            <ModelSlot title="INDEPENDENT VERIFIER" provider={verifierProvider} model={verifierModel} setProvider={setVerifierProvider} setModel={setVerifierModel} disabled={mode === "fixture"} />
          </div>
          <div className={styles.callout}>
            {mode === "fixture"
              ? "Fixture mode creates synthetic evidence and deliberately keeps the main claim REVIEW-bound. It does not call an LLM."
              : "Remote mode delegates through /api/orchestrate. Provider keys stay server-side in the PRAXIOS runtime."}
          </div>
          <button className={styles.primaryButton} disabled={busy === "orchestrate"}>{busy === "orchestrate" ? "Running…" : "Run governed orchestration"}</button>
        </form>
      </>
    );
  }

  function renderEvidence() {
    return (
      <>
        <div className={styles.pageHeader}>
          <div><span className={styles.kicker}>THE OUTSIDE / INSTRUMENTS</span><h1>Evidence registry</h1><p>Evidence is registered before claims can borrow authority from it.</p></div>
        </div>
        {!snapshot ? <EmptyMission onStart={() => setView("mission")} /> : (
          <div className={styles.twoColWide}>
            <section className={styles.tableCard}>
              <div className={styles.panelTitle}><span>REGISTERED EVIDENCE</span><b>{evidence.length}</b></div>
              {evidence.length ? evidence.map((item) => (
                <article className={styles.evidenceRow} key={item.id}>
                  <div><span>{item.id}</span><strong>{item.summary}</strong></div>
                  <div className={styles.evidenceMeta}><b>{item.kind}</b><span>{item.peerReviewed ? "PEER REVIEWED" : "NOT PEER REVIEWED"}</span></div>
                  <p>{item.source?.title || "No source title"}{item.source?.uri ? " · " + item.source.uri : ""}</p>
                  <small>{item.uncertainty || "No uncertainty statement."}</small>
                </article>
              )) : <p className={styles.emptyText}>No evidence registered.</p>}
            </section>
            <form className={styles.formCard} onSubmit={addEvidence}>
              <div className={styles.panelTitle}><span>ADD EVIDENCE</span><b>CANONICAL</b></div>
              <label>Kind<select value={evidenceForm.kind} onChange={(e) => setEvidenceForm({ ...evidenceForm, kind: e.target.value })}><option value="reported">reported</option><option value="publication">publication</option><option value="measurement">measurement</option><option value="derived">derived</option><option value="user_input">user_input</option><option value="synthetic">synthetic</option></select></label>
              <label>Summary<textarea value={evidenceForm.summary} onChange={(e) => setEvidenceForm({ ...evidenceForm, summary: e.target.value })} /></label>
              <label>Source title<input value={evidenceForm.sourceTitle || ""} onChange={(e) => setEvidenceForm({ ...evidenceForm, sourceTitle: e.target.value })} /></label>
              <label>Source URI<input value={evidenceForm.sourceUri || ""} onChange={(e) => setEvidenceForm({ ...evidenceForm, sourceUri: e.target.value })} placeholder="https://…" /></label>
              <label>Uncertainty<input value={evidenceForm.uncertainty || ""} onChange={(e) => setEvidenceForm({ ...evidenceForm, uncertainty: e.target.value })} /></label>
              <label className={styles.checkLabel}><input type="checkbox" checked={Boolean(evidenceForm.peerReviewed)} onChange={(e) => setEvidenceForm({ ...evidenceForm, peerReviewed: e.target.checked })} /> Peer reviewed</label>
              <button className={styles.primaryButton} disabled={busy === "evidence"}>Register evidence</button>
            </form>
          </div>
        )}
      </>
    );
  }

  function renderClaims() {
    return (
      <>
        <div className={styles.pageHeader}>
          <div><span className={styles.kicker}>CLAIM → REVIEW → GATES</span><h1>Claim assurance</h1><p>Claims never become authoritative just because a model produced them.</p></div>
        </div>
        {!snapshot ? <EmptyMission onStart={() => setView("mission")} /> : (
          <>
            <div className={styles.claimWorkspace}>
              <aside className={styles.claimList}>
                <div className={styles.panelTitle}><span>CLAIMS</span><b>{claims.length}</b></div>
                {claims.map((claim) => (
                  <button key={claim.id} className={selectedClaim?.id === claim.id ? styles.claimItemActive : styles.claimItem} onClick={() => setSelectedClaimId(claim.id)}>
                    <i className={statusTone(claim.verdict || claim.status)} />
                    <div><strong>{claim.id}</strong><p>{claim.text}</p></div>
                    <span className={statusTone(claim.verdict || claim.status)}>{claim.verdict || claim.status}</span>
                  </button>
                ))}
                {!claims.length ? <p className={styles.emptyText}>No claims proposed.</p> : null}
              </aside>

              <section className={styles.claimInspector}>
                <div className={styles.panelTitle}><span>CLAIM INSPECTOR</span><b>{selectedClaim?.id || "NONE"}</b></div>
                {selectedClaim ? (
                  <div className={styles.inspectorBody}>
                    <div className={styles.claimLead}><span className={statusTone(selectedClaim.verdict || selectedClaim.status)}>{selectedClaim.verdict || selectedClaim.status}</span><h3>{selectedClaim.text}</h3></div>
                    <div className={styles.detailGrid}>
                      <Detail label="Epistemic class" value={selectedClaim.epistemic} />
                      <Detail label="Identifiability" value={selectedClaim.identifiability} />
                      <Detail label="Requested use" value={selectedClaim.requestedUse} />
                      <Detail label="Evidence links" value={selectedClaim.evidenceIds.join(", ") || "none"} />
                    </div>
                    <div className={styles.gateGrid}>
                      {selectedClaim.gates.length ? selectedClaim.gates.map((gate) => (
                        <article key={gate.id} className={styles.gateCard}><span className={statusTone(gate.status)}>{gate.status}</span><strong>{gate.id}</strong><p>{gate.reason}</p></article>
                      )) : <div className={styles.callout}>Claim has not crossed Meta-Harness gates yet.</div>}
                    </div>
                    <label className={styles.fullLabel}>Independent review note<textarea value={reviewSummary} onChange={(e) => setReviewSummary(e.target.value)} /></label>
                    <div className={styles.buttonRow}>
                      <button className={styles.secondaryButton} onClick={() => void verifyOnly(selectedClaim)} disabled={busy === "verify:" + selectedClaim.id}>Run gates only</button>
                      <button className={styles.primaryButton} onClick={() => void reviewAndVerify(selectedClaim)} disabled={busy === "verify:" + selectedClaim.id}>Review + verify</button>
                    </div>
                  </div>
                ) : <p className={styles.emptyText}>Select a claim.</p>}
              </section>
            </div>

            <form className={styles.formCard} onSubmit={addClaim}>
              <div className={styles.panelTitle}><span>PROPOSE CLAIM</span><b>NO AUTO-PROMOTION</b></div>
              <label>Claim<textarea value={claimForm.text} onChange={(e) => setClaimForm({ ...claimForm, text: e.target.value })} /></label>
              <div className={styles.formGrid}>
                <label>Epistemic class<select value={claimForm.epistemic} onChange={(e) => setClaimForm({ ...claimForm, epistemic: e.target.value as EpistemicClass })}><option>OBSERVED</option><option>PUBLISHED</option><option>DERIVED</option><option>INFERRED</option><option>HYPOTHESIS</option><option>COUNTERFACTUAL</option><option>UNKNOWN</option></select></label>
                <label>Identifiability<select value={claimForm.identifiability} onChange={(e) => setClaimForm({ ...claimForm, identifiability: e.target.value as CreateClaimInput["identifiability"] })}><option>I0</option><option>I1</option><option>I2</option><option>I3</option></select></label>
                <label>Requested use<select value={claimForm.requestedUse} onChange={(e) => setClaimForm({ ...claimForm, requestedUse: e.target.value })}><option value="internal">internal</option><option value="decision">decision</option><option value="publication">publication</option></select></label>
                <label>Confidence<input type="number" min="0" max="1" step="0.01" value={claimForm.confidence ?? ""} onChange={(e) => setClaimForm({ ...claimForm, confidence: e.target.value === "" ? null : Number(e.target.value) })} /></label>
              </div>
              <label>Method<input value={claimForm.method || ""} onChange={(e) => setClaimForm({ ...claimForm, method: e.target.value })} /></label>
              <label>Uncertainty<input value={claimForm.uncertainty || ""} onChange={(e) => setClaimForm({ ...claimForm, uncertainty: e.target.value })} /></label>
              <fieldset className={styles.evidencePicker}><legend>Evidence links</legend>{evidence.map((item) => <label key={item.id}><input type="checkbox" checked={claimForm.evidenceIds.includes(item.id)} onChange={(e) => setClaimForm({ ...claimForm, evidenceIds: e.target.checked ? [...claimForm.evidenceIds, item.id] : claimForm.evidenceIds.filter((id) => id !== item.id) })} /> {item.id} · {item.summary}</label>)}</fieldset>
              <label className={styles.checkLabel}><input type="checkbox" checked={claimForm.requireIndependentReview} onChange={(e) => setClaimForm({ ...claimForm, requireIndependentReview: e.target.checked })} /> Require independent review</label>
              <button className={styles.primaryButton} disabled={busy === "claim"}>Admit as PROPOSED</button>
            </form>
          </>
        )}
      </>
    );
  }

  function renderDecisionRoom() {
    return (
      <>
        <div className={styles.pageHeader}><div><span className={styles.kicker}>HUMAN JUDGMENT</span><h1>Control & Decision Room</h1><p>Findings, unknowns, excluded claims and options stay visibly separated.</p></div></div>
        {!snapshot ? <EmptyMission onStart={() => setView("mission")} /> : (
          <>
            <div className={styles.decisionColumns}>
              <DecisionBucket title="FINDINGS" tone="PASS" items={findings} empty="No PASS findings." />
              <DecisionBucket title="UNKNOWNS" tone="REVIEW" items={unknowns} empty="No open unknowns." />
              <DecisionBucket title="EXCLUDED" tone="BLOCK" items={excluded} empty="No blocked claims." />
            </div>
            <label className={styles.fullLabel}>Human rationale<textarea value={decisionRationale} onChange={(e) => setDecisionRationale(e.target.value)} /></label>
            <div className={styles.decisionPackages}>
              {snapshot.state.decisions.map((decision) => (
                <article className={styles.decisionCard} key={decision.id}>
                  <div className={styles.panelTitle}><span>{decision.question || "DECISION PACKAGE"}</span><b>{decision.status || "OPEN"}</b></div>
                  <div className={styles.decisionOptions}>
                    {decision.options.map((option) => (
                      <button key={option.id} onClick={() => void selectDecision(decision, option.id)} disabled={busy === "decision:" + decision.id || decision.status === "SELECTED"}>
                        <span>{option.id}</span><strong>{option.label}</strong><p>{option.description || ""}</p><small>{option.requiresClaimIds?.length ? "Requires PASS: " + option.requiresClaimIds.join(", ") : "No claim dependency"}</small>
                      </button>
                    ))}
                  </div>
                  {decision.selectedOptionId ? <p className={styles.selection}>Selected: <strong>{decision.selectedOptionId}</strong> · {decision.rationale}</p> : null}
                </article>
              ))}
              {!snapshot.state.decisions.length ? <div className={styles.callout}>No decision package exists yet. Orchestration creates one, or Local Fixture seeds a minimal package.</div> : null}
            </div>
          </>
        )}
      </>
    );
  }

  function renderActions() {
    return (
      <>
        <div className={styles.pageHeader}><div><span className={styles.kicker}>AUTHORIZATION ≠ DECISION</span><h1>Actions & authority</h1><p>Effectful actions require exact, single-use human authorization after claim dependencies pass.</p></div></div>
        {!snapshot ? <EmptyMission onStart={() => setView("mission")} /> : (
          <div className={styles.twoColWide}>
            <section>
              <form className={styles.formCard} onSubmit={requestAuthorization}>
                <div className={styles.panelTitle}><span>PROPOSE ACTION</span><b>BOUND EXECUTION</b></div>
                <label>Title<input value={actionForm.title} onChange={(e) => setActionForm({ ...actionForm, title: e.target.value })} /></label>
                <div className={styles.formGrid}>
                  <label>Executor<select value={actionForm.executor} onChange={(e) => setActionForm({ ...actionForm, executor: e.target.value })}><option value="measurement-design">measurement-design</option><option value="echo">echo</option><option value="unregistered">unregistered (wall test)</option></select></label>
                  <label>Effect<select value={actionForm.effect} onChange={(e) => setActionForm({ ...actionForm, effect: e.target.value })}><option value="none">none</option><option value="write">write</option><option value="external">external</option><option value="publish">publish</option></select></label>
                </div>
                <label>Payload JSON<textarea value={actionForm.payload} onChange={(e) => setActionForm({ ...actionForm, payload: e.target.value })} /></label>
                <p className={styles.muted}>Required claims are bound automatically to the current PASS findings.</p>
                <button className={styles.primaryButton} disabled={busy === "authorization"}>Request authorization</button>
              </form>
              <label className={styles.fullLabel}>Authority rationale<textarea value={authReason} onChange={(e) => setAuthReason(e.target.value)} /></label>
            </section>
            <section className={styles.tableCard}>
              <div className={styles.panelTitle}><span>AUTHORIZATIONS</span><b>{snapshot.state.authorizations.length}</b></div>
              {snapshot.state.authorizations.map((item) => {
                const action = snapshot.state.actions.find((candidate) => candidate.id === item.actionId) || item.action;
                return (
                  <article className={styles.authCard} key={item.id}>
                    <div><span>{shortId(item.id)}</span><strong>{action?.title || item.actionId}</strong><b className={statusTone(item.status)}>{item.status}</b></div>
                    <p>{item.reason || "No reason recorded."}</p>
                    <small>{action?.executor || "unknown executor"} · effect {action?.effect || "none"} · {item.consumed ? "CONSUMED" : "UNUSED"}</small>
                    <div className={styles.buttonRow}>
                      {item.status === "PENDING" ? <><button className={styles.secondaryButton} onClick={() => void decideAuthorization(item, false)}>Deny</button><button className={styles.primaryButton} onClick={() => void decideAuthorization(item, true)}>Approve exact action</button></> : null}
                      {item.status === "APPROVED" && action && !item.consumed ? <button className={styles.primaryButton} onClick={() => void executeAction(action)}>Execute once</button> : null}
                    </div>
                  </article>
                );
              })}
              {!snapshot.state.authorizations.length ? <p className={styles.emptyText}>No authorization requests.</p> : null}
            </section>
          </div>
        )}
      </>
    );
  }

  function renderLedger() {
    return (
      <>
        <div className={styles.pageHeader}><div><span className={styles.kicker}>APPEND-ONLY TRACE</span><h1>Event ledger</h1><p>Inspect state transitions and audit the process independently of the final narrative.</p></div><button className={styles.primaryButton} onClick={() => void runAudit()} disabled={!snapshot || busy === "audit"}>Run audit</button></div>
        {!snapshot ? <EmptyMission onStart={() => setView("mission")} /> : (
          <>
            {audit ? <div className={audit.ok ? styles.auditPass : styles.auditBlock}><strong>{audit.ok ? "AUDIT PASS" : "AUDIT ISSUE"}</strong><pre>{JSON.stringify(audit, null, 2)}</pre></div> : null}
            <section className={styles.ledgerCard}>
              <div className={styles.panelTitle}><span>EVENTS</span><b>{snapshot.ledger.length}</b></div>
              {snapshot.ledger.slice().reverse().map((event) => (
                <article className={styles.ledgerRow} key={event.seq}>
                  <span>{String(event.seq).padStart(4, "0")}</span><strong>{event.type}</strong><b>{event.actor || "system"}</b><time>{event.timestamp}</time>
                  <pre>{JSON.stringify(event.payload || {}, null, 2)}</pre>
                </article>
              ))}
            </section>
          </>
        )}
      </>
    );
  }

  function renderArchitecture() {
    return (
      <>
        <div className={styles.pageHeader}><div><span className={styles.kicker}>SYSTEM GENEALOGY</span><h1>Architecture</h1><p>The web application is a surface over a deeper execution and assurance model.</p></div></div>
        <div className={styles.archShell}>
          <aside>{ARCH.map((item, index) => <button className={selectedArch === index ? styles.archActive : styles.archNode} onClick={() => setSelectedArch(index)} key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.title}</strong><small>{item.role}</small></div></button>)}</aside>
          <article><span>{ARCH[selectedArch].role}</span><h2>{ARCH[selectedArch].title}</h2><p>{ARCH[selectedArch].body}</p><div className={styles.archRule}><strong>Invariant</strong><p>No layer may claim more authority than the evidence and authorization state it inherits.</p></div></article>
        </div>
      </>
    );
  }

  function renderSettings() {
    return (
      <>
        <div className={styles.pageHeader}><div><span className={styles.kicker}>RUNTIME / SECURITY</span><h1>Settings</h1><p>Switch runtime modes and inspect the boundary between browser, gateway and canonical PRAXIOS server.</p></div></div>
        <div className={styles.twoCol}>
          <section className={styles.formCard}>
            <div className={styles.panelTitle}><span>RUNTIME MODE</span><b>{mode.toUpperCase()}</b></div>
            <div className={styles.modeButtons}>
              <button className={mode === "fixture" ? styles.modeActive : ""} onClick={() => setMode("fixture")}><strong>Local Fixture</strong><span>Browser-local deterministic state. Safe for demos. No LLM calls.</span></button>
              <button className={mode === "remote" ? styles.modeActive : ""} onClick={() => setMode("remote")}><strong>Remote Runtime</strong><span>Server-side gateway to canonical PRAXIOS runtime. Provider keys stay off the browser.</span></button>
            </div>
            <div className={styles.healthBox}>
              <span className={health?.ok ? styles.tonePass : styles.toneReview}>{health?.ok ? "CONNECTED" : "NOT CONNECTED"}</span>
              <strong>{health?.service || "runtime unknown"}</strong>
              <p>{health?.error || "Version " + (health?.version || "—")}</p>
              <small>Encrypted persistence: {String(Boolean(health?.encryptedPersistence))} · Separate human authority: {String(Boolean(health?.separateHumanAuthority))}</small>
            </div>
          </section>
          <section className={styles.formCard}>
            <div className={styles.panelTitle}><span>HUMAN AUTHORITY</span><b>SESSION SECRET</b></div>
            <label>App-admin token<input type="password" value={adminToken} onChange={(e) => saveAdminToken(e.target.value)} placeholder="Required only for remote authorization/decision writes" /></label>
            <div className={styles.callout}>The browser never receives PRAXIOS_RUNTIME_TOKEN or PRAXIOS_HUMAN_TOKEN. The app-admin token is checked by the Next.js gateway and kept only in sessionStorage.</div>
            {mode === "fixture" ? <button className={styles.dangerButton} onClick={resetFixture}>Reset local fixture state</button> : null}
          </section>
        </div>
        <section className={styles.securityMap}>
          <div><strong>BROWSER</strong><span>UI state · app-admin token optional</span></div><i>→</i><div><strong>NEXT GATEWAY</strong><span>runtime bearer token · authority check</span></div><i>→</i><div><strong>PRAXIOS RUNTIME</strong><span>encrypted state · models · executors · ledger</span></div>
        </section>
      </>
    );
  }

  let content: React.ReactNode;
  if (view === "overview") content = renderOverview();
  else if (view === "mission") content = renderMission();
  else if (view === "orchestration") content = renderOrchestration();
  else if (view === "evidence") content = renderEvidence();
  else if (view === "claims") content = renderClaims();
  else if (view === "decision") content = renderDecisionRoom();
  else if (view === "actions") content = renderActions();
  else if (view === "ledger") content = renderLedger();
  else if (view === "architecture") content = renderArchitecture();
  else content = renderSettings();

  return (
    <main className={styles.root}>
      <div className={styles.gridGlow} />
      <header className={styles.topbar}>
        <a className={styles.brand} href="/praxios"><span>PX</span><div><strong>PRAXIOS OS</strong><small>CONTROL & DECISION ROOM</small></div></a>
        <div className={styles.topStatus}>
          <span className={health?.ok ? styles.statusDotLive : styles.statusDotReview} />
          <b>{mode === "fixture" ? "LOCAL FIXTURE" : health?.ok ? "REMOTE RUNTIME" : "REMOTE UNAVAILABLE"}</b>
          {snapshot ? <em>{shortId(snapshot.state.sessionId)} · R{snapshot.state.revision}</em> : <em>NO ACTIVE MISSION</em>}
        </div>
        <button className={styles.newMissionButton} onClick={() => setView("mission")}>+ Mission</button>
      </header>

      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLabel}>SYSTEM</div>
          <nav>{VIEWS.map((item) => <button key={item.id} className={view === item.id ? styles.navActive : styles.navItem} onClick={() => setView(item.id)}><span>{item.code}</span><strong>{item.label}</strong>{item.id === "claims" && claims.length ? <em>{claims.length}</em> : null}{item.id === "actions" && pendingAuth.length ? <em>{pendingAuth.length}</em> : null}</button>)}</nav>
          <div className={styles.sidebarFooter}><span>AUTHORITY</span><strong>HUMAN</strong><small>Decision ≠ authorization</small></div>
        </aside>

        <section className={styles.workspace}>
          {(notice || error) ? <div className={error ? styles.errorBanner : styles.noticeBanner}><strong>{error ? "ISSUE" : "EVENT"}</strong><span>{error || notice}</span><button onClick={clearMessages}>×</button></div> : null}
          {content}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className={styles.metric}><span>{label}</span><strong>{value}</strong><p>{detail}</p></article>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className={styles.detail}><span>{label}</span><strong>{value}</strong></div>;
}

function EmptyMission({ onStart }: { onStart: () => void }) {
  return <div className={styles.emptyMission}><span>NO CANONICAL SESSION</span><h2>Start with a mission.</h2><p>PRAXIOS state does not live in the chat. Create a session to register evidence, claims, reviews, authorizations and decisions.</p><button className={styles.primaryButton} onClick={onStart}>Create mission →</button></div>;
}

function ModelSlot({
  title,
  provider,
  model,
  setProvider,
  setModel,
  disabled,
}: {
  title: string;
  provider: string;
  model: string;
  setProvider: (value: string) => void;
  setModel: (value: string) => void;
  disabled: boolean;
}) {
  return <div className={styles.modelSlot}><span>{title}</span><label>Provider<input value={provider} disabled={disabled} onChange={(e) => setProvider(e.target.value)} /></label><label>Model<input value={model} disabled={disabled} onChange={(e) => setModel(e.target.value)} placeholder={disabled ? "fixture" : "model id"} /></label></div>;
}

function DecisionBucket({ title, tone, items, empty }: { title: string; tone: GateStatus; items: Claim[]; empty: string }) {
  return <article className={styles.decisionBucket}><div className={styles.panelTitle}><span>{title}</span><b className={statusTone(tone)}>{tone}</b></div>{items.length ? items.map((claim) => <div key={claim.id}><span>{claim.id}</span><p>{claim.text}</p></div>) : <p className={styles.emptyText}>{empty}</p>}</article>;
}
