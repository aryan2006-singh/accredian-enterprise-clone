export interface FrameworkStep {
  step: number;
  title: string;
  description: string;
}

export const frameworkSteps: FrameworkStep[] = [
  { step: 1, title: 'Assess', description: "Identify skill gaps and training priorities against your team's goals." },
  { step: 2, title: 'Design', description: 'Build a customized program roadmap mapped to those priorities.' },
  { step: 3, title: 'Deliver', description: 'Run flexible, trackable sessions and report on measurable outcomes.' },
];
