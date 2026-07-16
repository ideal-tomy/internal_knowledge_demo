import { useSyncExternalStore } from "react";
import { buildChunksFromDocuments, type KnowledgeChunk } from "./chunks";
import {
  normalizeTextToDocument,
  titleFromFileName,
} from "./normalize-text";
import {
  sampleDocuments,
  samplePackManifest,
  type KnowledgeDocument,
  type KnowledgePackManifest,
  type KnowledgeSection,
} from "./sample-pack";

export type PackSource = "sample" | "custom";

export const CUSTOM_PACK_ID = "session-custom";
export const MAX_CUSTOM_DOCUMENTS = 5;
export const MAX_CUSTOM_TOTAL_CHARS = 50_000;
export const MAX_CUSTOM_FILE_BYTES = 200_000;

const STORAGE_DOCS_KEY = "ik-custom-pack-docs-v1";
const STORAGE_SOURCE_KEY = "ik-active-pack-source-v1";

type PackSnapshot = {
  source: PackSource;
  customDocuments: KnowledgeDocument[];
  revision: number;
};

type Listener = () => void;

const listeners = new Set<Listener>();

function loadCustomDocuments(): KnowledgeDocument[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_DOCS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as KnowledgeDocument[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (doc) =>
        doc &&
        typeof doc.id === "string" &&
        typeof doc.title === "string" &&
        Array.isArray(doc.sections),
    );
  } catch {
    return [];
  }
}

function loadSource(): PackSource {
  try {
    const raw = sessionStorage.getItem(STORAGE_SOURCE_KEY);
    if (raw === "custom" || raw === "sample") return raw;
  } catch {
    /* ignore */
  }
  return "sample";
}

let snapshot: PackSnapshot = {
  source: loadSource(),
  customDocuments: loadCustomDocuments(),
  revision: 0,
};

function persist() {
  try {
    sessionStorage.setItem(
      STORAGE_DOCS_KEY,
      JSON.stringify(snapshot.customDocuments),
    );
    sessionStorage.setItem(STORAGE_SOURCE_KEY, snapshot.source);
  } catch {
    /* quota / private mode */
  }
}

function emit() {
  snapshot = { ...snapshot, revision: snapshot.revision + 1 };
  persist();
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): PackSnapshot {
  return snapshot;
}

function getServerSnapshot(): PackSnapshot {
  return {
    source: "sample",
    customDocuments: [],
    revision: 0,
  };
}

function totalChars(documents: KnowledgeDocument[]): number {
  return documents.reduce(
    (sum, doc) =>
      sum +
      doc.sections.reduce((s, section) => s + section.body.length, 0) +
      doc.title.length,
    0,
  );
}

function customManifest(documents: KnowledgeDocument[]): KnowledgePackManifest {
  return {
    packId: CUSTOM_PACK_ID,
    name: "マイナレッジ",
    companyName: "セッション内の一時パック",
    isFictional: false,
    version: "session",
    documentCount: documents.length,
    categories: documents.length > 0 ? ["カスタム"] : [],
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
}

export function getActivePackSource(): PackSource {
  return snapshot.source;
}

export function getActiveDocuments(): KnowledgeDocument[] {
  return snapshot.source === "custom"
    ? snapshot.customDocuments
    : sampleDocuments;
}

export function getActiveManifest(): KnowledgePackManifest {
  return snapshot.source === "custom"
    ? customManifest(snapshot.customDocuments)
    : samplePackManifest;
}

export function getActiveChunks(): KnowledgeChunk[] {
  return buildChunksFromDocuments(getActiveDocuments());
}

export function getCustomDocuments(): KnowledgeDocument[] {
  return snapshot.customDocuments;
}

export function isSamplePackActive(): boolean {
  return snapshot.source === "sample";
}

export function findActiveDocument(
  documentId: string,
): KnowledgeDocument | undefined {
  return getActiveDocuments().find((doc) => doc.id === documentId);
}

export function findActiveSection(
  documentId: string,
  sectionId: string,
): { document: KnowledgeDocument; section: KnowledgeSection } | undefined {
  const document = findActiveDocument(documentId);
  if (!document) return undefined;
  const section = document.sections.find((s) => s.id === sectionId);
  if (!section) return undefined;
  return { document, section };
}

export function setActivePackSource(source: PackSource): void {
  if (snapshot.source === source) return;
  snapshot = { ...snapshot, source };
  emit();
}

export type AddDocumentResult =
  | { ok: true; document: KnowledgeDocument }
  | { ok: false; error: string };

export function addCustomDocumentFromText(options: {
  title: string;
  text: string;
}): AddDocumentResult {
  const text = options.text.trim();
  if (!text) {
    return { ok: false, error: "本文が空です。" };
  }
  if (snapshot.customDocuments.length >= MAX_CUSTOM_DOCUMENTS) {
    return {
      ok: false,
      error: `文書は最大 ${MAX_CUSTOM_DOCUMENTS} 件までです。`,
    };
  }

  const document = normalizeTextToDocument({
    title: options.title,
    text,
  });
  const next = [...snapshot.customDocuments, document];
  if (totalChars(next) > MAX_CUSTOM_TOTAL_CHARS) {
    return {
      ok: false,
      error: `合計文字数が上限（${MAX_CUSTOM_TOTAL_CHARS.toLocaleString()}字）を超えます。`,
    };
  }

  snapshot = {
    ...snapshot,
    customDocuments: next,
    source: "custom",
  };
  emit();
  return { ok: true, document };
}

export async function addCustomDocumentFromFile(
  file: File,
): Promise<AddDocumentResult> {
  const name = file.name.toLowerCase();
  if (!name.endsWith(".md") && !name.endsWith(".txt")) {
    return {
      ok: false,
      error: ".md または .txt のみアップロードできます。",
    };
  }
  if (file.size > MAX_CUSTOM_FILE_BYTES) {
    return {
      ok: false,
      error: `ファイルサイズは ${Math.floor(MAX_CUSTOM_FILE_BYTES / 1000)}KB 以下にしてください。`,
    };
  }

  let text: string;
  try {
    text = await file.text();
  } catch {
    return { ok: false, error: "ファイルの読み込みに失敗しました。" };
  }

  return addCustomDocumentFromText({
    title: titleFromFileName(file.name),
    text,
  });
}

export function removeCustomDocument(documentId: string): void {
  const next = snapshot.customDocuments.filter((doc) => doc.id !== documentId);
  if (next.length === snapshot.customDocuments.length) return;
  snapshot = { ...snapshot, customDocuments: next };
  emit();
}

export function clearCustomPack(): void {
  if (snapshot.customDocuments.length === 0 && snapshot.source === "sample") {
    return;
  }
  snapshot = {
    ...snapshot,
    customDocuments: [],
    source: "sample",
  };
  emit();
}

/** React 向け: Active Pack の購読。 */
export function useKnowledgePack() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const documents =
    state.source === "custom" ? state.customDocuments : sampleDocuments;
  const manifest =
    state.source === "custom"
      ? customManifest(state.customDocuments)
      : samplePackManifest;

  return {
    source: state.source,
    revision: state.revision,
    documents,
    customDocuments: state.customDocuments,
    manifest,
    isSample: state.source === "sample",
    setSource: setActivePackSource,
    addFromText: addCustomDocumentFromText,
    addFromFile: addCustomDocumentFromFile,
    removeDocument: removeCustomDocument,
    clearCustom: clearCustomPack,
  };
}
