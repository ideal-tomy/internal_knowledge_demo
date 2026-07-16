import type { AnswerBlocks, AnswerStatus, Citation } from "../../types/internal-knowledge";

const STATUS_LABEL: Record<AnswerStatus, string> = {
  allowed: "可能",
  conditional: "条件付き",
  needs_confirmation: "要確認",
  not_allowed: "不可",
  not_found: "該当なし",
};

type DecisionCardProps = {
  blocks: AnswerBlocks;
  evidenceOpen?: boolean;
  onEvidenceOpenChange?: (open: boolean) => void;
  onCitationClick?: (citation: Citation) => void;
};

function ListBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="decision-section">
      <h3 className="decision-section-title">{title}</h3>
      <ul className="decision-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

/**
 * P05 Answer Skeleton — display order is fixed by Conversation UX §3.5.
 */
export function DecisionCard({
  blocks,
  evidenceOpen,
  onEvidenceOpenChange,
  onCitationClick,
}: DecisionCardProps) {
  const hasConditionsOrExceptions =
    blocks.conditions.length > 0 || blocks.exceptions.length > 0;

  return (
    <article className="decision-card" data-status={blocks.status}>
      <div className="decision-status-row">
        <span className={`decision-status-badge status-${blocks.status}`}>
          {STATUS_LABEL[blocks.status]}
        </span>
      </div>

      <p className="decision-conclusion">{blocks.conclusion}</p>

      <ListBlock title="要点" items={blocks.bullets} />
      <ListBlock title="必要な手続き" items={blocks.procedures} />
      <ListBlock title="次のアクション" items={blocks.nextActions} />

      {hasConditionsOrExceptions ? (
        <details className="decision-details">
          <summary>適用条件・例外</summary>
          <div className="decision-details-body">
            <ListBlock title="適用条件" items={blocks.conditions} />
            <ListBlock title="例外・注意" items={blocks.exceptions} />
          </div>
        </details>
      ) : null}

      {blocks.missingInformation.length > 0 ? (
        <section className="decision-section decision-missing">
          <h3 className="decision-section-title">不足情報</h3>
          <ul className="decision-list">
            {blocks.missingInformation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {blocks.citations.length > 0 ? (
        <details
          className="decision-details decision-evidence"
          {...(evidenceOpen !== undefined ? { open: evidenceOpen } : {})}
          onToggle={(event) => {
            onEvidenceOpenChange?.((event.currentTarget as HTMLDetailsElement).open);
          }}
        >
          <summary>根拠（{blocks.citations.length}件）</summary>
          <ul className="decision-citation-list">
            {blocks.citations.map((c) => (
              <li key={`${c.documentId}-${c.sectionId}`} className="decision-citation">
                <p className="decision-citation-meta">
                  {onCitationClick ? (
                    <button
                      type="button"
                      className="decision-citation-doc-button"
                      onClick={() => onCitationClick(c)}
                    >
                      {c.documentTitle}
                    </button>
                  ) : (
                    <span className="decision-citation-doc">{c.documentTitle}</span>
                  )}
                  {c.articleNumber ? (
                    <span className="decision-citation-article">{c.articleNumber}</span>
                  ) : null}
                  <span className="decision-citation-section">{c.sectionTitle}</span>
                </p>
                <blockquote className="decision-citation-excerpt">{c.excerpt}</blockquote>
                <p className="decision-citation-reason">{c.reason}</p>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </article>
  );
}
