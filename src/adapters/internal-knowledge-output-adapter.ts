import type {
  AnswerBlocks,
  InternalKnowledgeOutput,
  MissingInfoChoice,
} from "../types/internal-knowledge";

/** Split prose into short bullets when model did not supply bullets. */
function deriveBullets(answer: string, bullets?: string[]): string[] {
  if (bullets && bullets.length > 0) {
    return bullets.map((b) => b.trim()).filter(Boolean);
  }

  const normalized = answer.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const byLine = normalized
    .split(/\n+/)
    .map((line) => line.replace(/^[\s・\-*]+/, "").trim())
    .filter(Boolean);

  if (byLine.length > 1) return byLine.slice(0, 5);

  const bySentence = normalized
    .split(/(?<=。)/)
    .map((s) => s.trim())
    .filter(Boolean);

  return bySentence.slice(0, 5);
}

function deriveMissingInfoChoices(
  output: InternalKnowledgeOutput,
): MissingInfoChoice[] {
  if (output.missingInfoChoices && output.missingInfoChoices.length > 0) {
    return output.missingInfoChoices;
  }

  return output.missingInformation.map((label, index) => ({
    id: `missing-${index + 1}`,
    label,
    appendText: label,
  }));
}

function deriveNextActions(output: InternalKnowledgeOutput): string[] {
  const fromWorkflow = output.workflowPreview.automationCandidates.filter(Boolean);
  if (fromWorkflow.length > 0) return fromWorkflow;

  const hints: string[] = [];
  if (output.approvers.length > 0) {
    hints.push(`承認者: ${output.approvers.join("、")}`);
  }
  if (output.responsibleDepartments.length > 0) {
    hints.push(`担当: ${output.responsibleDepartments.join("、")}`);
  }
  if (output.deadlines.length > 0) {
    hints.push(`期限: ${output.deadlines.join("、")}`);
  }
  return hints;
}

/**
 * Map adapter output to Answer Skeleton view model (Conversation UX P05).
 * Does not validate citations or call AI.
 */
export function toAnswerBlocks(output: InternalKnowledgeOutput): AnswerBlocks {
  return {
    status: output.status,
    conclusion: output.conclusion.trim(),
    bullets: deriveBullets(output.answer, output.bullets),
    procedures: output.requiredActions.filter(Boolean),
    nextActions: deriveNextActions(output),
    conditions: output.conditions.filter(Boolean),
    exceptions: output.exceptions.filter(Boolean),
    missingInformation: output.missingInformation.filter(Boolean),
    missingInfoChoices: deriveMissingInfoChoices(output),
    followUps: output.followUps ?? [],
    citations: output.citations,
    evidenceCollapsedByDefault: true,
  };
}
