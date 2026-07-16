import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ensureAiDemoCoreConfigured } from "./lib/ai-demo-core-setup";
import "./styles/scaffold.css";

ensureAiDemoCoreConfigured();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
