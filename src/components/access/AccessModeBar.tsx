import { useState } from "react";
import {
  IK_ACCESS_MODE_LABELS,
  type IkAccessMode,
} from "../../access/access-mode";
import {
  getApiKey,
  getIkAccessMode,
  getIkProvider,
  getTrialCode,
  setApiKey,
  setIkAccessMode,
  setTrialCode,
} from "../../access/ik-settings";

type AccessModeBarProps = {
  trialPortalUrl: string;
  onModeChange?: (mode: IkAccessMode) => void;
  /** 保存成功後（シートを閉じる等） */
  onSaved?: () => void;
};

/** Compact Access Mode control for Sample / BYOK / Trial. */
export function AccessModeBar({
  trialPortalUrl,
  onModeChange,
  onSaved,
}: AccessModeBarProps) {
  const [mode, setMode] = useState<IkAccessMode>(() => getIkAccessMode());
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [trialDraft, setTrialDraft] = useState("");
  const [hasApiKey, setHasApiKey] = useState(
    () => Boolean(getApiKey(getIkProvider()).trim()),
  );
  const [hasTrialCode, setHasTrialCode] = useState(
    () => Boolean(getTrialCode().trim()),
  );
  const [editingApiKey, setEditingApiKey] = useState(
    () => !getApiKey(getIkProvider()).trim(),
  );
  const [editingTrial, setEditingTrial] = useState(
    () => !getTrialCode().trim(),
  );
  const [savedHint, setSavedHint] = useState<string | null>(null);

  const applyMode = (next: IkAccessMode) => {
    setIkAccessMode(next);
    setMode(next);
    onModeChange?.(next);
    setSavedHint(null);
  };

  const saveByok = () => {
    const value = apiKeyDraft.trim();
    if (!value) return;
    setApiKey(getIkProvider(), value);
    setApiKeyDraft("");
    setHasApiKey(true);
    setEditingApiKey(false);
    setSavedHint("APIキーを保存しました（このタブのセッション）");
    onSaved?.();
  };

  const saveTrial = () => {
    const value = trialDraft.trim();
    if (!value) return;
    setTrialCode(value);
    setTrialDraft("");
    setHasTrialCode(true);
    setEditingTrial(false);
    setSavedHint("体験コードを保存しました（このタブのセッション）");
    onSaved?.();
  };

  const resetApiKey = () => {
    setApiKey(getIkProvider(), "");
    setApiKeyDraft("");
    setHasApiKey(false);
    setEditingApiKey(true);
    setSavedHint(null);
  };

  const resetTrial = () => {
    setTrialCode("");
    setTrialDraft("");
    setHasTrialCode(false);
    setEditingTrial(true);
    setSavedHint(null);
  };

  return (
    <div className="access-mode-bar">
      <div className="access-mode-bar-modes" role="group" aria-label="Access Mode">
        {(Object.keys(IK_ACCESS_MODE_LABELS) as IkAccessMode[]).map((key) => (
          <button
            key={key}
            type="button"
            className={
              mode === key ? "access-mode-chip is-active" : "access-mode-chip"
            }
            onClick={() => applyMode(key)}
          >
            {IK_ACCESS_MODE_LABELS[key]}
          </button>
        ))}
      </div>

      {mode === "byok-direct" ? (
        editingApiKey || !hasApiKey ? (
          <div className="access-mode-bar-fields">
            <input
              className="access-mode-input"
              type="password"
              autoComplete="off"
              placeholder="OpenAI APIキー"
              value={apiKeyDraft}
              onChange={(e) => setApiKeyDraft(e.target.value)}
            />
            <button
              type="button"
              className="access-mode-save"
              onClick={saveByok}
              disabled={!apiKeyDraft.trim()}
            >
              保存
            </button>
          </div>
        ) : (
          <div className="access-mode-saved">
            <p className="access-mode-saved-label">APIキーを保存済みです</p>
            <button
              type="button"
              className="access-mode-reset"
              onClick={resetApiKey}
            >
              入力をリセット
            </button>
          </div>
        )
      ) : null}

      {mode === "managed-trial" ? (
        editingTrial || !hasTrialCode ? (
          <div className="access-mode-bar-fields">
            <input
              className="access-mode-input"
              type="text"
              autoComplete="off"
              placeholder="体験コード"
              value={trialDraft}
              onChange={(e) => setTrialDraft(e.target.value)}
            />
            <button
              type="button"
              className="access-mode-save"
              onClick={saveTrial}
              disabled={!trialDraft.trim()}
            >
              保存
            </button>
            <a
              className="access-mode-portal"
              href={trialPortalUrl}
              target="_blank"
              rel="noreferrer"
            >
              コード取得
            </a>
          </div>
        ) : (
          <div className="access-mode-saved">
            <p className="access-mode-saved-label">体験コードを保存済みです</p>
            <button
              type="button"
              className="access-mode-reset"
              onClick={resetTrial}
            >
              入力をリセット
            </button>
          </div>
        )
      ) : null}

      {mode === "sample" ? (
        <p className="access-mode-note">
          サンプルは固定回答または規程検索のローカル合成です（Provider 非呼び出し）。
        </p>
      ) : null}

      {savedHint ? <p className="access-mode-hint">{savedHint}</p> : null}
    </div>
  );
}
