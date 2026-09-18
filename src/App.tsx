import { InternalKnowledgeDemo } from "./components/InternalKnowledgeDemo";
import { useEffect, useState } from "react";
import { IntroPage } from "./components/demo-intro/IntroPage";

/** Real AI path: Sample / BYOK / Trial + Retrieval + Structured Output. */
export default function App() {
  const [demo, setDemo] = useState(() => window.location.hash === "#demo");
  useEffect(() => {
    const onHash = () => setDemo(window.location.hash === "#demo");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return demo ? <InternalKnowledgeDemo /> : <IntroPage />;
}
