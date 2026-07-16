export const demoConfig = {
  demoId: "internal-knowledge",
  /** @axeon/ai-demo-core configureDemoCore 用 */
  id: "internal-knowledge",
  demoName: "社内ナレッジAI",
  name: "社内ナレッジAI",
  description: "就業規則・業務マニュアル等の社内ナレッジに質問できるチャット型デモ",
  demoType: "chat" as const,
  defaultMode: "sample" as const,
  defaultAccessMode: "sample" as const,
  trialPortalEnabled: true,
  storageNamespace: "internal-knowledge",
  defaultRoleId: "employee",
  defaultProvider: "openai" as const,
  defaultModel: "gpt-5-nano",
  knowledgePolicy: {
    recommendedMax: 20000,
    warningFrom: 20001,
    hardLimit: 30000,
  },
  chat: {
    maxHistoryMessages: 8,
  },
};

export type DemoConfig = typeof demoConfig;
