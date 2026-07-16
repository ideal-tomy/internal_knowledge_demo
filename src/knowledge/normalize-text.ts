import type { KnowledgeDocument, KnowledgeSection } from "./sample-pack";

const MAX_BODY_CHARS = 40_000;

function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "section";
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function splitByMarkdownHeadings(text: string): KnowledgeSection[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const sections: KnowledgeSection[] = [];
  let currentTitle = "本文";
  let currentArticle: string | undefined;
  let bodyLines: string[] = [];

  const flush = () => {
    const body = bodyLines.join("\n").trim();
    if (!body && sections.length === 0) return;
    if (!body) return;
    const idBase = slugify(currentArticle ?? currentTitle);
    const id = `${idBase}-${sections.length + 1}`;
    sections.push({
      id,
      title: currentTitle,
      articleNumber: currentArticle,
      body,
    });
  };

  for (const line of lines) {
    const md = line.match(/^(#{1,3})\s+(.+)$/);
    const article = line.match(/^(第\s*\d+\s*条)\s*[：:．.\s]*(.*)$/);
    if (md) {
      flush();
      currentTitle = md[2].trim();
      currentArticle = undefined;
      bodyLines = [];
      continue;
    }
    if (article) {
      flush();
      currentArticle = article[1].replace(/\s+/g, "");
      currentTitle = article[2].trim() || currentArticle;
      bodyLines = [];
      continue;
    }
    bodyLines.push(line);
  }
  flush();
  return sections;
}

function splitByParagraphs(text: string): KnowledgeSection[] {
  const parts = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 40);

  if (parts.length < 2) return [];

  return parts.map((body, index) => {
    const firstLine = body.split("\n")[0]?.trim() ?? `段落 ${index + 1}`;
    const title =
      firstLine.length > 40 ? `${firstLine.slice(0, 40)}…` : firstLine;
    return {
      id: `para-${index + 1}`,
      title,
      body,
    };
  });
}

/** テキスト / Markdown を既存 KnowledgeDocument 契約へ正規化する。 */
export function normalizeTextToDocument(options: {
  title: string;
  text: string;
  id?: string;
  ownerDepartment?: string;
}): KnowledgeDocument {
  const title = options.title.trim() || "無題の文書";
  const raw = options.text.replace(/\u0000/g, "").trim();
  const text =
    raw.length > MAX_BODY_CHARS
      ? `${raw.slice(0, MAX_BODY_CHARS)}\n\n…（文字数上限により省略）`
      : raw;

  let sections = splitByMarkdownHeadings(text);
  if (sections.length <= 1) {
    const byPara = splitByParagraphs(text);
    if (byPara.length > 1) sections = byPara;
  }
  if (sections.length === 0) {
    sections = [
      {
        id: "body",
        title: "本文",
        body: text || "（本文なし）",
      },
    ];
  }

  const id =
    options.id ??
    `custom-${slugify(title)}-${Date.now().toString(36)}`;

  const summary =
    sections[0].body.length > 120
      ? `${sections[0].body.slice(0, 120)}…`
      : sections[0].body;

  return {
    id,
    title,
    version: "session",
    effectiveDate: todayIso(),
    ownerDepartment: options.ownerDepartment ?? "マイナレッジ",
    summary,
    sections,
  };
}

export function titleFromFileName(fileName: string): string {
  return fileName.replace(/\.(md|txt)$/i, "").trim() || fileName;
}
