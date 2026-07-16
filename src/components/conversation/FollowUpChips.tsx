import type { FollowUpChip } from "../../types/internal-knowledge";

type FollowUpChipsProps = {
  chips: FollowUpChip[];
  disabled?: boolean;
  onSelect: (chip: FollowUpChip) => void;
};

const MAX_CHIPS = 5;

/** P06 Follow-up Chips — keyboard-free next actions after an answer. */
export function FollowUpChips({ chips, disabled = false, onSelect }: FollowUpChipsProps) {
  const visible = chips.slice(0, MAX_CHIPS);
  if (visible.length === 0) return null;

  return (
    <div className="follow-up-chips" role="group" aria-label="次のアクション">
      {visible.map((chip) => (
        <button
          key={chip.id}
          type="button"
          className="follow-up-chip"
          disabled={disabled}
          onClick={() => onSelect(chip)}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
