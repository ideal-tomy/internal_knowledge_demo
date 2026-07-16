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
};

/** Compact Access Mode control for Sample / BYOK / Trial. */
export function AccessModeBar({ trialPortalUrl, onModeChange }: AccessModeBarProps) {
  const [mode, setMode] = useState<IkAccessMode>(() => getIkAccessMode());
  const [apiKeyDraft, setApiKeyDraft] = useState(() => getApiKey(getIkProvider()));
  const [trialDraft, setTrialDraft] = useState(() => getTrialCode());
  const [savedHint, setSavedHint] = useState<string | null>(null);

  const applyMode = (next: IkAccessMode) => {
    setIkAccessMode(next);
    setMode(next);
    onModeChange?.(next);
    setSavedHint(null);
  };

  const saveByok = () => {
    setApiKey(getIkProvider(), apiKeyDraft.trim());
    setSavedHint("APIキーを保存しました（このタブのセッション）");
  };

  const saveTrial = () => {
    setTrialCode(trialDraft.trim());
    setSavedHint("体験コードを保存しました（このタブのセッション）");
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
        <div className="access-mode-bar-fields">
          <input
            className="access-mode-input"
            type="password"
            autoComplete="off"
            placeholder="OpenAI APIキー"
            value={apiKeyDraft}
            onChange={(e) => setApiKeyDraft(e.target.value)}
          />
          <button type="button" className="access-mode-save" onClick={saveByok}>
            保存
          </button>
        </div>
      ) : null}

      {mode === "managed-trial" ? (
        <div className="access-mode-bar-fields">
          <input
            className="access-mode-input"
            type="text"
            autoComplete="off"
            placeholder="体験コード"
            value={trialDraft}
            onChange={(e) => setTrialDraft(e.target.value)}
          />
          <button type="button" className="access-mode-save" onClick={saveTrial}>
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
