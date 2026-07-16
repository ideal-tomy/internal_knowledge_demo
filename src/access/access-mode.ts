export type IkAccessMode = "sample" | "byok-direct" | "managed-trial";

export const IK_ACCESS_MODE_LABELS: Record<IkAccessMode, string> = {
  sample: "サンプル",
  "byok-direct": "APIキー",
  "managed-trial": "体験コード",
};

export function isIkAccessMode(
  value: string | null | undefined,
): value is IkAccessMode {
  return (
    value === "sample" ||
    value === "byok-direct" ||
    value === "managed-trial"
  );
}
