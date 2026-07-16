import { demoConfig } from "@config/demo.config";
import {
  clearAll,
  getApiKey,
  getSettings,
  getTrialCode,
  setApiKey,
  setSettings,
  setTrialCode,
  type StudioSettings,
} from "@axeon/ai-demo-core/demo-core/storage";
import type { AiProvider } from "@axeon/ai-demo-core/types/access-mode";
import { isIkAccessMode, type IkAccessMode } from "./access-mode";

export function getIkAccessMode(): IkAccessMode {
  const mode = getSettings().accessMode;
  if (isIkAccessMode(mode)) return mode;
  if (isIkAccessMode(demoConfig.defaultAccessMode)) {
    return demoConfig.defaultAccessMode;
  }
  return "sample";
}

export function setIkAccessMode(mode: IkAccessMode): void {
  setSettings({ accessMode: mode as StudioSettings["accessMode"] });
}

export function getIkProvider(): AiProvider {
  return getSettings().provider ?? demoConfig.defaultProvider;
}

export function getIkModel(): string {
  return getSettings().model || demoConfig.defaultModel;
}

export {
  clearAll,
  getApiKey,
  getSettings,
  getTrialCode,
  setApiKey,
  setSettings,
  setTrialCode,
};
