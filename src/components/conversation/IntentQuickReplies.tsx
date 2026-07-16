import type { IntentNode, IntentTree } from "../../types/internal-knowledge";

type IntentQuickRepliesProps = {
  tree: IntentTree;
  path: IntentNode[];
  disabled?: boolean;
  onSelect: (node: IntentNode) => void;
  onReset: () => void;
};

function currentOptions(tree: IntentTree, path: IntentNode[]): IntentNode[] {
  if (path.length === 0) return tree.roots;
  const parent = path[path.length - 1];
  return parent.children ?? [];
}

/**
 * 用件選択を bot 吹き出し直下のクイックリプライチップとして表示する。
 * 「リセット」はチップ列末尾のテキストリンク。
 */
export function IntentQuickReplies({
  tree,
  path,
  disabled = false,
  onSelect,
  onReset,
}: IntentQuickRepliesProps) {
  const options = currentOptions(tree, path);

  return (
    <div
      className="intent-quick-replies"
      role="group"
      aria-label={path.length === 0 ? "用件カテゴリ" : "次の用件"}
    >
      {options.map((node) => (
        <button
          key={node.id}
          type="button"
          className="intent-quick-chip"
          disabled={disabled}
          onClick={() => onSelect(node)}
        >
          {node.label}
        </button>
      ))}
      <button
        type="button"
        className="intent-quick-reset"
        disabled={disabled}
        onClick={onReset}
      >
        リセット
      </button>
    </div>
  );
}
