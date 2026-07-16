import {
  RETRIEVAL_PROGRESS_STEPS,
  type KnowledgeDemoState,
  type RetrievalProgressStepIndex,
} from "../../types/internal-knowledge";

const STATE_TO_STEP: Partial<Record<KnowledgeDemoState, RetrievalProgressStepIndex>> = {
  searching: 0,
  cross_checking: 1,
  generating: 2,
};

type RetrievalProgressProps = {
  state: KnowledgeDemoState;
};

/**
 * P04 Progressive Status — 3 meaningful stages, never a fake %.
 */
export function RetrievalProgress({ state }: RetrievalProgressProps) {
  const activeIndex = STATE_TO_STEP[state];
  if (activeIndex === undefined) return null;

  return (
    <div className="retrieval-progress" role="status" aria-live="polite">
      <ol className="retrieval-progress-list">
        {RETRIEVAL_PROGRESS_STEPS.map((label, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;
          return (
            <li
              key={label}
              className={[
                "retrieval-progress-item",
                done ? "is-done" : "",
                active ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="retrieval-progress-marker" aria-hidden="true">
                {done ? "✓" : active ? "·" : ""}
              </span>
              <span className="retrieval-progress-label">{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
