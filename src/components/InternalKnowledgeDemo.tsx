import { useEffect, useState } from "react";
import { AccessModeBar } from "./access/AccessModeBar";
import { ConversationShell } from "./conversation/ConversationShell";
import { KnowledgePanel } from "./knowledge/KnowledgePanel";
import { BottomSheet } from "./ui/BottomSheet";
import { useVisualViewportHeight } from "../hooks/useVisualViewportHeight";
import { useKnowledgePack } from "../knowledge/pack-store";
import type { OpenDocumentTarget } from "../knowledge/sample-pack";

const trialPortalUrl =
  import.meta.env.VITE_TRIAL_PORTAL_URL?.trim() ||
  "https://ai-demo-studio-lime.vercel.app/admin/trial";

type SheetKind = "none" | "knowledge" | "settings";

/** Chat-app shell: header + thread + composer. Knowledge / Access Mode はボトムシート。 */
export function InternalKnowledgeDemo() {
  const { height, offsetTop } = useVisualViewportHeight();
  const pack = useKnowledgePack();
  const [activeTarget, setActiveTarget] = useState<OpenDocumentTarget | null>(null);
  const [sheet, setSheet] = useState<SheetKind>("none");

  const handleOpenDocument = (target: OpenDocumentTarget) => {
    setActiveTarget(target);
    setSheet("knowledge");
  };

  useEffect(() => {
    setActiveTarget((prev) => {
      if (!prev) return prev;
      const exists = pack.documents.some((d) => d.id === prev.documentId);
      return exists ? prev : null;
    });
  }, [pack.revision, pack.documents]);

  return (
    <div
      className="chat-app"
      style={{
        height: height > 0 ? `${height}px` : "100dvh",
        transform: offsetTop ? `translateY(${offsetTop}px)` : undefined,
      }}
    >
      <div className="chat-app-column">
        <header className="chat-app-header">
          <div className="chat-app-header-brand">
            <h1 className="chat-app-title">社内ナレッジAI</h1>
            <button
              type="button"
              className={
                pack.isSample
                  ? "chat-app-pack-badge"
                  : "chat-app-pack-badge is-custom"
              }
              onClick={() => setSheet("knowledge")}
              title="ナレッジパックを切り替え"
            >
              {pack.isSample ? "サンプル" : "マイナレッジ"}
            </button>
          </div>
          <div className="chat-app-header-actions">
            <button
              type="button"
              className="chat-app-icon-btn"
              aria-label="ナレッジパック情報"
              onClick={() => setSheet("knowledge")}
            >
              <InfoIcon />
            </button>
            <button
              type="button"
              className="chat-app-icon-btn"
              aria-label="設定"
              onClick={() => setSheet("settings")}
            >
              <SettingsIcon />
            </button>
          </div>
        </header>

        <ConversationShell onOpenDocument={handleOpenDocument} />
      </div>

      <BottomSheet
        open={sheet === "knowledge"}
        title="Knowledge Pack"
        onClose={() => setSheet("none")}
      >
        <KnowledgePanel
          activeTarget={activeTarget}
          onSelectDocument={(documentId) =>
            setActiveTarget({ documentId, sectionId: undefined })
          }
        />
      </BottomSheet>

      <BottomSheet
        open={sheet === "settings"}
        title="アクセス設定"
        onClose={() => setSheet("none")}
      >
        <AccessModeBar trialPortalUrl={trialPortalUrl} />
      </BottomSheet>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="8" r="1.1" fill="currentColor" />
      <path
        d="M12 11.25v5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M19.4 13.1c.04-.36.06-.73.06-1.1s-.02-.74-.06-1.1l1.7-1.33a.4.4 0 0 0 .1-.51l-1.61-2.79a.4.4 0 0 0-.48-.18l-2 .8a7.3 7.3 0 0 0-1.9-1.1l-.3-2.13A.4.4 0 0 0 14.5 3h-5a.4.4 0 0 0-.4.34l-.3 2.13a7.3 7.3 0 0 0-1.9 1.1l-2-.8a.4.4 0 0 0-.48.18L2.8 9.06a.4.4 0 0 0 .1.51L4.6 10.9c-.04.36-.06.73-.06 1.1s.02.74.06 1.1L2.9 14.43a.4.4 0 0 0-.1.51l1.61 2.79c.1.18.3.25.48.18l2-.8c.58.45 1.22.82 1.9 1.1l.3 2.13c.03.2.2.34.4.34h5c.2 0 .37-.14.4-.34l.3-2.13c.68-.28 1.32-.65 1.9-1.1l2 .8c.18.07.38 0 .48-.18l1.61-2.79a.4.4 0 0 0-.1-.51L19.4 13.1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
