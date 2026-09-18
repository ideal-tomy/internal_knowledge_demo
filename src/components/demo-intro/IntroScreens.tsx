import { memo, type ReactNode } from "react";
import { DecisionCard } from "../conversation/DecisionCard";
import { RetrievalProgress } from "../conversation/RetrievalProgress";
import { toAnswerBlocks } from "../../adapters/internal-knowledge-output-adapter";
import { fixtureConditionalHalfDayWfh } from "../../mocks/answer-skeleton-fixtures";
import { sampleDocuments } from "../../knowledge/sample-pack";
import type { KnowledgeDemoState } from "../../types/internal-knowledge";
import type { DeviceId } from "./story";

const blocks = toAnswerBlocks(fixtureConditionalHalfDayWfh);
const relatedDocs = sampleDocuments.slice(0, 2);

function phoneClass(id: DeviceId, stars: readonly DeviceId[]) {
  return `ki-device ki-phone ki-${id}${stars.includes(id) ? " ki-active" : " ki-idle"}`;
}

function Phone({ id, stars, children }: { id: DeviceId; stars: readonly DeviceId[]; children: ReactNode }) {
  return (
    <div className={phoneClass(id, stars)}>
      <div className="ki-island" />
      <div className="ki-device-bar">社員 <span>社内ナレッジAI</span></div>
      <div className="ki-phone-body">{children}</div>
    </div>
  );
}

function retrievalState(phase: number): KnowledgeDemoState {
  if (phase <= 1) return "searching";
  if (phase === 2) return "cross_checking";
  return "generating";
}

export const IntroScreens = memo(function IntroScreens({
  phase,
  sent,
  stars,
}: {
  phase: number;
  sent: boolean;
  stars: readonly DeviceId[];
}) {
  return <>
    <Phone id="ask" stars={stars}>
      <span className="ki-mini-label">標準規程</span>
      <h3>社内ルールを、<br />その場で確認。</h3>
      <p className="ki-chat-bot">何について知りたいですか？</p>
      <div className="ki-topics"><span>勤怠・休暇</span><span>在宅勤務</span></div>
      <p className={`ki-question ${sent ? "ki-sent" : ""}`}>子どもの体調不良で午前半休を取り、午後から自宅で勤務できますか。</p>
      <div className="ki-send">{sent ? "送信済み ✓" : "質問を送信 ↑"}</div>
    </Phone>
    <Phone id="search" stars={stars}>
      <p className="ki-question ki-sent ki-mini-q">午前半休のあと、在宅勤務できますか。</p>
      <RetrievalProgress state={retrievalState(phase)} />
      <ul className="ki-hit-list">
        {relatedDocs.map((doc, i) => (
          <li key={doc.id} className={phase >= 2 || i === 0 ? "is-hit" : ""}>
            <span>文</span>
            <div>
              <strong>{doc.title}</strong>
              <small>{doc.ownerDepartment}</small>
            </div>
            <b>{phase >= 2 || i === 0 ? "✓" : "…"}</b>
          </li>
        ))}
      </ul>
    </Phone>
    <Phone id="answer" stars={stars}>
      <p className="ki-question ki-sent ki-mini-q">午前半休のあと、在宅勤務できますか。</p>
      <div className={`ki-answer-content ${phase >= 5 ? "ki-evidence-view" : ""}`}>
        <DecisionCard blocks={blocks} evidenceOpen={phase >= 5} />
      </div>
    </Phone>
  </>;
});
