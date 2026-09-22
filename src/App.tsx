import { InternalKnowledgeDemo } from "./components/InternalKnowledgeDemo";
import { useEffect, useState } from "react";
import { IntroPage } from "./components/demo-intro/IntroPage";
import { DemoIntro } from "./components/demo-intro/DemoIntro";
import "./components/demo-intro/intro.css";

function isEmbedIntro() {
  return new URLSearchParams(window.location.search).get("embed") === "intro";
}

/** Real AI path: Sample / BYOK / Trial + Retrieval + Structured Output. */
export default function App() {
  const [embed] = useState(isEmbedIntro);
  const [demo, setDemo] = useState(() => window.location.hash === "#demo");
  useEffect(() => {
    const onHash = () => setDemo(window.location.hash === "#demo");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (embed) {
    return (
      <main className="ki-embed-intro">
        <DemoIntro />
      </main>
    );
  }

  return demo ? <InternalKnowledgeDemo /> : <IntroPage />;
}
