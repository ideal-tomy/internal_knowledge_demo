import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import {
  MAX_CUSTOM_DOCUMENTS,
  MAX_CUSTOM_FILE_BYTES,
  MAX_CUSTOM_TOTAL_CHARS,
  useKnowledgePack,
  type PackSource,
} from "../../knowledge/pack-store";
import type { KnowledgeDocument, OpenDocumentTarget } from "../../knowledge/sample-pack";

type KnowledgePanelProps = {
  activeTarget: OpenDocumentTarget | null;
  onSelectDocument: (documentId: string) => void;
};

function DocumentViewer({
  document,
  highlightSectionId,
}: {
  document: KnowledgeDocument;
  highlightSectionId?: string;
}) {
  const highlightRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!highlightSectionId) return;
    highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [document.id, highlightSectionId]);

  return (
    <article className="knowledge-viewer">
      <header className="knowledge-viewer-header">
        <h2 className="knowledge-viewer-title">{document.title}</h2>
        <p className="knowledge-viewer-meta">
          v{document.version} · 施行 {document.effectiveDate} · {document.ownerDepartment}
        </p>
        <p className="knowledge-viewer-summary">{document.summary}</p>
      </header>

      <nav className="knowledge-toc" aria-label="目次">
        {document.sections.map((section) => (
          <a
            key={section.id}
            className="knowledge-toc-link"
            href={`#section-${document.id}-${section.id}`}
          >
            {section.articleNumber ? `${section.articleNumber} ` : ""}
            {section.title}
          </a>
        ))}
      </nav>

      <div className="knowledge-sections">
        {document.sections.map((section) => {
          const isHighlight = section.id === highlightSectionId;
          return (
            <section
              key={section.id}
              id={`section-${document.id}-${section.id}`}
              className={
                isHighlight
                  ? "knowledge-section knowledge-section-highlight"
                  : "knowledge-section"
              }
              ref={isHighlight ? highlightRef : undefined}
            >
              <h3 className="knowledge-section-title">
                {section.articleNumber ? (
                  <span className="knowledge-section-article">{section.articleNumber}</span>
                ) : null}
                {section.title}
              </h3>
              <p className="knowledge-section-body">{section.body}</p>
            </section>
          );
        })}
      </div>
    </article>
  );
}

function CustomKnowledgeEditor({
  documents,
  onAdded,
}: {
  documents: KnowledgeDocument[];
  onAdded: (documentId: string) => void;
}) {
  const { addFromText, addFromFile, removeDocument, clearCustom } = useKnowledgePack();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setBusy(true);
    setError(null);
    setStatus(null);
    let lastId: string | null = null;
    for (const file of list) {
      const result = await addFromFile(file);
      if (!result.ok) {
        setError(result.error);
        setBusy(false);
        return;
      }
      lastId = result.document.id;
    }
    if (lastId) {
      setStatus(`${list.length}件のファイルを追加しました。`);
      onAdded(lastId);
    }
    setBusy(false);
  };

  const handlePasteSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    const result = addFromText({ title, text: body });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setTitle("");
    setBody("");
    setStatus(`「${result.document.title}」を追加しました。`);
    onAdded(result.document.id);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    void handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="knowledge-custom">
      <p className="knowledge-custom-disclaimer" role="note">
        デモ用の一時ナレッジです。本番の機密・個人情報は入れないでください。
        データはブラウザのセッション内のみに保存され、タブを閉じると消えます。
      </p>

      <div
        className={
          dragOver ? "knowledge-dropzone is-dragover" : "knowledge-dropzone"
        }
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <p className="knowledge-dropzone-title">ファイルをドロップ</p>
        <p className="knowledge-dropzone-meta">
          .md / .txt · 最大 {MAX_CUSTOM_DOCUMENTS} 文書 · 合計{" "}
          {(MAX_CUSTOM_TOTAL_CHARS / 1000).toFixed(0)}千字 · 1ファイル{" "}
          {Math.floor(MAX_CUSTOM_FILE_BYTES / 1000)}KB
        </p>
        <button
          type="button"
          className="knowledge-dropzone-btn"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
        >
          ファイルを選択
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt,text/plain,text/markdown"
          multiple
          className="visually-hidden"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <form className="knowledge-paste-form" onSubmit={handlePasteSubmit}>
        <p className="knowledge-paste-label">またはテキストを貼り付け</p>
        <label className="visually-hidden" htmlFor="custom-doc-title">
          文書タイトル
        </label>
        <input
          id="custom-doc-title"
          className="knowledge-paste-title"
          type="text"
          value={title}
          placeholder="文書タイトル（例: 在宅勤務規程）"
          onChange={(e) => setTitle(e.target.value)}
        />
        <label className="visually-hidden" htmlFor="custom-doc-body">
          本文
        </label>
        <textarea
          id="custom-doc-body"
          className="knowledge-paste-body"
          rows={5}
          value={body}
          placeholder="規程本文を貼り付け（見出しや「第○条」があると条項分割されます）"
          onChange={(e) => setBody(e.target.value)}
        />
        <button
          type="submit"
          className="knowledge-paste-submit"
          disabled={busy || !body.trim()}
        >
          ナレッジに追加
        </button>
      </form>

      {error ? (
        <p className="knowledge-custom-error" role="alert">
          {error}
        </p>
      ) : null}
      {status ? (
        <p className="knowledge-custom-status" role="status">
          {status}
        </p>
      ) : null}

      {documents.length > 0 ? (
        <div className="knowledge-custom-list">
          <div className="knowledge-custom-list-header">
            <span>追加済み {documents.length} / {MAX_CUSTOM_DOCUMENTS}</span>
            <button
              type="button"
              className="knowledge-custom-clear"
              onClick={() => {
                clearCustom();
                setStatus("マイナレッジをクリアし、サンプルに戻しました。");
              }}
            >
              すべて削除
            </button>
          </div>
          <ul className="knowledge-custom-items">
            {documents.map((doc) => (
              <li key={doc.id} className="knowledge-custom-item">
                <button
                  type="button"
                  className="knowledge-custom-item-open"
                  onClick={() => onAdded(doc.id)}
                >
                  <span className="knowledge-custom-item-title">{doc.title}</span>
                  <span className="knowledge-custom-item-meta">
                    {doc.sections.length} セクション
                  </span>
                </button>
                <button
                  type="button"
                  className="knowledge-custom-item-remove"
                  aria-label={`${doc.title}を削除`}
                  onClick={() => removeDocument(doc.id)}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="knowledge-empty">
          まだ文書がありません。ファイルまたは貼り付けで追加すると、その内容だけで質問できます。
        </p>
      )}
    </div>
  );
}

/** Knowledge Browser — pack switcher, sample / custom, and focused viewer. */
export function KnowledgePanel({ activeTarget, onSelectDocument }: KnowledgePanelProps) {
  const {
    source,
    documents,
    customDocuments,
    manifest,
    setSource,
  } = useKnowledgePack();

  const activeDocument =
    documents.find((doc) => doc.id === activeTarget?.documentId) ?? null;

  const handleTab = (next: PackSource) => {
    setSource(next);
  };

  return (
    <div className="knowledge-panel">
      <div className="knowledge-pack-tabs" role="tablist" aria-label="ナレッジパック">
        <button
          type="button"
          role="tab"
          aria-selected={source === "sample"}
          className={
            source === "sample"
              ? "knowledge-pack-tab is-active"
              : "knowledge-pack-tab"
          }
          onClick={() => handleTab("sample")}
        >
          サンプル
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={source === "custom"}
          className={
            source === "custom"
              ? "knowledge-pack-tab is-active"
              : "knowledge-pack-tab"
          }
          onClick={() => handleTab("custom")}
        >
          マイナレッジ
          {customDocuments.length > 0 ? (
            <span className="knowledge-pack-tab-count">{customDocuments.length}</span>
          ) : null}
        </button>
      </div>

      <header className="knowledge-pack-summary">
        <p className="knowledge-pack-eyebrow">Knowledge Pack</p>
        <h2 className="knowledge-pack-title">{manifest.name}</h2>
        <p className="knowledge-pack-company">
          {manifest.companyName}
          {manifest.isFictional ? "（架空）" : ""}
        </p>
        <p className="knowledge-pack-meta">
          {manifest.documentCount}文書
          {manifest.categories.length > 0
            ? ` · ${manifest.categories.join(" / ")}`
            : ""}
          {" · "}
          更新 {manifest.lastUpdated}
        </p>
        {source === "custom" ? (
          <p className="knowledge-pack-hint">
            実AI確認は設定で BYOK / Trial を選ぶと精度が上がります。
          </p>
        ) : null}
      </header>

      {source === "custom" ? (
        <CustomKnowledgeEditor
          documents={customDocuments}
          onAdded={onSelectDocument}
        />
      ) : null}

      {source === "sample" ? (
        <div className="knowledge-doc-list" role="list">
          {documents.map((doc) => {
            const isActive = doc.id === activeTarget?.documentId;
            return (
              <button
                key={doc.id}
                type="button"
                role="listitem"
                className={
                  isActive ? "knowledge-doc-card is-active" : "knowledge-doc-card"
                }
                onClick={() => onSelectDocument(doc.id)}
              >
                <span className="knowledge-doc-card-title">{doc.title}</span>
                <span className="knowledge-doc-card-meta">
                  v{doc.version} · {doc.ownerDepartment}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {activeDocument ? (
        <DocumentViewer
          document={activeDocument}
          highlightSectionId={activeTarget?.sectionId}
        />
      ) : source === "sample" ? (
        <p className="knowledge-empty">
          文書を選ぶか、回答の「根拠」や「規程を開く」から原文へ移動できます。
        </p>
      ) : null}
    </div>
  );
}
