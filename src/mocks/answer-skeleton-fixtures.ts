import type { InternalKnowledgeOutput } from "../types/internal-knowledge";

/** P05 preview fixtures — Sample Mode 相当の静的回答 */

export const fixtureConditionalHalfDayWfh: InternalKnowledgeOutput = {
  status: "conditional",
  conclusion:
    "条件を満たせば可能です。午前半休の登録後に在宅勤務申請を別途行い、直属上長の承認が必要です。",
  answer:
    "午前の看護等による半休と、午後からの在宅勤務は併用できます。ただし勤怠区分の登録と在宅勤務申請は別手続きです。当日申請でも規程上は認められる場合がありますが、上長承認が前提です。",
  bullets: [
    "午前半休と午後在宅の併用は条件付きで可能",
    "半休登録と在宅勤務申請は別手続き",
    "直属上長の承認が必要",
  ],
  conditions: [
    "午前休として勤怠を正しく区分登録していること",
    "在宅勤務の週上限日数を超えていないこと",
    "直属上長が事前または当日中に承認すること",
  ],
  exceptions: [
    "機密作業や顧客先常駐など在宅不可の業務区分には適用しない",
    "月次締め後の遡及変更は別承認経路が必要",
  ],
  requiredActions: [
    "勤怠システムで午前半休を申請する",
    "在宅勤務申請を午後勤務分として提出する",
    "直属上長の承認を得る",
  ],
  requiredDocuments: ["勤怠申請", "在宅勤務申請"],
  approvers: ["直属上長"],
  responsibleDepartments: ["人事部（勤怠）", "所属部門"],
  deadlines: ["原則として勤務当日中に申請・承認を完了する"],
  missingInformation: [],
  followUps: [
    {
      id: "fu-evidence",
      label: "根拠を見る",
      action: "open_evidence",
    },
    {
      id: "fu-remote-doc",
      label: "在宅勤務規程を開く",
      action: "open_document",
      payload: { documentId: "remote-work-policy", documentTitle: "在宅勤務規程" },
    },
    {
      id: "fu-resend-full-day",
      label: "全日休の場合は？",
      action: "resend_variant",
      payload: {
        question: "子どもの看護で全日休暇を取り、翌日在宅勤務できますか。",
      },
    },
  ],
  citations: [
    {
      documentId: "leave-attendance-rules",
      documentTitle: "勤怠・休暇運用細則",
      sectionId: "half-day-leave",
      sectionTitle: "半日休暇の取扱い",
      articleNumber: "第12条",
      excerpt:
        "半日休暇は午前または午後のいずれかを単位とし、残りの勤務時間については通常勤務または在宅勤務規程に従う勤務形態を選択できる。",
      reason: "半休と残勤務の併用可否の根拠",
    },
    {
      documentId: "remote-work-policy",
      documentTitle: "在宅勤務規程",
      sectionId: "application",
      sectionTitle: "申請と承認",
      articleNumber: "第8条",
      excerpt:
        "在宅勤務を行う日は、原則として前日までに所属長の承認を得る。急病等やむを得ない場合は当日申請を認める。",
      reason: "在宅勤務の申請・承認要件",
    },
  ],
  workflowPreview: {
    routingTarget: "直属上長",
    formType: "attendance-and-remote-work",
    suggestedFields: {
      leaveType: "午前半休",
      remoteWork: true,
      period: "午後",
    },
    automationCandidates: [
      "勤怠フォームに午前半休を初期入力する",
      "在宅勤務申請の承認者を直属上長に設定する",
    ],
  },
};

export const fixtureNeedsConfirmationPurchase: InternalKnowledgeOutput = {
  status: "needs_confirmation",
  conclusion:
    "緊急購入の可否と承認経路は、金額・予算区分・取扱データの有無によって変わります。判断に必要な情報が不足しています。",
  answer:
    "購買・稟議の規程上、緊急購入でも事後申請期限と承認者区分が定められています。現時点では金額と顧客情報の取扱いが不明なため、確定判断はできません。",
  bullets: [
    "緊急購入でも事後の申請・承認が必要",
    "金額帯により承認者が変わる",
    "顧客データを含む場合は情シス確認が追加される",
  ],
  conditions: ["予算内であること", "事後申請期限を守ること"],
  exceptions: ["個人情報・顧客契約データを含む購入は通常の緊急ルート外"],
  requiredActions: [
    "不足情報を確認する",
    "該当する承認ルートで事後申請する",
  ],
  requiredDocuments: ["購買申請", "稟議書（金額帯による）"],
  approvers: [],
  responsibleDepartments: ["総務・購買", "情シス（該当時）"],
  deadlines: ["購入後5営業日以内に事後申請（目安）"],
  missingInformation: [
    "購入金額（税込）",
    "予算内か予算外か",
    "顧客情報・契約データを扱うか",
  ],
  missingInfoChoices: [
    {
      id: "amount-under-100k",
      label: "金額は10万円未満",
      appendText: "購入金額は税込10万円未満です。",
    },
    {
      id: "amount-over-100k",
      label: "金額は10万円以上",
      appendText: "購入金額は税込10万円以上です。",
    },
    {
      id: "no-customer-data",
      label: "顧客データは扱わない",
      appendText: "顧客情報や契約データは扱いません。",
    },
  ],
  followUps: [
    {
      id: "fu-clarify",
      label: "条件を追加する",
      action: "clarify",
    },
    {
      id: "fu-evidence-purchase",
      label: "根拠を見る",
      action: "open_evidence",
    },
  ],
  citations: [
    {
      documentId: "purchase-rules",
      documentTitle: "経費精算・購買規程",
      sectionId: "emergency-purchase",
      sectionTitle: "緊急購入",
      articleNumber: "第21条",
      excerpt:
        "業務上やむを得ず事前承認前に購入した場合は、購入後速やかに事後申請を行い、金額に応じた承認を得なければならない。",
      reason: "緊急購入時の事後申請義務",
    },
  ],
  workflowPreview: {
    routingTarget: "総務・購買",
    formType: "emergency-purchase",
    suggestedFields: {
      purchaseType: "emergency",
      amount: null,
      handlesCustomerData: null,
    },
    automationCandidates: ["不足項目をフォーム必須にして差し戻しを防ぐ"],
  },
};

export const fixtureNotFoundCustomRule: InternalKnowledgeOutput = {
  status: "not_found",
  conclusion:
    "選択中のナレッジパックには、該当する社内ルールが見つかりませんでした。推測では回答しません。",
  answer:
    "ご質問の内容に対応する条項・運用ルールがサンプル規程内にありません。所管部署への確認、またはナレッジの追加が必要です。",
  bullets: [
    "ナレッジ内に該当ルールなし",
    "一般知識での補完は行わない",
    "所管への確認を推奨",
  ],
  conditions: [],
  exceptions: [],
  requiredActions: [
    "所管部署（人事・総務・情シス等）へ確認する",
    "必要なら該当マニュアルをナレッジへ追加する",
  ],
  requiredDocuments: [],
  approvers: [],
  responsibleDepartments: ["質問内容に応じた所管部署"],
  deadlines: [],
  missingInformation: [],
  followUps: [
    {
      id: "fu-related",
      label: "半休後の在宅について聞く",
      action: "ask_related",
      payload: { guidedQuestionId: "gq-half-day-wfh" },
    },
  ],
  citations: [],
  workflowPreview: {
    suggestedFields: {},
    automationCandidates: [],
  },
};

/** After P07 clarify: 10万円未満 + 顧客データなし → 条件付き可 */
export const fixturePurchaseAfterClarify: InternalKnowledgeOutput = {
  status: "conditional",
  conclusion:
    "税込10万円未満かつ顧客データを扱わない緊急購入なら、所属長承認のうえ事後5営業日以内に購買申請すれば進められます。",
  answer:
    "金額が10万円未満の場合、稟議は原則不要で所属長承認と事後の購買申請が必要です。顧客データを扱わない前提です。",
  bullets: [
    "10万円未満は所属長承認＋事後購買申請",
    "購入後5営業日以内に申請",
    "顧客データ取扱いがある場合は別ルート",
  ],
  conditions: ["税込10万円未満", "顧客情報・契約データを扱わない", "予算内であること"],
  exceptions: ["年間契約やライセンス条項がある場合は情シス確認を追加"],
  requiredActions: [
    "所属長の承認を得る",
    "購入後5営業日以内に購買申請する",
  ],
  requiredDocuments: ["購買申請"],
  approvers: ["所属長"],
  responsibleDepartments: ["総務・購買"],
  deadlines: ["購入後5営業日以内"],
  missingInformation: [],
  followUps: [
    {
      id: "fu-evidence-clarified",
      label: "根拠を見る",
      action: "open_evidence",
    },
    {
      id: "fu-purchase-doc",
      label: "購買規程を開く",
      action: "open_document",
      payload: { documentId: "purchase-rules", documentTitle: "経費精算・購買規程" },
    },
  ],
  citations: [
    {
      documentId: "purchase-rules",
      documentTitle: "経費精算・購買規程",
      sectionId: "emergency-purchase",
      sectionTitle: "緊急購入",
      articleNumber: "第21条",
      excerpt:
        "業務上やむを得ず事前承認前に購入した場合は、購入後速やかに事後申請を行い、金額に応じた承認を得なければならない。",
      reason: "緊急購入の事後申請",
    },
  ],
  workflowPreview: {
    routingTarget: "所属長",
    formType: "emergency-purchase",
    suggestedFields: {
      purchaseType: "emergency",
      amountBand: "under-100k",
      handlesCustomerData: false,
    },
    automationCandidates: ["承認者を所属長にセットする", "事後申請期限リマインダーを作成する"],
  },
};

/** resend_variant 用モック */
export const fixtureFullDayLeaveThenRemote: InternalKnowledgeOutput = {
  status: "allowed",
  conclusion:
    "全日の看護休暇等を取得した日は勤務対象外です。翌日の在宅勤務は、在宅勤務規程の申請・承認を満たせば可能です。",
  answer:
    "全日休暇の日に在宅勤務を重ねることはできません。翌日以降の在宅は通常の在宅申請フローに従います。",
  bullets: [
    "全日休暇日は勤務（在宅含む）不可",
    "翌日在宅は通常の在宅申請で可",
    "直属上長の承認が必要",
  ],
  conditions: ["在宅勤務の週上限を超えないこと", "前日または当日の在宅申請が承認されること"],
  exceptions: [],
  requiredActions: ["翌日分の在宅勤務申請を提出する", "直属上長の承認を得る"],
  requiredDocuments: ["在宅勤務申請"],
  approvers: ["直属上長"],
  responsibleDepartments: ["所属部門"],
  deadlines: ["原則として勤務日前日まで"],
  missingInformation: [],
  followUps: [
    {
      id: "fu-evidence-full-day",
      label: "根拠を見る",
      action: "open_evidence",
    },
  ],
  citations: [
    {
      documentId: "remote-work-policy",
      documentTitle: "在宅勤務規程",
      sectionId: "application",
      sectionTitle: "申請と承認",
      articleNumber: "第8条",
      excerpt:
        "在宅勤務を行う日は、原則として前日までに所属長の承認を得る。急病等やむを得ない場合は当日申請を認める。",
      reason: "翌日在宅の申請要件",
    },
  ],
  workflowPreview: {
    routingTarget: "直属上長",
    formType: "remote-work",
    suggestedFields: { remoteWork: true },
    automationCandidates: ["在宅申請フォームを開く"],
  },
};

export const answerSkeletonFixtures: Array<{
  id: string;
  title: string;
  question: string;
  output: InternalKnowledgeOutput;
}> = [
  {
    id: "conditional-half-day-wfh",
    title: "条件付き（conditional）",
    question: "子どもの体調不良で午前半休を取り、午後から自宅で勤務できますか。",
    output: fixtureConditionalHalfDayWfh,
  },
  {
    id: "needs-confirmation-purchase",
    title: "要確認（needs_confirmation）",
    question: "業務ツールを今日中に緊急購入したいのですが、誰の承認が必要ですか。",
    output: fixtureNeedsConfirmationPurchase,
  },
  {
    id: "not-found-custom-rule",
    title: "該当なし（not_found）",
    question: "フレックスタイムのコアタイムは何時から何時までですか。",
    output: fixtureNotFoundCustomRule,
  },
];
