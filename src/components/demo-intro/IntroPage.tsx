import { DemoIntro } from "./DemoIntro";

export function IntroPage() {
  return (
    <main className="ki-landing">
      <div className="ki-inner">
        <header className="ki-header">
          <a href="#" className="ki-brand">
            社内ナレッジAI
          </a>
          <a href="#demo">デモを体験する ↗</a>
        </header>
        <div className="ki-hero">
          <p className="ki-eyebrow">INTERNAL KNOWLEDGE</p>
          <h1>社内ナレッジAI</h1>
          <p>サンプル規程で、質問から根拠まで試せます。</p>
        </div>
        <DemoIntro />
        <div className="ki-entry">
          <a className="ki-cta" href="#demo">
            デモを体験する <span>→</span>
          </a>
        </div>
        <footer className="ki-footer">
          紹介には架空の会社のサンプル規程を使用しています。
        </footer>
      </div>
    </main>
  );
}
