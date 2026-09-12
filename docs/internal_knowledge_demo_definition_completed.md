# 社内ナレッジAI — Demo Definition

**Demo ID:** `internal-knowledge-ai`  
**Demo Name:** 社内ナレッジAI  
**バージョン:** v1.0 Draft  
**ステータス:** Core接続・体験設計初稿  
**Requirement File:** `internal_knowledge_requirements.md`  
**Sample Data:** `internal_knowledge_sample_data_spec.md`

---

# 0. 本書の役割

本書は、`ai_demo_standard_definition_template.md`を基準として、社内ナレッジAIデモのCore接続、Access Mode、Trial、UI、シナリオ、Input / Output Adapter、Demo固有差分、受け入れ条件を定義する。

テーマ固有の目的と機能要件は、`internal_knowledge_requirements.md`を正とする。

---

# 1. Demo Identity

## 1.1 基本情報

- Demo ID: `internal-knowledge-ai`
- Demo Name: `社内ナレッジAI`
- Brand ID: Configから注入
- Repository: 実装リポジトリに合わせて確定
- Production URL: デプロイ時に確定
- Demo Type:
  - [x] Chat
  - [ ] Form
  - [x] Upload / Knowledge Input Ready
  - [ ] Dashboard
  - [x] Workflow
  - [x] Knowledge Browser

## 1.2 対象ユーザー

- Primary User: 総務・人事・情シス・DX推進・業務改善担当
- Secondary User: 一般社員・マネージャー・経営者
- 利用シーン: 商談、提案、PoC前説明、社内導入検討、業務フロー検討

## 1.3 関連文書

- `internal_knowledge_requirements.md`
- `internal_knowledge_sample_data_spec.md`
- `internal_knowledge_implementation_plan.md`
- `internal_knowledge_conversation_ux.md` — Conversation UX原則・パターン・表示契約の正本
- `design.md` — UX参考調査（東京電力チャットボット分解。チャネル実装は非適用）
- `ai_demo_core_master_plan.md`
- `ai_demo_standard_definition_template.md`

---

# 2. Demo Goal

## 2.1 このデモで証明すること

> 情報量の多い複数の社内規程を事前に確認したうえで質問すると、AIが選択されたナレッジだけを検索・照合し、結論、根拠、必要手続き、次のアクションを素早く提示できることを体験してもらう。

## 2.2 体験後に持ってほしい理解

- AIは単一文書の検索だけでなく、複数文書の条件を横断確認できる
- AIが何を参照しているか、人間が事前・事後に確認できる
- 回答を根拠付きで検証できる
- チャット回答を申請、承認、振り分け、通知へ接続できる
- 自社の規程へ置き換えた利用イメージを持てる

## 2.3 営業上の主メッセージ

> 規程を探す時間を短縮するだけではなく、判断に必要な情報を集め、次に行う処理まで整理するAIとして業務へ組み込めます。

## 2.4 ROI 連動

- 正本: ワークスペース内 `roi-simulator`
- 環境変数: `VITE_ROI_SIMULATOR_URL`
- 遷移: `/?kit=chatbot&industry=other&cat=internal&from=internal-knowledge`
- 表示: 代表3手（根拠確認）完了後 + 設定シート末尾。別タブで開く（質問中・各回答直後の常時表示は廃止）
- 出口: 「見積もりを閉じる」→ 閲覧モード（業界選択可）。正本 [`roi-simulator/docs/demo-roi-integration-playbook.md`](../../roi-simulator/docs/demo-roi-integration-playbook.md) §1.2

---

# 3. Core Integration

## 3.1 CoreとDemoの責務

### Core

- Brand Config
- Provider Adapter
- Access Mode Transport
- AI Transport
- Prompt Builder基盤
- Usage正規化
- Cost計算
- Trial検証契約
- Usage / Budget Limit契約
- Knowledge Input基盤
- Document Text Ingest基盤
- Storage契約
- Error Normalizer
- 共通Types

### Demo

- サンプル規程パック
- Knowledge Library UI
- 文書ビューア
- ガイド質問
- 社内規程向けPrompt
- Query Input Adapter
- Retrieval条件
- Evidence / Workflow Output Adapter
- チャット体験
- 根拠表示
- ワークフロー可視化

## 3.2 使用するCore機能

- [x] Brand Config
- [x] Demo Config
- [x] Provider Adapter
- [x] Access Mode Transport
- [x] Sample Mode
- [x] BYOK契約
- [x] Trial Code契約
- [x] Usage Limit契約
- [x] Budget Limit契約
- [x] Knowledge
- [x] Document Text Ingest
- [x] Storage契約
- [x] Error Normalizer
- [x] Usage Normalizer
- [x] Pricing契約

## 3.3 Core Package

- Package Name: `@internal/ai-demo-core`候補、実装実態に合わせる
- Package Path: 既存Core配置に合わせる
- Dependency Method:
  - [x] workspace / local source
  - [ ] private npm
  - [ ] git package

## 3.4 Core接続原則

- CoreロジックをDemo側へコピーしない
- UIからProvider SDKを直接呼ばない
- Trial Code検証をDemo側で再実装しない
- Usage / Budget LimitをDemo側で独自計算しない
- Demo固有差分はConfig、Adapter、UI、Promptへ閉じ込める
- 社内ナレッジ固有の構造を無理にCoreへ追加しない
- 既存ISOデモのRAG・根拠表示で再利用可能なものを優先的に利用する

---

# 4. Access Mode

## 4.1 対応モード

- [x] Sample
- [x] API Key / BYOK
- [x] Trial Code
- [ ] Client Proxy

## 4.2 初期モード

```ts
defaultMode: "sample"
```

ただし、有効なTrial CodeがURLまたはセッションに存在する場合は、Trial Modeへ自動遷移できる設計とする。

## 4.3 各モードの役割

### Sample Mode

- ナレッジパックの閲覧
- ガイド質問の確認
- 固定回答または制限付きサンプル回答
- UIと回答形式の理解
- AI接続がない場合でも体験構造を確認可能

### BYOK Mode

- ユーザー自身のAPI Keyで実AI回答
- サンプル規程パックを対象に自由質問
- Provider / ModelはCoreの許可範囲で選択
- API Keyの保持方針はCoreに従う

### Trial Code Mode

- クライアントはProvider API Keyを入力しない
- 体験コードで実AI回答
- 7日間、最大10回を標準ポリシー候補とする
- 実際の上限は共通Trial Policyを正とする
- Demo側は残り回数と制限状態だけを表示する

## 4.4 Mode UI

- ExperienceModeBar: 使用
- 公開デモではSampleを初期表示
- 専用URLではTrial Code入力を優先表示可能
- Mode切替UIは業務体験を邪魔しない位置に置く

## 4.5 未設定時

- API Key未設定時: Sampleへ戻す、または設定導線を表示
- Trial Code未設定時: コード入力または取得導線を表示
- 接続失敗時: ナレッジ閲覧は維持し、再試行と設定確認を案内
- 設定クリア: CoreのClear / Resetを利用

---

# 5. Trial Portal Integration

## 5.1 Portal

- Trial Portal URL: 共通Configから注入
- Demo ID: `internal-knowledge-ai`
- Return URL: 現在のデモURL
- Brand ID: Brand Configから注入

## 5.2 導線

```text
社内ナレッジAI
↓
「体験コードを取得」
↓
共通Trial Portal
↓
コード発行
↓
元デモへ戻る
↓
Trial Code入力
↓
実AI体験
```

## 5.3 標準Trial表示

```text
体験期間: 7日間
利用回数: 最大10回
利用モデル: 許可された軽量モデル
費用表示: 無料体験 / 500円分相当の上限表現はPortal方針に従う
```

## 5.4 制限

Demo側で値を固定せず、Trial Policyを表示する。

想定項目:

- 有効期限
- 最大実行回数
- 最大金額
- 入力文字数
- 推定入力トークン
- 最大出力トークン
- Rate Limit
- 同時実行
- Provider Allowlist
- Model Allowlist

---

# 6. UI Definition

## 6.1 UIの役割

開いた直後から、説明資料ではなく実務ツールとして操作できる状態にする。

ユーザーは、質問前にナレッジを読み、質問後に回答・根拠・ワークフロー結果を同じ画面で比較できる。

## 6.2 PC画面構成

```text
┌───────────────────────────────────────────────────────────────┐
│ Brand / 社内ナレッジAI / Pack / Mode / Usage                 │
├───────────────┬────────────────────────┬──────────────────────┤
│ Knowledge     │ Conversation           │ Evidence / Workflow  │
│ Library       │                        │                      │
│               │ Guided Questions       │ Decision             │
│ Documents     │ Messages               │ Conditions           │
│ TOC           │ Composer               │ Required Actions     │
│ Viewer        │                        │ Citations            │
└───────────────┴────────────────────────┴──────────────────────┘
```

## 6.3 モバイル

- Main: Conversation
- Knowledge: Drawer
- Evidence / Workflow: Bottom SheetまたはDrawer
- Citationから原文へ直接移動

## 6.4 UI方針

- [x] 操作中心
- [ ] 説明中心
- [x] シングルスクリーン
- [ ] 複数ステップ
- [x] 実務ツール型
- [ ] プレゼン型
- [x] ハイブリッド型
- [x] Brand Adaptive

## 6.5 独自UI

- Knowledge Pack Summary
- Document Library
- Document Viewer
- Table of Contents
- Related Documents
- Guided Question Levels
- Intent Rails（Conversation UX P01）
- Guided Drill-down（P02）
- Limit Disclosure（P08）
- Retrieval Progress（P04）
- Answer Skeleton / Decision Card（P05）
- Follow-up Chips（P06）
- Clarifying Choice（P07）
- Evidence Drawer
- Workflow Preview
- Missing Information Card
- Citation Jump

Conversation列の操作品質・パターン定義の正本は`internal_knowledge_conversation_ux.md`とする。
サイト埋め込みランチャーやLINEトークUIの模倣は行わない。

---

# 7. Main Scenario

## 7.1 Scenario A: 規程を確認してから質問

```text
文書一覧を見る
↓
「在宅勤務規程」を開く
↓
主要ルールと本文を読む
↓
「午前半休後に午後から在宅勤務できますか」を選ぶ
↓
AIが3文書を検索
↓
条件付きで可能と回答
↓
必要申請・承認・不足情報を表示
↓
引用から原文へ戻る
```

## 7.2 Scenario B: 禁止・要確認を判断

```text
情報セキュリティ規程を見る
↓
顧客契約書を無料生成AIへアップロードしてよいか質問
↓
AIが原則不可と回答
↓
機密区分・未承認サービス禁止を根拠表示
↓
承認済みサービス・情シス確認を次のアクションとして表示
```

## 7.3 Scenario C: ワークフロー利用を理解

```text
緊急購入について質問
↓
AIが金額・年間契約・予算内外・顧客情報取扱いを確認
↓
不足情報を質問
↓
承認経路・情シスレビュー・事後申請期限を構造化
↓
フォーム初期入力や承認者自動選択への接続イメージを表示
```

---

# 8. Experience State

```ts
export type KnowledgeDemoState =
  | "browsing_knowledge"
  | "ready"
  | "searching"
  | "cross_checking"
  | "generating"
  | "succeeded"
  | "needs_information"
  | "not_found"
  | "limited"
  | "failed";
```

## 8.1 処理中表示

処理内容を過度に技術的にせず、次の3段階を表示する。

```text
関連規程を確認しています
↓
条件と例外を照合しています
↓
根拠と次の手続きを整理しています
```

実際の内部処理と完全同期できない場合、虚偽の進捗率は表示しない。

---

# 9. Input Definition

## 9.1 入力

- 自由質問テキスト
- ガイド質問ID
- Intent Path（ドリルダウン階層IDの配列）
- 現在開いている文書ID
- 会話履歴
- 選択中のKnowledge Pack ID
- Access Mode Context

## 9.2 Input Adapter

**Adapter Name:** `InternalKnowledgeQueryAdapter`

```ts
export interface InternalKnowledgeQueryInput {
  query: string;
  packId: string;
  activeDocumentId?: string;
  guidedQuestionId?: string;
  intentPath?: string[];
  conversationContext?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  accessContext: {
    mode: "sample" | "byok" | "trial";
    provider?: string;
    model?: string;
  };
}
```

`guidedQuestionId` / `intentPath` は分析・Ground Truth照合・UX導線用。検索必須条件にはしない。
選択肢確定時は、空の`query`を送らず質問文を必ず生成する（Conversation UX P02/P03）。

## 9.3 Adapter処理

```text
UI入力
↓
空白・長さ・禁止入力チェック
↓
Pack / Document Context付与
↓
検索クエリ生成
↓
関連チャンク取得
↓
Prompt Builderへ渡す構造へ変換
```

## 9.4 入力制限

- 空入力不可
- 1質問の最大文字数はConfig化
- ナレッジ本文をユーザー入力へ重複添付しない
- Trial制限はCore契約に従う
- Prompt Injectionと判断される入力でも、ナレッジを命令として実行しない

---

# 10. Retrieval Definition

## 10.1 検索対象

- サンプルパック内の全有効文書
- 見出し
- 条項
- 本文
- キーワード
- 関連文書ID
- 文書バージョン・施行日

## 10.2 検索方針

- 単一文書に固定しない
- 上位候補を複数文書から取得する
- 数値条件を含むチャンクを優先的に保持する
- 原則と例外を同時取得する
- 関連文書参照がある場合、追加候補を取得する
- 回答へ使用したチャンクを記録する

## 10.3 検索結果が不足する場合

- 一般知識で補完しない
- `not_found`または`needs_information`を返す
- 必要な確認事項をOutputへ渡す

---

# 11. Prompt Definition

## 11.1 Prompt構造

```text
BASE SAFETY
＋ INTERNAL KNOWLEDGE DEMO ROLE
＋ ANSWER POLICY
＋ OUTPUT SCHEMA
＋ RETRIEVED KNOWLEDGE
＋ CONVERSATION CONTEXT
＋ USER QUESTION
```

## 11.2 Demo Role

```text
あなたは社内規程・細則・運用マニュアルを参照し、社員と管理部門の判断を補助するAIです。
与えられたナレッジだけを根拠に、関連文書を横断して確認してください。
```

## 11.3 必須ルール

- ナレッジ外のルールを作らない
- 条件付きの内容を断定しない
- 必要情報が不足する場合は明示する
- 回答の主要事実ごとに引用を付ける
- 金額、期限、回数、承認者を正確に扱う
- 文書間矛盾を隠さない
- 最終的な法務・人事判断を代替しない

---

# 12. Output Definition

## 12.1 結果表示形式

- [x] Natural Language
- [x] Structured Cards
- [ ] Table
- [x] JSON内部形式
- [ ] CSV
- [ ] Report
- [x] Status / Decision
- [ ] Chart
- [ ] Download

## 12.2 Primary Output

ユーザーが取るべき結論を1〜3文で表示する。  
表示は Answer Skeleton（Conversation UX P05）に従い、Status Badgeと結論を先頭に置く。

## 12.3 補助情報

- [x] 根拠
- [x] 出典
- [ ] 数値化した信頼度
- [x] 推奨アクション
- [x] 詳細条件
- [x] 不足情報
- [x] Workflow Preview
- [x] Follow-up Chips
- [x] Clarifying Choice（不足情報の選択肢化）

数値の信頼度は、根拠のない擬似スコアになる場合は表示しない。  
根拠詳細はデフォルト折りたたみとし、結論より上に長い抜粋を置かない。

## 12.4 Output Adapter

**Adapter Name:** `InternalKnowledgeWorkflowOutputAdapter`

```ts
export type FollowUpAction =
  | "resend_variant"
  | "open_evidence"
  | "open_document"
  | "clarify"
  | "ask_related";

export interface InternalKnowledgeOutput {
  status: "allowed" | "conditional" | "needs_confirmation" | "not_allowed" | "not_found";
  conclusion: string;
  answer: string;
  bullets?: string[];
  conditions: string[];
  exceptions: string[];
  requiredActions: string[];
  requiredDocuments: string[];
  approvers: string[];
  responsibleDepartments: string[];
  deadlines: string[];
  missingInformation: string[];
  missingInfoChoices?: Array<{
    id: string;
    label: string;
    appendText: string;
  }>;
  followUps?: Array<{
    id: string;
    label: string;
    action: FollowUpAction;
    payload?: Record<string, string>;
  }>;
  citations: Array<{
    documentId: string;
    documentTitle: string;
    sectionId: string;
    sectionTitle: string;
    articleNumber?: string;
    excerpt: string;
    reason: string;
  }>;
  workflowPreview: {
    routingTarget?: string;
    formType?: string;
    suggestedFields: Record<string, string | number | boolean | null>;
    automationCandidates: string[];
  };
}
```

UIマッピング（Answer Blocks）の詳細は`internal_knowledge_conversation_ux.md` §5.3を正とする。

## 12.5 出力検証

- Schema Validation
- Citation IDの存在確認
- Citation本文と元チャンクの一致確認
- 参照していない文書名の除外
- 許可状態と回答本文の矛盾確認
- 成功回答に Follow-up が1つ以上あること（共通チップ可）
- `needs_information`時は`missingInformation`または`missingInfoChoices`があること

---

# 13. Demo-Specific Delta

## 13.1 UI Delta

- 文書事前閲覧
- 3ペイン構成
- 根拠から原文へのジャンプ
- Workflow Preview
- Intent Rails / Guided Drill-down（選択式進行）
- Answer Skeleton（結論先出し・根拠折りたたみ）
- Follow-up Chips / Clarifying Choice

## 13.2 Scenario Delta

- 規程を確認してから質問する
- 複数文書の条件照合
- 不足情報の追加確認
- 回答後の申請・承認イメージ
- カテゴリ選択から最大2タップで最初の質問送信

## 13.3 Input Delta

- Knowledge Pack ID
- Active Document Context
- 規程向け質問
- guidedQuestionId / intentPath

## 13.4 Output Delta

- 結論状態
- 条件・例外
- 手続き・承認者・期限
- 文書・条項単位の引用
- Workflow Preview
- bullets / followUps / missingInfoChoices

## 13.5 Business Rule Delta

- 選択ナレッジのみを根拠にする
- 最新施行日を優先する
- 規程と細則の関係を保持する
- 矛盾は自動解決しない

## 13.6 Provider / Model Delta

- Structured Output対応を優先
- 軽量モデルで営業品質が成立すること
- Provider固有PromptはCoreのOverride契約を利用
- Demo UIにProvider固有処理を書かない

---

# 14. Demo Config

```ts
export const demoConfig = {
  demoId: "internal-knowledge-ai",
  demoName: "社内ナレッジAI",
  brandId: "default",
  demoType: "knowledge-chat-workflow",
  defaultMode: "sample",
  defaultKnowledgePackId: "towa-corporate-rules-v1",
  features: {
    knowledgeBrowser: true,
    guidedQuestions: true,
    intentRails: true,
    guidedDrilldown: true,
    freeQuestion: true,
    followUpChips: true,
    clarifyingChoice: true,
    answerSkeleton: true,
    evidenceDrawer: true,
    workflowPreview: true,
    customKnowledgeUpload: false
  },
  outputSchema: "internal-knowledge-output-v1",
  conversationUxSpec: "internal_knowledge_conversation_ux.md"
};
```

Phase 1完了後、`customKnowledgeUpload`を独立して有効化できる設計にする。

---

# 15. Error Definition

## 15.1 主なエラー

- Knowledge Pack読込失敗
- 文書読込失敗
- 検索結果なし
- AI接続失敗
- Structured Output不正
- Citation不整合
- Trial期限切れ
- Trial回数上限
- Budget上限
- Rate Limit
- 入力上限

## 15.2 UI方針

- ナレッジ閲覧可能なエラーでは閲覧を維持する
- 技術的な生メッセージを表示しない
- 再試行、質問変更、設定確認など次の行動を示す
- 制限到達時はProviderを呼ばない

---

# 16. Analytics / Demo Run

Demo Runへ最低限次を記録できる契約とする。

```ts
export interface InternalKnowledgeRunMetadata {
  packId: string;
  questionCategory?: string;
  retrievedDocumentIds: string[];
  retrievedChunkIds: string[];
  citationCount: number;
  answerStatus: string;
  missingInformationCount: number;
}
```

機密情報や質問本文を無制限に保存しない。

---

# 17. Acceptance Criteria

## 17.1 Demo Experience

- [ ] 開いた直後にサンプル規程一覧が見える
- [ ] 質問前に各文書を閲覧できる
- [ ] ガイド質問を1クリックで実行できる
- [ ] 自由質問できる
- [ ] 検索・照合・回答生成の状態が分かる
- [ ] 結論が最初に見える
- [ ] 必要手続きと次のアクションが見える
- [ ] 根拠から原文へ移動できる

## 17.1a Conversation UX

正本: `internal_knowledge_conversation_ux.md` §8

- [ ] 起動直後にできること／できないことが分かる（P08）
- [ ] カテゴリボタンから質問を開始できる（P01）
- [ ] 最大3階層のドリルダウンで具体質問を送信できる（P02）
- [ ] ドリルダウン中でも自由文送信できる（P03）
- [ ] 回答先頭で Status と結論が見える（P05）
- [ ] 根拠がデフォルト折りたたみである（P05）
- [ ] 回答後に Follow-up Chips がある（P06）
- [ ] 不足情報を選択肢で追加確認できる（P07）
- [ ] LINE / サイトフロートUIを模していない
- [ ] Knowledge事前閲覧導線が残っている

## 17.2 Knowledge Quality

- [ ] 8文書が読み込まれる
- [ ] 文書メタデータが表示される
- [ ] 複数文書を検索できる
- [ ] 原則と例外を同時に扱える
- [ ] 情報不足を検出できる
- [ ] ナレッジ外質問で推測しない

## 17.3 Core Integration

- [ ] Provider接続はCore経由
- [ ] Access ModeはCore契約経由
- [ ] Trial処理はCore契約経由
- [ ] Usage / Budget LimitはCore契約経由
- [ ] Demo固有差分はConfig / Adapter / UI / Promptに限定
- [ ] 既存ISO実装から再利用できる部分を複製せず利用

## 17.4 Access Mode

- [ ] Sample動作
- [ ] BYOK動作または接続契約確認
- [ ] Trial Code動作または接続契約確認
- [ ] 未設定時UIが適切
- [ ] 設定クリア可能

## 17.5 Production

- [ ] Build成功
- [ ] Type Check成功
- [ ] 主要E2E成功
- [ ] PC / モバイル成功
- [ ] 環境変数整理済み
- [ ] README / HANDOFF更新済み

---

# 18. Definition of Done

- [ ] テーマ別要件定義書と整合している
- [ ] サンプルデータ仕様と整合している
- [x] Conversation UX仕様と整合している
- [ ] Core接続範囲が確定している
- [ ] Access Modeが定義されている
- [ ] Input Adapterが定義されている
- [ ] Output Adapterが定義されている
- [ ] Demo固有Deltaが明文化されている
- [ ] Main Scenarioが最後まで通る
- [ ] Ground Truthテストが合格する
- [ ] 新規のCore複製がない
- [ ] 本番デプロイ可能

---

# 19. Design Principle

## Coreは能力を提供する

```text
Provider
Transport
Access Mode
Trial
Limits
Knowledge Input
Storage
Usage
Error
```

## Demoは業務体験を提供する

```text
規程を読む
選ぶ / 質問する（Intent Rails・ハイブリッド入力）
複数文書を照合する
結論と次の一手をすぐ見る
根拠を確認する
次の手続きを理解する
ワークフロー組み込みを想像する
```

本デモでは、共通チャットUIを見せること自体を目的にしない。  
Conversation UXはチャネル模倣ではなく、選択式進行・知覚速度・見やすさ・行き止まりゼロを業務体験へ接続するためのものである。

> **人が複数規程を確認して判断していた業務を、AIがどのように補助し、次の処理へつなげるかを見せる。**
