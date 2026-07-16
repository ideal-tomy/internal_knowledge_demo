import { useEffect, type ReactNode } from "react";

type BottomSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/** 設定・ナレッジ用の簡易ボトムシート。 */
export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="bottom-sheet-root" role="presentation">
      <button
        type="button"
        className="bottom-sheet-backdrop"
        aria-label="閉じる"
        onClick={onClose}
      />
      <div
        className="bottom-sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="bottom-sheet-header">
          <h2 className="bottom-sheet-title">{title}</h2>
          <button
            type="button"
            className="bottom-sheet-close"
            onClick={onClose}
            aria-label="閉じる"
          >
            ✕
          </button>
        </header>
        <div className="bottom-sheet-body">{children}</div>
      </div>
    </div>
  );
}
