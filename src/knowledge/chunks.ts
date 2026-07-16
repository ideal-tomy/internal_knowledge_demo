import { sampleDocuments, type KnowledgeDocument } from "./sample-pack";

export type KnowledgeChunk = {
  id: string;
  documentId: string;
  documentTitle: string;
  version: string;
  sectionId: string;
  sectionTitle: string;
  articleNumber?: string;
  text: string;
  excerpt: string;
};

export function buildChunksFromDocument(doc: KnowledgeDocument): KnowledgeChunk[] {
  return doc.sections.map((section) => {
    const excerpt =
      section.body.length > 180 ? `${section.body.slice(0, 180)}…` : section.body;
    return {
      id: `${doc.id}:${section.id}`,
      documentId: doc.id,
      documentTitle: doc.title,
      version: doc.version,
      sectionId: section.id,
      sectionTitle: section.title,
      articleNumber: section.articleNumber,
      text: [
        doc.title,
        section.articleNumber ?? "",
        section.title,
        section.body,
      ]
        .filter(Boolean)
        .join("\n"),
      excerpt,
    };
  });
}

export function buildChunksFromDocuments(
  documents: KnowledgeDocument[],
): KnowledgeChunk[] {
  return documents.flatMap(buildChunksFromDocument);
}

let cachedSampleChunks: KnowledgeChunk[] | null = null;

export function getSampleChunks(): KnowledgeChunk[] {
  if (!cachedSampleChunks) {
    cachedSampleChunks = buildChunksFromDocuments(sampleDocuments);
  }
  return cachedSampleChunks;
}
