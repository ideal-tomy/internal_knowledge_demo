import { useEffect, useEffectEvent, useState } from "react";
import type {
  AnswerBlocks,
  InternalKnowledgeOutput,
  KnowledgeDemoState,
} from "../types/internal-knowledge";
import { toAnswerBlocks } from "../adapters/internal-knowledge-output-adapter";

const PROGRESS_STATES: KnowledgeDemoState[] = [
  "searching",
  "cross_checking",
  "generating",
];

/** Keep mock UX snappy; avoid long animation-only waits (UX ≤10s). */
const STEP_MS = 550;

type TerminalState = "succeeded" | "needs_information" | "not_found";

function terminalStateFromOutput(output: InternalKnowledgeOutput): TerminalState {
  if (output.status === "needs_confirmation") return "needs_information";
  if (output.status === "not_found") return "not_found";
  return "succeeded";
}

export type MockAskResult = {
  blocks: AnswerBlocks;
  demoState: TerminalState;
};

type UseMockAskFlowResult = {
  phase: KnowledgeDemoState;
  isRunning: boolean;
  run: (output: InternalKnowledgeOutput) => void;
  reset: () => void;
  result: MockAskResult | null;
};

/**
 * Simulates P04 progress then maps mock output → AnswerBlocks.
 * No AI / Retrieval — Phase 2 host shell only.
 */
export function useMockAskFlow(): UseMockAskFlowResult {
  const [phase, setPhase] = useState<KnowledgeDemoState>("ready");
  const [result, setResult] = useState<MockAskResult | null>(null);
  const [pendingOutput, setPendingOutput] = useState<InternalKnowledgeOutput | null>(
    null,
  );

  const finish = useEffectEvent((output: InternalKnowledgeOutput) => {
    setResult({
      blocks: toAnswerBlocks(output),
      demoState: terminalStateFromOutput(output),
    });
    setPhase(terminalStateFromOutput(output));
    setPendingOutput(null);
  });

  useEffect(() => {
    if (!pendingOutput) return;

    const timers: number[] = [];
    PROGRESS_STATES.forEach((state, index) => {
      timers.push(
        window.setTimeout(() => {
          setPhase(state);
        }, STEP_MS * index),
      );
    });

    timers.push(
      window.setTimeout(() => {
        finish(pendingOutput);
      }, STEP_MS * PROGRESS_STATES.length),
    );

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [pendingOutput]);

  const isRunning =
    phase === "searching" ||
    phase === "cross_checking" ||
    phase === "generating";

  return {
    phase,
    isRunning,
    result,
    run: (output) => {
      setResult(null);
      setPhase("searching");
      setPendingOutput(output);
    },
    reset: () => {
      setPendingOutput(null);
      setResult(null);
      setPhase("ready");
    },
  };
}
