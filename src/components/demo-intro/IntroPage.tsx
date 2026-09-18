import { DemoIntro } from "./DemoIntro";

export function IntroPage() {
  return <main className="ki-landing"><div className="ki-inner">
    <header className="ki-header"><a href="#" className="ki-brand">社内ナレッジAI</a><a href="#demo">デモを体験する ↗</a></header>
    <div className="ki-hero"><p className="ki-eyebrow">INTERNAL KNOWLEDGE</p><h1>社内ルールの「どうすれば？」に、<br className="ki-desktop-break" />根拠のある答えを。</h1><p>規程を探す。条件を確認する。手続きを知る。<br />いつもの言葉で聞くと、次の行動が見えてきます。</p></div>
    <DemoIntro />
    <div className="ki-entry"><div><h2>今度は、あなたの質問で。</h2><p>サンプルの社内規程で、回答と根拠を確かめられます。</p></div><a className="ki-cta" href="#demo">デモを体験する <span>→</span></a></div>
    <div className="ki-features"><div><span>01</span><h3>いつもの言葉で聞く</h3><p>勤怠・休暇、在宅勤務、購買。気になることから始められます。</p></div><div><span>02</span><h3>根拠までたどれる</h3><p>回答と一緒に、参照した資料と条項を確認できます。</p></div><div><span>03</span><h3>次の手続きが分かる</h3><p>適用条件や必要な申請を整理。不足する情報も確認します。</p></div></div>
    <footer className="ki-footer">紹介には架空の会社のサンプル規程を使用しています。</footer>
  </div></main>;
}
