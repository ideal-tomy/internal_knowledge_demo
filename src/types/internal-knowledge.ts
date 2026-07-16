/** Demo Definition §12.4 / Conversation UX §5.3 */

/** Demo Definition §8 Experience State */
export type KnowledgeDemoState =
  | "browsing_knowledge"
  | "ready"
  | "searching"
  | "cross_checking"
  | "generating"
  | "succeeded"
  | "needs_information"
  | "not_found"
  | "limited"
  | "failed";

/** P04 Progressive Status labels (no percentage). */
export const RETRIEVAL_PROGRESS_STEPS = [
  "関連規程を確認しています",
  "条件と例外を照合しています",
  "根拠と次の手続きを整理しています",
] as const;

export type RetrievalProgressStepIndex = 0 | 1 | 2;

/** Conversation UX §5.1 Intent Tree */
export type IntentNode = {
  id: string;
  label: string;
  description?: string;
  children?: IntentNode[];
  guidedQuestionId?: string;
  clarifyOptions?: Array<{
    id: string;
    label: string;
    appendText: string;
  }>;
};

export type IntentTree = {
  packId: string;
  version: string;
  roots: IntentNode[];
};

export type GuidedQuestionDef = {
  id: string;
  question: string;
  fixtureId: string;
  difficulty: 1 | 2 | 3;
};

export type AnswerStatus =
  | "allowed"
  | "conditional"
  | "needs_confirmation"
  | "not_allowed"
  | "not_found";

export type FollowUpAction =
  | "resend_variant"
  | "open_evidence"
  | "open_document"
  | "clarify"
  | "ask_related";

export type FollowUpChip = {
  id: string;
  label: string;
  action: FollowUpAction;
  payload?: Record<string, string>;
};

export type MissingInfoChoice = {
  id: string;
  label: string;
  appendText: string;
};

export type Citation = {
  documentId: string;
  documentTitle: string;
  sectionId: string;
  sectionTitle: string;
  articleNumber?: string;
  excerpt: string;
  reason: string;
};

export interface InternalKnowledgeOutput {
  status: AnswerStatus;
  conclusion: string;
  answer: string;
  bullets?: string[];
  conditions: string[];
  exceptions: string[];
  requiredActions: string[];
  requiredDocuments: string[];
  approvers: string[];
  responsibleDepartments: string[];
  deadlines: string[];
  missingInformation: string[];
  missingInfoChoices?: MissingInfoChoice[];
  followUps?: FollowUpChip[];
  citations: Citation[];
  workflowPreview: {
    routingTarget?: string;
    formType?: string;
    suggestedFields: Record<string, string | number | boolean | null>;
    automationCandidates: string[];
  };
}

/** UI view model for P05 Answer Skeleton */
export type AnswerBlocks = {
  status: AnswerStatus;
  conclusion: string;
  bullets: string[];
  procedures: string[];
  nextActions: string[];
  conditions: string[];
  exceptions: string[];
  missingInformation: string[];
  missingInfoChoices: MissingInfoChoice[];
  followUps: FollowUpChip[];
  citations: Citation[];
  evidenceCollapsedByDefault: true;
};
