import { useEffectEvent, useState } from "react";
import type {
  AnswerBlocks,
  InternalKnowledgeOutput,
  KnowledgeDemoState,
} from "../types/internal-knowledge";
import { toAnswerBlocks } from "../adapters/internal-knowledge-output-adapter";
import type { AskInternalKnowledgeResult } from "../ai/askInternalKnowledge";

const PROGRESS_STATES: KnowledgeDemoState[] = [
  "searching",
  "cross_checking",
  "generating",
];

const STEP_MS = 450;

type TerminalState = "succeeded" | "needs_information" | "not_found" | "failed";

function terminalStateFromOutput(output: InternalKnowledgeOutput): TerminalState {
  if (output.status === "needs_confirmation") return "needs_information";
  if (output.status === "not_found") return "not_found";
  return "succeeded";
}

export type AskFlowResult = {
  blocks: AnswerBlocks;
  demoState: TerminalState;
  source?: string;
};

type UseAskFlowResult = {
  phase: KnowledgeDemoState;
  isRunning: boolean;
  result: AskFlowResult | null;
  error: string | null;
  runAsk: (promise: Promise<AskInternalKnowledgeResult>) => void;
  reset: () => void;
};

/**
 * P04 progress host for askInternalKnowledge (sample / BYOK / Trial).
 */
export function useAskFlow(): UseAskFlowResult {
  const [phase, setPhase] = useState<KnowledgeDemoState>("ready");
  const [result, setResult] = useState<AskFlowResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const finish = useEffectEvent((askResult: AskInternalKnowledgeResult) => {
    setResult({
      blocks: toAnswerBlocks(askResult.output),
      demoState: terminalStateFromOutput(askResult.output),
      source: askResult.source,
    });
    setPhase(terminalStateFromOutput(askResult.output));
  });

  const isRunning =
    phase === "searching" ||
    phase === "cross_checking" ||
    phase === "generating";

  return {
    phase,
    isRunning,
    result,
    error,
    runAsk: (promise) => {
      setError(null);
      setResult(null);
      setPhase("searching");

      let step = 0;
      const progressTimer = window.setInterval(() => {
        step = Math.min(step + 1, PROGRESS_STATES.length - 1);
        setPhase(PROGRESS_STATES[step]!);
      }, STEP_MS);

      void promise
        .then((askResult) => {
          window.clearInterval(progressTimer);
          finish(askResult);
        })
        .catch((err: unknown) => {
          window.clearInterval(progressTimer);
          const message =
            err instanceof Error ? err.message : "回答の取得に失敗しました。";
          setError(message);
          setPhase("failed");
          setResult(null);
        });
    },
    reset: () => {
      setResult(null);
      setError(null);
      setPhase("ready");
    },
  };
}
