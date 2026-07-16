import type { IntentNode, IntentTree } from "../../types/internal-knowledge";

type IntentRailsProps = {
  tree: IntentTree;
  /** Stack of selected nodes from root toward leaf (excludes unselected current options). */
  path: IntentNode[];
  disabled?: boolean;
  onSelect: (node: IntentNode) => void;
  onBack: () => void;
  onBackToRoot: () => void;
};

function currentOptions(tree: IntentTree, path: IntentNode[]): IntentNode[] {
  if (path.length === 0) return tree.roots;
  const parent = path[path.length - 1];
  return parent.children ?? [];
}

/**
 * P01 Intent Rails + P02 Guided Drill-down (max depth 3).
 * Selecting a leaf calls onSelect with the leaf node (caller sends guidedQuestionId).
 */
export function IntentRails({
  tree,
  path,
  disabled = false,
  onSelect,
  onBack,
  onBackToRoot,
}: IntentRailsProps) {
  const options = currentOptions(tree, path);
  const atRoot = path.length === 0;

  return (
    <div className="intent-rails">
      {!atRoot ? (
        <div className="intent-rails-nav">
          <button
            type="button"
            className="intent-rails-back"
            disabled={disabled}
            onClick={onBack}
          >
            戻る
          </button>
          <button
            type="button"
            className="intent-rails-back-root"
            disabled={disabled}
            onClick={onBackToRoot}
          >
            カテゴリ一覧へ
          </button>
          <p className="intent-rails-crumb" aria-label="選択中の経路">
            {path.map((n) => n.label).join(" › ")}
          </p>
        </div>
      ) : (
        <p className="intent-rails-hint">用件を選んでください（最大3階層）</p>
      )}

      <div
        className="intent-rails-options"
        role="group"
        aria-label={atRoot ? "カテゴリ" : "次の選択肢"}
      >
        {options.map((node) => {
          const isLeaf = Boolean(node.guidedQuestionId) || Boolean(node.clarifyOptions);
          return (
            <button
              key={node.id}
              type="button"
              className="intent-rails-option"
              disabled={disabled}
              onClick={() => onSelect(node)}
            >
              <span className="intent-rails-option-label">{node.label}</span>
              {node.description ? (
                <span className="intent-rails-option-desc">{node.description}</span>
              ) : null}
              {!isLeaf && node.children && node.children.length > 0 ? (
                <span className="intent-rails-option-chevron" aria-hidden="true">
                  ›
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
