use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum EpistemicLevel {
    Fact,
    Inference,
    Hypothesis,
    Forecast,
    Scenario,
    Recommendation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Evidence {
    pub id: String,
    pub verified: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claim {
    pub id: String,
    pub level: EpistemicLevel,
    pub evidence_ids: Vec<String>,
    pub uncertainty: Vec<String>,
    pub public_claim: bool,
    pub competent_signoff: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ForecastCheck {
    pub id: String,
    pub source_series: Vec<String>,
    pub model_error: f64,
    pub baseline_error: f64,
    pub lower: f64,
    pub point: f64,
    pub upper: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Decision {
    pub id: String,
    pub impact: String,
    pub option_count: usize,
    pub evidence_count: usize,
    pub uncertainties: Vec<String>,
    pub human_approval: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Severity {
    Blocker,
    Warning,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Finding {
    pub rule: String,
    pub severity: Severity,
    pub entity_id: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GateEvaluation {
    pub status: String,
    pub score: i32,
    pub findings: Vec<Finding>,
}

fn has_verified_evidence(ids: &[String], evidence: &[Evidence]) -> bool {
    ids.iter().any(|id| evidence.iter().any(|ev| &ev.id == id && ev.verified))
}

pub fn evaluate(
    evidence: &[Evidence],
    claims: &[Claim],
    forecasts: &[ForecastCheck],
    decision: &Decision,
) -> GateEvaluation {
    let mut findings = Vec::new();

    for claim in claims {
        if claim.level == EpistemicLevel::Fact && !has_verified_evidence(&claim.evidence_ids, evidence) {
            findings.push(Finding {
                rule: "MH-EVID-001".into(),
                severity: Severity::Blocker,
                entity_id: claim.id.clone(),
                message: "Fact requires verified linked evidence.".into(),
            });
        }

        if claim.level != EpistemicLevel::Fact && claim.uncertainty.is_empty() {
            findings.push(Finding {
                rule: "MH-UNC-001".into(),
                severity: Severity::Warning,
                entity_id: claim.id.clone(),
                message: "Non-fact claim must declare uncertainty.".into(),
            });
        }

        if claim.public_claim && !claim.competent_signoff {
            findings.push(Finding {
                rule: "MH-PUB-001".into(),
                severity: Severity::Blocker,
                entity_id: claim.id.clone(),
                message: "Public technical claim requires competent sign-off.".into(),
            });
        }
    }

    for forecast in forecasts {
        if forecast.source_series.is_empty() {
            findings.push(Finding {
                rule: "MH-FC-001".into(),
                severity: Severity::Blocker,
                entity_id: forecast.id.clone(),
                message: "Forecast requires source series.".into(),
            });
        }
        if !(forecast.lower <= forecast.point && forecast.point <= forecast.upper) {
            findings.push(Finding {
                rule: "MH-FC-002".into(),
                severity: Severity::Blocker,
                entity_id: forecast.id.clone(),
                message: "Prediction interval is inconsistent.".into(),
            });
        }
        if forecast.model_error >= forecast.baseline_error {
            findings.push(Finding {
                rule: "MH-FC-003".into(),
                severity: Severity::Warning,
                entity_id: forecast.id.clone(),
                message: "Forecast does not beat baseline in backtest.".into(),
            });
        }
    }

    if decision.option_count < 2 {
        findings.push(Finding {
            rule: "MH-DEC-001".into(),
            severity: Severity::Blocker,
            entity_id: decision.id.clone(),
            message: "Decision requires at least two explicit alternatives.".into(),
        });
    }

    if decision.evidence_count == 0 {
        findings.push(Finding {
            rule: "MH-DEC-003".into(),
            severity: Severity::Blocker,
            entity_id: decision.id.clone(),
            message: "Decision requires directly linked evidence.".into(),
        });
    }

    if decision.uncertainties.is_empty() {
        findings.push(Finding {
            rule: "MH-DEC-002".into(),
            severity: Severity::Blocker,
            entity_id: decision.id.clone(),
            message: "Decision must declare material uncertainties.".into(),
        });
    }

    if decision.impact == "high" && !decision.human_approval {
        findings.push(Finding {
            rule: "MH-KEY-001".into(),
            severity: Severity::Blocker,
            entity_id: decision.id.clone(),
            message: "High-impact decision requires explicit human approval.".into(),
        });
    }

    let blockers = findings.iter().filter(|f| f.severity == Severity::Blocker).count() as i32;
    let warnings = findings.iter().filter(|f| f.severity == Severity::Warning).count() as i32;
    let score = (100 - blockers * 30 - warnings * 8).max(0);

    GateEvaluation {
        status: if blockers > 0 { "hold".into() } else { "pass".into() },
        score,
        findings,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn blocks_fact_without_verified_evidence() {
        let claim = Claim {
            id: "C1".into(),
            level: EpistemicLevel::Fact,
            evidence_ids: vec!["E1".into()],
            uncertainty: vec![],
            public_claim: false,
            competent_signoff: false,
        };
        let decision = Decision {
            id: "D1".into(),
            impact: "low".into(),
            option_count: 2,
            evidence_count: 1,
            uncertainties: vec!["price".into()],
            human_approval: false,
        };
        let result = evaluate(&[], &[claim], &[], &decision);
        assert!(result.findings.iter().any(|f| f.rule == "MH-EVID-001"));
        assert_eq!(result.status, "hold");
    }

    #[test]
    fn human_key_blocks_high_impact_autonomy() {
        let decision = Decision {
            id: "D1".into(),
            impact: "high".into(),
            option_count: 3,
            evidence_count: 4,
            uncertainties: vec!["water".into()],
            human_approval: false,
        };
        let result = evaluate(&[], &[], &[], &decision);
        assert!(result.findings.iter().any(|f| f.rule == "MH-KEY-001"));
    }

    #[test]
    fn weaker_forecast_is_only_warning() {
        let forecast = ForecastCheck {
            id: "F1".into(),
            source_series: vec!["production".into()],
            model_error: 16.0,
            baseline_error: 14.0,
            lower: 80.0,
            point: 100.0,
            upper: 120.0,
        };
        let decision = Decision {
            id: "D1".into(),
            impact: "low".into(),
            option_count: 2,
            evidence_count: 1,
            uncertainties: vec!["market".into()],
            human_approval: false,
        };
        let result = evaluate(&[], &[], &[forecast], &decision);
        assert!(result.findings.iter().any(|f| f.rule == "MH-FC-003"));
        assert_eq!(result.status, "pass");
    }
}
