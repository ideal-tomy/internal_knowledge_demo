import type { GuidedQuestionDef, IntentTree } from "../types/internal-knowledge";
import intentTreeJson from "../../data/sample/towa-corporate-rules-v1/intent-tree.json";
import { answerSkeletonFixtures } from "./answer-skeleton-fixtures";

export const phase3IntentTree = intentTreeJson as IntentTree;

/** Leaf guidedQuestionId → fixture mapping (Phase 3 mock). */
export const guidedQuestions: GuidedQuestionDef[] = [
  {
    id: "gq-half-day-wfh",
    question: "子どもの体調不良で午前半休を取り、午後から自宅で勤務できますか。",
    fixtureId: "conditional-half-day-wfh",
    difficulty: 2,
  },
  {
    id: "gq-emergency-purchase",
    question: "業務ツールを今日中に緊急購入したいのですが、誰の承認が必要ですか。",
    fixtureId: "needs-confirmation-purchase",
    difficulty: 3,
  },
  {
    id: "gq-flextime-core",
    question: "フレックスタイムのコアタイムは何時から何時までですか。",
    fixtureId: "not-found-custom-rule",
    difficulty: 1,
  },
];

export function findGuidedQuestion(id: string): GuidedQuestionDef | undefined {
  return guidedQuestions.find((q) => q.id === id);
}

export function findFixtureByGuidedQuestionId(guidedQuestionId: string) {
  const guided = findGuidedQuestion(guidedQuestionId);
  if (!guided) return undefined;
  return answerSkeletonFixtures.find((f) => f.id === guided.fixtureId);
}
