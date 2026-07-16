import {
  countCharacters,
  estimateTokens,
} from "@axeon/ai-demo-core/demo-core/knowledge";
import {
  AiTransportError,
  sendAiRequest,
} from "@axeon/ai-demo-core/demo-core";
import {
  getApiKey,
  getIkAccessMode,
  getIkModel,
  getIkProvider,
  getTrialCode,
} from "../access/ik-settings";
import { findFixtureByGuidedQuestionId } from "../mocks/guided-questions";
import {
  answerSkeletonFixtures,
  fixtureFullDayLeaveThenRemote,
  fixturePurchaseAfterClarify,
} from "../mocks/answer-skeleton-fixtures";
import type { InternalKnowledgeOutput } from "../types/internal-knowledge";
import { buildInternalKnowledgeAiRequest } from "./adapters/internal-knowledge-input";
import {
  parseInternalKnowledgeAiResult,
  synthesizeFromHits,
} from "./adapters/internal-knowledge-output";
import {
  getActiveDocuments,
  isSamplePackActive,
} from "../knowledge/pack-store";
import { retrieveChunks } from "./retrieve";

function matchKnownSampleOutput(question: string): InternalKnowledgeOutput | null {
  const normalized = question.replace(/\s+/g, "");
  for (const fixture of answerSkeletonFixtures) {
    if (normalized.includes(fixture.question.replace(/\s+/g, "").slice(0, 16))) {
      return fixture.output;
    }
  }
  if (normalized.includes("全日") && normalized.includes("在宅")) {
    return fixtureFullDayLeaveThenRemote;
  }
  if (normalized.includes("10万円未満") || normalized.includes("追加条件")) {
    return fixturePurchaseAfterClarify;
  }
  return null;
}

export type AskInternalKnowledgeInput = {
  question: string;
  guidedQuestionId?: string;
  conversationContext?: Array<{ role: "user" | "assistant"; content: string }>;
};

export type AskInternalKnowledgeResult = {
  output: InternalKnowledgeOutput;
  mode: string;
  source: "fixture" | "sample-retrieve" | "llm" | "llm-empty-fallback";
  remainingRequests?: number;
};

function formatAskError(err: unknown): Error {
  if (err instanceof AiTransportError) {
    const detail = err.normalized.recommendedAction
      ? `${err.message}（${err.normalized.recommendedAction}）`
      : err.message;
    return new Error(detail);
  }
  if (err instanceof Error) return err;
  return new Error("回答の取得に失敗しました。");
}

/**
 * Sample → fixture or local retrieve synthesize.
 * BYOK / Trial → retrieve → sendAiRequest (json_object) → Output Adapter.
 */
export async function askInternalKnowledge(
  input: AskInternalKnowledgeInput,
): Promise<AskInternalKnowledgeResult> {
  const question = input.question.trim();
  if (!question) {
    throw new Error("質問が空です。");
  }

  const mode = getIkAccessMode();
  const samplePack = isSamplePackActive();
  const activeDocs = getActiveDocuments();

  if (activeDocs.length === 0) {
    throw new Error(
      "ナレッジ文書がありません。Knowledge Pack の「マイナレッジ」から文書を追加してください。",
    );
  }

  if (mode === "sample") {
    // ガイド質問の固定回答はサンプルパック時のみ（自社ナレッジでは誤発火させない）
    if (samplePack) {
      if (input.guidedQuestionId) {
        const fixture = findFixtureByGuidedQuestionId(input.guidedQuestionId);
        if (fixture) {
          return { output: fixture.output, mode, source: "fixture" };
        }
      }
      const known = matchKnownSampleOutput(question);
      if (known) {
        return { output: known, mode, source: "fixture" };
      }
    }
    const hits = retrieveChunks(question, { topK: 5 });
    return {
      output: synthesizeFromHits(hits),
      mode,
      source: "sample-retrieve",
    };
  }

  const hits = retrieveChunks(question, { topK: 6 });
  if (hits.length === 0) {
    return {
      output: synthesizeFromHits([]),
      mode,
      source: "sample-retrieve",
    };
  }

  const provider = mode === "managed-trial" ? "openai" : getIkProvider();
  const model = getIkModel();
  const apiKey = mode === "byok-direct" ? getApiKey(provider).trim() : undefined;

  if (mode === "byok-direct" && !apiKey) {
    throw new Error("APIキーをヘッダーの設定で保存してください。");
  }

  const trialCode = getTrialCode().trim();
  if (mode === "managed-trial" && !trialCode) {
    throw new Error("体験コードをヘッダーの設定で保存してください。");
  }

  const request = buildInternalKnowledgeAiRequest({
    question,
    hits,
    conversationContext: input.conversationContext,
    provider,
    model,
    accessMode: mode,
    apiKey,
  });

  const knowledgeText = hits.map((h) => h.text).join("\n");
  const userMsg =
    typeof request.messages[0]?.content === "string"
      ? request.messages[0].content
      : question;

  try {
    const response = await sendAiRequest(request, {
      trialCode: mode === "managed-trial" ? trialCode : undefined,
      knowledgeCharCount: countCharacters(knowledgeText),
      estimatedInputTokens:
        estimateTokens(request.systemPrompt) + estimateTokens(userMsg),
    });

    if (!response.text?.trim()) {
      return {
        output: synthesizeFromHits(
          hits,
          "モデル応答が空だったため、検索結果を表示します。",
        ),
        mode,
        source: "llm-empty-fallback",
      };
    }

    return {
      output: parseInternalKnowledgeAiResult(response.text, hits),
      mode,
      source: "llm",
      remainingRequests: response.trialStatus?.remainingRequests,
    };
  } catch (err) {
    throw formatAskError(err);
  }
}
