import type { MissingInfoChoice } from "../../types/internal-knowledge";

type ClarifyingChoiceProps = {
  choices: MissingInfoChoice[];
  disabled?: boolean;
  onSelect: (choice: MissingInfoChoice) => void;
};

/** P07 Clarifying Choice — fill missing info via choices, not free text alone. */
export function ClarifyingChoice({
  choices,
  disabled = false,
  onSelect,
}: ClarifyingChoiceProps) {
  if (choices.length === 0) return null;

  return (
    <div className="clarifying-choice">
      <p className="clarifying-choice-title">条件を選んで続きを確認</p>
      <div className="clarifying-choice-options" role="group" aria-label="不足情報の選択">
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className="clarifying-choice-option"
            disabled={disabled}
            onClick={() => onSelect(choice)}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <p className="clarifying-choice-hint">
        選択肢にない場合は、下の入力欄から追加してください。
      </p>
    </div>
  );
}
