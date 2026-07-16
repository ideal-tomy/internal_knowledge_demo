/** P08 Limit Disclosure — set expectations before conversation starts. */
export function LimitDisclosure() {
  return (
    <aside className="limit-disclosure" aria-label="利用上の注意">
      <p className="limit-disclosure-can">
        <span className="limit-disclosure-label">できること</span>
        選択中パックの規程横断確認、手続き・承認の整理
      </p>
      <p className="limit-disclosure-cannot">
        <span className="limit-disclosure-label">できないこと</span>
        ナレッジ外の社内ルール作成、最終的な人事・法務判断の確定
      </p>
    </aside>
  );
}
