import type { Citation } from "../types/internal-knowledge";
import manifestJson from "../../data/sample/towa-corporate-rules-v1/manifest.json";
import leaveDoc from "../../data/sample/towa-corporate-rules-v1/documents/leave-attendance-rules.json";
import remoteDoc from "../../data/sample/towa-corporate-rules-v1/documents/remote-work-policy.json";
import purchaseDoc from "../../data/sample/towa-corporate-rules-v1/documents/purchase-rules.json";

export type KnowledgeSection = {
  id: string;
  title: string;
  articleNumber?: string;
  body: string;
};

export type KnowledgeDocument = {
  id: string;
  title: string;
  version: string;
  effectiveDate: string;
  ownerDepartment: string;
  summary: string;
  sections: KnowledgeSection[];
};

export type KnowledgePackManifest = {
  packId: string;
  name: string;
  companyName: string;
  isFictional: boolean;
  version: string;
  documentCount: number;
  categories: string[];
  lastUpdated: string;
};

export const samplePackManifest = manifestJson as KnowledgePackManifest;

export const sampleDocuments: KnowledgeDocument[] = [
  leaveDoc as KnowledgeDocument,
  remoteDoc as KnowledgeDocument,
  purchaseDoc as KnowledgeDocument,
];

export function findSampleDocument(documentId: string): KnowledgeDocument | undefined {
  return sampleDocuments.find((doc) => doc.id === documentId);
}

export function findSection(
  documentId: string,
  sectionId: string,
): { document: KnowledgeDocument; section: KnowledgeSection } | undefined {
  const document = findSampleDocument(documentId);
  if (!document) return undefined;
  const section = document.sections.find((s) => s.id === sectionId);
  if (!section) return undefined;
  return { document, section };
}

export type OpenDocumentTarget = {
  documentId: string;
  sectionId?: string;
  reason?: string;
};

export function targetFromCitation(citation: Citation): OpenDocumentTarget {
  return {
    documentId: citation.documentId,
    sectionId: citation.sectionId,
    reason: citation.reason,
  };
}
