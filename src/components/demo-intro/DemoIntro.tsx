import { useEffect, useRef, useState } from "react";
import { IntroScreens } from "./IntroScreens";
import { scenes, storyFrame, totalDuration } from "./story";
import "./intro.css";

function isStageView() {
  return new URLSearchParams(window.location.search).get("view") === "stage";
}

export function DemoIntro() {
  const viewport = useRef<HTMLDivElement>(null);
  const clock = useRef(0);
  const [stage] = useState(isStageView);
  const [time, setTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [visible, setVisible] = useState(!document.hidden);
  const [width, setWidth] = useState(720);
  const [height, setHeight] = useState(424);

  useEffect(() => {
    if (!stage) return;
    document.documentElement.classList.add("ki-embed-stage-root");
    document.body.classList.add("ki-embed-stage-root");
    return () => {
      document.documentElement.classList.remove("ki-embed-stage-root");
      document.body.classList.remove("ki-embed-stage-root");
    };
  }, [stage]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReduced(query.matches);
    const onVisibility = () => setVisible(!document.hidden);
    query.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
      setHeight(entry.contentRect.height);
    });
    if (viewport.current) observer.observe(viewport.current);
    return () => { query.removeEventListener("change", onMotion); document.removeEventListener("visibilitychange", onVisibility); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (paused || reduced || !visible) return;
    let frame = 0;
    let last: number | undefined;
    const tick = (now: number) => {
      if (last !== undefined) clock.current = (clock.current + now - last) % totalDuration;
      last = now;
      setTime(clock.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, reduced, visible]);

  useEffect(() => {
    if (!paused && visible) return;
    const animations = viewport.current?.getAnimations({ subtree: true }) ?? [];
    animations.forEach(animation => animation.pause());
    return () => animations.forEach(animation => animation.play());
  }, [paused, visible]);

  const current = storyFrame(time);
  const index = reduced ? 6 : current.index;
  const camera = reduced ? scenes[6].camera : current.camera;
  const stars = reduced ? scenes[6].stars : current.stars;
  const fitFor = (count: number) => (count >= 2 ? 640 : 400);
  const fit = reduced
    ? fitFor(stars.length)
    : fitFor(current.previousStars.length) + (fitFor(stars.length) - fitFor(current.previousStars.length)) * current.ease;
  const scale = camera[2] * Math.min(1, (width - 24) / fit);
  const cameraY = stage ? height / 2 : 168;
  const stageOpacity = stage ? 1 : (index === 6 ? 0.23 : 1);
  const motion = scenes[index].motion;
  const restart = () => { clock.current = 0; setTime(0); setPaused(false); };

  return <section className={`ki-story${stage ? " ki-story-stage" : ""}`} aria-label="社内ナレッジAIの使い方">
    {stage ? null : <div className="ki-story-top"><span>使い方を見てみる</span><span>約36秒 · サンプル規程での紹介</span></div>}
    <div className="ki-viewport" ref={viewport} data-scene={index} data-time={Math.round(time)} data-paused={paused || reduced}>
      <div className="ki-stage" aria-hidden="true" inert style={{ transform: `translate(${width / 2 - camera[0] * scale}px, ${cameraY - camera[1] * scale}px) scale(${scale})`, opacity: stageOpacity }}>
        <IntroScreens phase={index} sent={index > 0 || current.elapsed >= 1600} stars={stars} />
      </div>
      {stage || index !== 6 ? null : <div className="ki-summary"><span>社内の知識を、次の行動へ。</span><h3>質問から、根拠の確認まで。</h3><div><span>質問する</span><b>→</b><span>規程を確認</span><b>→</b><span>手続きが分かる</span></div><p>不足情報は確認し、資料にないことは推測しません。</p></div>}
      {stage ? null : <div className="ki-hud"><div className="ki-dots" aria-hidden="true">{scenes.map((scene, i) => <span key={scene.title} className={i === index ? "ki-current" : ""} />)}</div><p>{scenes[index].caption}</p></div>}
    </div>
    {stage
      ? (motion ? <p className="ki-motion">{motion}</p> : null)
      : <div className="ki-controls"><p>{reduced ? "動きを抑えた表示になっています" : `${index + 1} / ${scenes.length}　${scenes[index].title}`}</p><div>{!reduced ? <><button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? "紹介を再生する" : "紹介を一時停止する"}>{paused ? "▶ 再生" : "Ⅱ 一時停止"}</button><button type="button" onClick={restart}>最初から</button></> : null}</div></div>}
  </section>;
}
