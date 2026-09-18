export type Camera = readonly [number, number, number];
export type DeviceId = "ask" | "search" | "answer";

export const scenes: {
  title: string;
  caption: string;
  duration: number;
  camera: Camera;
  stars: readonly DeviceId[];
}[] = [
  { title: "質問する", caption: "半休のあと、在宅勤務できる？ いつもの言葉で質問。", duration: 5000, camera: [158, 176, 1.3], stars: ["ask"] },
  { title: "規程につながる", caption: "同じ画面のまま、登録された社内規程を確認します。", duration: 4500, camera: [306, 176, 0.96], stars: ["ask", "search"] },
  { title: "規程を確認", caption: "勤怠と在宅勤務。関係する条項を横断して照合。", duration: 5000, camera: [454, 176, 1.18], stars: ["search"] },
  { title: "回答が届く", caption: "結論だけでなく、条件と必要な手続きも一緒に。", duration: 4500, camera: [604, 176, 0.96], stars: ["search", "answer"] },
  { title: "条件を確認", caption: "半休登録と在宅申請は別手続き。上長の承認も必要です。", duration: 6000, camera: [754, 176, 1.2], stars: ["answer"] },
  { title: "根拠を見る", caption: "回答の根拠を開き、元の規程まで確認できます。", duration: 6000, camera: [754, 176, 1.2], stars: ["answer"] },
  { title: "次の行動へ", caption: "探して終わりではなく、次に何をするかが分かります。", duration: 5000, camera: [754, 176, 1.05], stars: ["answer"] },
];

export const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);

export function storyFrame(time: number) {
  let elapsed = ((time % totalDuration) + totalDuration) % totalDuration;
  let index = 0;
  while (index < scenes.length - 1 && elapsed >= scenes[index].duration) {
    elapsed -= scenes[index++].duration;
  }
  const previous = scenes[index === 0 ? 0 : index - 1];
  const next = scenes[index];
  const t = Math.min(1, elapsed / 1200);
  const ease = t * t * (3 - 2 * t);
  const camera = next.camera.map((value, i) => previous.camera[i] + (value - previous.camera[i]) * ease) as unknown as Camera;
  return { index, elapsed, camera, stars: next.stars, previousStars: previous.stars, ease };
}
