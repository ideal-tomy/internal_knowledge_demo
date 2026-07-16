/** Demo-side access flags（実 Provider 定義は Core 側） */
export const providerConfig = {
  sample: true,
  byok: true,
  trial: true,
  trialProvider: "openai" as const,
};

export type ProviderConfig = typeof providerConfig;
