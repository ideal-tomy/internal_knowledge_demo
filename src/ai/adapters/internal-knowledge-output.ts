import type {
  AnswerStatus,
  Citation,
  FollowUpAction,
  FollowUpChip,
  InternalKnowledgeOutput,
  MissingInfoChoice,
} from "../../types/internal-knowledge";
import type { ScoredChunk } from "../retrieve";

const STATUSES: AnswerStatus[] = [
  "allowed",
  "conditional",
  "needs_confirmation",
  "not_allowed",
  "not_found",
];

const FOLLOW_UP_ACTIONS: FollowUpAction[] = [
  "resend_variant",
  "open_evidence",
  "open_document",
  "clarify",
  "ask_related",
];

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(asString).filter(Boolean);
}

function asStatus(value: unknown): AnswerStatus {
  if (typeof value === "string" && STATUSES.includes(value as AnswerStatus)) {
    return value as AnswerStatus;
  }
  return "needs_confirmation";
}

function asMissingChoices(value: unknown): MissingInfoChoice[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const label = asString(row.label);
      if (!label) return null;
      return {
        id: asString(row.id) || `missing-${index + 1}`,
        label,
        appendText: asString(row.appendText) || label,
      };
    })
    .filter((x): x is MissingInfoChoice => x !== null);
}

function asFollowUps(value: unknown): FollowUpChip[] {
  if (!Array.isArray(value)) return [];
  const chips: FollowUpChip[] = [];
  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const label = asString(row.label);
    const actionRaw = asString(row.action);
    if (!label || !FOLLOW_UP_ACTIONS.includes(actionRaw as FollowUpAction)) {
      continue;
    }
    const action = actionRaw as FollowUpAction;
    let payload: Record<string, string> | undefined;
    if (row.payload && typeof row.payload === "object") {
      payload = Object.fromEntries(
        Object.entries(row.payload as Record<string, unknown>).map(([k, v]) => [
          k,
          String(v),
        ]),
      );
    }
    chips.push({
      id: asString(row.id) || `fu-${index + 1}`,
      label,
      action,
      payload,
    });
  }
  return chips.slice(0, 5);
}

function asCitations(value: unknown, hits: ScoredChunk[]): Citation[] {
  const byKey = new Map(
    hits.map((h) => [`${h.documentId}:${h.sectionId}`, h] as const),
  );

  if (!Array.isArray(value)) return [];

  const citations: Citation[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const documentId = asString(row.documentId);
    const sectionId = asString(row.sectionId);
    if (!documentId || !sectionId) continue;
    if (!byKey.has(`${documentId}:${sectionId}`)) continue;

    const hit = byKey.get(`${documentId}:${sectionId}`);
    const citation: Citation = {
      documentId,
      documentTitle:
        asString(row.documentTitle) || hit?.documentTitle || documentId,
      sectionId,
      sectionTitle: asString(row.sectionTitle) || hit?.sectionTitle || sectionId,
      excerpt: asString(row.excerpt) || hit?.excerpt || "",
      reason: asString(row.reason) || "回答の根拠",
    };
    const articleNumber = asString(row.articleNumber) || hit?.articleNumber;
    if (articleNumber) citation.articleNumber = articleNumber;
    citations.push(citation);
  }
  return citations;
}

function ensureEvidenceFollowUp(
  followUps: FollowUpChip[],
  citations: Citation[],
): FollowUpChip[] {
  if (citations.length === 0) return followUps;
  if (followUps.some((f) => f.action === "open_evidence")) return followUps;
  const evidenceChip: FollowUpChip = {
    id: "fu-evidence-auto",
    label: "根拠を見る",
    action: "open_evidence",
  };
  return [evidenceChip, ...followUps].slice(0, 5);
}

function emptyWorkflow() {
  return {
    suggestedFields: {} as Record<string, string | number | boolean | null>,
    automationCandidates: [] as string[],
  };
}

/** Parse LLM JSON text into InternalKnowledgeOutput; fall back using hits. */
export function parseInternalKnowledgeAiResult(
  text: string,
  hits: ScoredChunk[],
): InternalKnowledgeOutput {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return synthesizeFromHits(hits, "JSONの解析に失敗したため、検索結果のみを示します。");
  }

  if (!raw || typeof raw !== "object") {
    return synthesizeFromHits(hits, "回答形式が不正だったため、検索結果のみを示します。");
  }

  const row = raw as Record<string, unknown>;
  const citations = asCitations(row.citations, hits);
  const followUps = ensureEvidenceFollowUp(asFollowUps(row.followUps), citations);

  const workflowRaw =
    row.workflowPreview && typeof row.workflowPreview === "object"
      ? (row.workflowPreview as Record<string, unknown>)
      : {};

  const suggestedFields =
    workflowRaw.suggestedFields && typeof workflowRaw.suggestedFields === "object"
      ? (workflowRaw.suggestedFields as Record<
          string,
          string | number | boolean | null
        >)
      : {};

  return {
    status: asStatus(row.status),
    conclusion:
      asString(row.conclusion) ||
      "ナレッジに基づく結論を整理できませんでした。根拠を確認してください。",
    answer: asString(row.answer) || asString(row.conclusion),
    bullets: asStringArray(row.bullets),
    conditions: asStringArray(row.conditions),
    exceptions: asStringArray(row.exceptions),
    requiredActions: asStringArray(row.requiredActions),
    requiredDocuments: asStringArray(row.requiredDocuments),
    approvers: asStringArray(row.approvers),
    responsibleDepartments: asStringArray(row.responsibleDepartments),
    deadlines: asStringArray(row.deadlines),
    missingInformation: asStringArray(row.missingInformation),
    missingInfoChoices: asMissingChoices(row.missingInfoChoices),
    followUps,
    citations,
    workflowPreview: {
      routingTarget: asString(workflowRaw.routingTarget) || undefined,
      formType: asString(workflowRaw.formType) || undefined,
      suggestedFields,
      automationCandidates: asStringArray(workflowRaw.automationCandidates),
    },
  };
}

/** Sample-mode / fallback answer from retrieved chunks (no LLM). */
export function synthesizeFromHits(
  hits: ScoredChunk[],
  preface?: string,
): InternalKnowledgeOutput {
  if (hits.length === 0) {
    return {
      status: "not_found",
      conclusion:
        "選択中のナレッジパックには、質問に対応する箇所が見つかりませんでした。推測では回答しません。",
      answer: "関連チャンクが取得できませんでした。",
      bullets: ["ナレッジ内に該当箇所なし", "一般知識での補完は行わない"],
      conditions: [],
      exceptions: [],
      requiredActions: ["所管部署へ確認する", "質問の言い回しを変えて再検索する"],
      requiredDocuments: [],
      approvers: [],
      responsibleDepartments: [],
      deadlines: [],
      missingInformation: [],
      followUps: [],
      citations: [],
      workflowPreview: emptyWorkflow(),
    };
  }

  const top = hits.slice(0, 3);
  const citations: Citation[] = top.map((h) => ({
    documentId: h.documentId,
    documentTitle: h.documentTitle,
    sectionId: h.sectionId,
    sectionTitle: h.sectionTitle,
    articleNumber: h.articleNumber,
    excerpt: h.excerpt,
    reason: "質問との関連度が高い箇所",
  }));

  return {
    status: "conditional",
    conclusion:
      preface ??
      "関連する規程箇所を見つけました。条件と例外を原文で確認したうえで判断してください。",
    answer: top.map((h) => `${h.documentTitle} / ${h.sectionTitle}: ${h.excerpt}`).join("\n"),
    bullets: top.map(
      (h) =>
        `${h.documentTitle}${h.articleNumber ? ` ${h.articleNumber}` : ""}: ${h.sectionTitle}`,
    ),
    conditions: ["原文の適用条件を満たしていること"],
    exceptions: [],
    requiredActions: ["根拠の原文を確認する", "必要なら所管へ確認する"],
    requiredDocuments: [],
    approvers: [],
    responsibleDepartments: [],
    deadlines: [],
    missingInformation: [],
    followUps: ensureEvidenceFollowUp(
      top.slice(0, 2).map((h, i) => ({
        id: `fu-doc-${i}`,
        label: `${h.documentTitle}を開く`,
        action: "open_document" as const,
        payload: {
          documentId: h.documentId,
          documentTitle: h.documentTitle,
        },
      })),
      citations,
    ),
    citations,
    workflowPreview: emptyWorkflow(),
  };
}
