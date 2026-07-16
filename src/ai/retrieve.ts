import { type KnowledgeChunk } from "../knowledge/chunks";
import { getActiveChunks } from "../knowledge/pack-store";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[？?！!。、．，,§]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const SYNONYM_GROUPS: string[][] = [
  ["在宅", "リモート", "テレワーク", "自宅"],
  ["半休", "半日", "午前休", "午後休"],
  ["休暇", "有給", "看護", "全日休"],
  ["承認", "上長", "申請", "決裁"],
  ["購入", "購買", "緊急", "稟議", "経費"],
  ["フレックス", "コアタイム", "勤務時間"],
];

function expandTokens(question: string): string[] {
  const n = normalize(question);
  const base = n
    .split(/[\s/・：:（）()【】\[\]\-]+/)
    .filter((t) => t.length >= 2);

  const extra: string[] = [];
  for (const group of SYNONYM_GROUPS) {
    if (group.some((g) => n.includes(normalize(g)))) {
      extra.push(...group.map(normalize));
    }
  }
  return [...new Set([...base, ...extra])];
}

export type ScoredChunk = KnowledgeChunk & { score: number };

/** Keyword retrieval over active pack sections (demo-side; not in Core). */
export function retrieveChunks(
  question: string,
  options?: { topK?: number; chunks?: KnowledgeChunk[] },
): ScoredChunk[] {
  const topK = options?.topK ?? 6;
  const chunks = options?.chunks ?? getActiveChunks();
  const tokens = expandTokens(question);
  if (tokens.length === 0) return [];

  const scored = chunks.map((chunk) => {
    const hay = normalize(chunk.text);
    let score = 0;
    for (const t of tokens) {
      if (t.length < 2) continue;
      if (hay.includes(t)) score += t.length >= 3 ? 3 : 2;
      if (normalize(chunk.sectionTitle).includes(t)) score += 2;
      if (normalize(chunk.documentTitle).includes(t)) score += 1;
    }
    return { ...chunk, score };
  });

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
