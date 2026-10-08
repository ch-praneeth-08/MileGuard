export interface ReadinessStage {
  complete: boolean;
  issues: string[];
}

export interface CustomerReadiness {
  readyForQuote: boolean;

  profile: ReadinessStage;
  agent: ReadinessStage;
  driver: ReadinessStage;
  vehicle: ReadinessStage;

  readinessIssues: string[];
}
