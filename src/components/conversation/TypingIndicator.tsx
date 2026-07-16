/** Bot 応答待ちの 3 点タイピングインジケーター。 */
export function TypingIndicator() {
  return (
    <div
      className="typing-indicator"
      role="status"
      aria-live="polite"
      aria-label="応答を作成中"
    >
      <span className="typing-indicator-dot" />
      <span className="typing-indicator-dot" />
      <span className="typing-indicator-dot" />
    </div>
  );
}
