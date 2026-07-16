import type { AiRequest } from "@axeon/ai-demo-core/types/provider";
import type { AiProvider } from "@axeon/ai-demo-core/types/access-mode";
import type { ScoredChunk } from "../retrieve";

export function buildInternalKnowledgeSchemaHint(): string {
  return `Return ONLY a JSON object with this shape (Japanese strings):
{
  "status": "allowed" | "conditional" | "needs_confirmation" | "not_allowed" | "not_found",
  "conclusion": string,
  "answer": string,
  "bullets": string[],
  "conditions": string[],
  "exceptions": string[],
  "requiredActions": string[],
  "requiredDocuments": string[],
  "approvers": string[],
  "responsibleDepartments": string[],
  "deadlines": string[],
  "missingInformation": string[],
  "missingInfoChoices": { "id": string, "label": string, "appendText": string }[],
  "followUps": { "id": string, "label": string, "action": "resend_variant"|"open_evidence"|"open_document"|"clarify"|"ask_related", "payload"?: object }[],
  "citations": {
    "documentId": string,
    "documentTitle": string,
    "sectionId": string,
    "sectionTitle": string,
    "articleNumber"?: string,
    "excerpt": string,
    "reason": string
  }[],
  "workflowPreview": {
    "routingTarget"?: string,
    "formType"?: string,
    "suggestedFields": object,
    "automationCandidates": string[]
  }
}
Rules:
- Use ONLY facts in the provided knowledge chunks. Do not invent rules.
- citations.documentId and citations.sectionId MUST match chunk fields exactly.
- If evidence is insufficient, use status "needs_confirmation" or "not_found" and list missingInformation.
- Do not make final legal/HR judgments; describe what the rules say.
- Prefer short bullets (3-5). Always include at least one followUp with action "open_evidence" when citations exist.`;
}

export function buildInternalKnowledgeSystemPrompt(): string {
  return [
    "あなたは社内規程・細則・運用マニュアルを参照し、社員と管理部門の判断を補助するAIです。",
    "与えられたナレッジだけを根拠に、関連文書を横断して確認してください。",
    "ナレッジ外のルールを作らないこと。条件付きの内容を断定しないこと。",
    "金額、期限、回数、承認者を正確に扱うこと。文書間矛盾を隠さないこと。",
    buildInternalKnowledgeSchemaHint(),
  ].join("\n");
}

export type BuildIkAiRequestInput = {
  question: string;
  hits: ScoredChunk[];
  conversationContext?: Array<{ role: "user" | "assistant"; content: string }>;
  provider: AiProvider;
  model: string;
  accessMode: "byok-direct" | "managed-trial";
  apiKey?: string;
};

export function buildInternalKnowledgeAiRequest(
  input: BuildIkAiRequestInput,
): AiRequest {
  const chunkPayload = input.hits.map((h) => ({
    id: h.id,
    documentId: h.documentId,
    documentTitle: h.documentTitle,
    version: h.version,
    sectionId: h.sectionId,
    sectionTitle: h.sectionTitle,
    articleNumber: h.articleNumber ?? null,
    text: h.text,
  }));

  return {
    accessMode: input.accessMode,
    provider: input.provider,
    model: input.model,
    apiKey: input.apiKey,
    systemPrompt: buildInternalKnowledgeSystemPrompt(),
    messages: [
      {
        role: "user",
        content: JSON.stringify(
          {
            question: input.question,
            conversationContext: input.conversationContext ?? [],
            knowledgeChunks: chunkPayload,
          },
          null,
          2,
        ),
      },
    ],
    responseFormat: { type: "json_object" },
    // gpt-5-nano rejects temperature other than default (1)
    maxOutputTokens: 8192,
    // Without minimal, gpt-5-nano can spend the whole token budget on reasoning
    // and return empty content (UI then falls back to local synthesize).
    reasoningEffort: resolveReasoningEffort(input.model),
  };
}

/** gpt-5-nano: minimal. gpt-5.4-nano: none (minimal is rejected). */
function resolveReasoningEffort(
  model: string,
): "none" | "minimal" | undefined {
  const id = model.toLowerCase();
  if (id.includes("gpt-5.4")) return "none";
  if (id.includes("gpt-5")) return "minimal";
  return undefined;
}
