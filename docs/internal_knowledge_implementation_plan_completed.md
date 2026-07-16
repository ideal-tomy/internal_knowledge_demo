# 社内ナレッジAI — 実装計画

**Demo ID:** `internal-knowledge-ai`  
**バージョン:** v1.0 Draft  
**ステータス:** Cursor実装タスク初稿  
**前提:** 共通環境構築中。既存Core・ISOデモの再利用可能範囲を確認してから実装する。

---

# 0. 本書の役割

本書は、`internal_knowledge_requirements.md`と`internal_knowledge_demo_definition.md`を実装へ落とし込むための、具体的な作業順序、ファイル構成、タスク、テスト、完了条件を定義する。

Conversation列の操作品質（選択式進行・結論先出し・Follow-up等）は`internal_knowledge_conversation_ux.md`を正本とする。  
UX参考調査`design.md`のチャネル実装（サイト埋め込み・LINE）は実装しない。

Cursorへ実装を依頼する際は、原則としてTask単位で進める。

一度に全体を実装せず、各Task完了後にBuild、Type Check、主要画面確認を行う。

---

# 1. 実装方針

## 1.1 Vertical Slice優先

最初に次の1本を最後まで通す。

```text
サンプル文書を閲覧
↓
ガイド質問を送信
↓
複数文書から関連箇所を取得
↓
構造化回答を生成
↓
結論・根拠・次のアクションを表示
↓
根拠から原文へ移動
```

すべての画面や全質問を先に作らない。

## 1.2 Coreを複製しない

次は既存Coreまたは共通契約を利用する。

- Provider Adapter
- AI Transport
- Access Mode
- Trial Code
- Usage / Budget Limit
- Pricing
- Storage
- Document Text Ingest
- Error Normalizer
- Usage Normalizer

## 1.3 既存ISOデモを優先確認

社内ナレッジAIは既存ISOデモと共通点が多い。

最初に次を調査し、再利用可否を分類する。

- Chat UI
- 質問送信Hook
- Retrieval / RAG処理
- Citation型
- 根拠ドロワー
- Document Viewer
- Prompt構造
- Loading / Error
- Sample / BYOK / Trial接続

分類:

```text
そのまま再利用
軽微なAdapterで再利用
Demo固有として新規実装
Core改善が必要
```

## 1.4 過剰な共通化をしない

社内規程固有の次の項目はDemo側へ置く。

- 文書パック
- ガイド質問
- 条件・例外・承認者を含むOutput Schema
- Workflow Preview
- Ground Truth

---

# 2. 推奨ディレクトリ構成

実際のリポジトリ構造を優先する。以下は候補であり、既存構造と重複させない。

```text
src/
├─ app/
│  ├─ page.tsx
│  └─ api/
│     └─ internal-knowledge/
│        └─ ask/route.ts
│
├─ demos/
│  └─ internal-knowledge/
│     ├─ components/
│     │  ├─ InternalKnowledgeDemo.tsx
│     │  ├─ KnowledgeLibrary.tsx
│     │  ├─ KnowledgePackSummary.tsx
│     │  ├─ KnowledgeDocumentCard.tsx
│     │  ├─ KnowledgeDocumentViewer.tsx
│     │  ├─ KnowledgeTableOfContents.tsx
│     │  ├─ GuidedQuestions.tsx
│     │  ├─ KnowledgeChat.tsx
│     │  ├─ RetrievalProgress.tsx
│     │  ├─ DecisionCard.tsx
│     │  ├─ WorkflowPreview.tsx
│     │  ├─ MissingInformationCard.tsx
│     │  ├─ EvidenceDrawer.tsx
│     │  └─ CitationItem.tsx
│     │
│     ├─ adapters/
│     │  ├─ internal-knowledge-input-adapter.ts
│     │  └─ internal-knowledge-output-adapter.ts
│     │
│     ├─ config/
│     │  ├─ demo.config.ts
│     │  ├─ knowledge.config.ts
│     │  └─ guided-questions.config.ts
│     │
│     ├─ data/
│     │  └─ towa-corporate-rules-v1/
│     │     ├─ manifest.json
│     │     ├─ documents/
│     │     ├─ scenarios.json
│     │     └─ ground-truth.json
│     │
│     ├─ hooks/
│     │  ├─ useInternalKnowledgeDemo.ts
│     │  └─ useKnowledgeDocument.ts
│     │
│     ├─ lib/
│     │  ├─ load-knowledge-pack.ts
│     │  ├─ build-knowledge-index.ts
│     │  ├─ retrieve-knowledge.ts
│     │  ├─ build-internal-knowledge-prompt.ts
│     │  ├─ validate-citations.ts
│     │  └─ evaluate-ground-truth.ts
│     │
│     ├─ schemas/
│     │  ├─ knowledge-document.schema.ts
│     │  ├─ internal-knowledge-input.schema.ts
│     │  └─ internal-knowledge-output.schema.ts
│     │
│     └─ types/
│        └─ internal-knowledge.ts
│
└─ tests/
   └─ internal-knowledge/
      ├─ unit/
      ├─ integration/
      └─ e2e/
```

既存Core側へ同名機能がある場合は新規作成せず、ImportまたはAdapterで利用する。

---

# 3. 実装フェーズ

# Phase 0 — 現状調査と環境確認

## Task 00: Repository Audit

### 目的

現在の環境構築状況、共通Core、既存ISOデモを確認し、二重実装を防ぐ。

### 調査対象

- ディレクトリ構造
- 使用Framework / Version
- Coreの配置
- Access Mode実装
- Provider Adapter
- AI Transport
- Trial契約
- Knowledge Input / Document Ingest
- Storage
- RAG / Retrieval
- Citation
- Error / Usage
- Test環境

### 成果物

`docs/internal-knowledge/reuse-audit.md`

記載項目:

```text
機能
既存ファイル
再利用可否
必要な変更
変更先
Demo固有かCore共通か
```

### 完了条件

- [ ] 既存ISOデモの再利用候補が一覧化されている
- [ ] Coreへ変更が必要な項目が分離されている
- [ ] 社内ナレッジDemoだけで実装する範囲が確定している
- [ ] コード変更前に方針が記録されている

---

## Task 01: Environment Health Check

### 確認項目

- [ ] 開発サーバー起動
- [ ] Build成功
- [ ] Type Check成功
- [ ] Lint成功
- [ ] 環境変数読込
- [ ] Provider接続契約
- [ ] Storage読込
- [ ] Trial / Access Modeの既存動作
- [ ] 既存デモへの影響なし

### 実装

必要な場合のみ、開発環境向けHealth表示または診断ログを追加する。

Provider SecretやAPI Keyをログへ出力しない。

---

# Phase 1 — 型・Config・サンプルデータ基盤

## Task 02: Demo Types and Schemas

### 実装対象

- `KnowledgePack`
- `KnowledgeDocument`
- `KnowledgeSection`
- `KnowledgeChunk`
- `KnowledgeCitation`
- `InternalKnowledgeQueryInput`
- `InternalKnowledgeOutput`
- `WorkflowPreview`
- `GroundTruthCase`

### 要件

- Zod等、既存のSchema Validatorへ合わせる
- Structured Output検証に利用可能
- UI型とAPI型を重複させない

### テスト

- 正常なManifestが通る
- 必須項目欠落で失敗する
- 不正なCitation IDで失敗する
- 不正なStatusで失敗する

---

## Task 03: Demo Config

### 実装項目

```ts
{
  demoId: "internal-knowledge-ai",
  defaultMode: "sample",
  defaultKnowledgePackId: "towa-corporate-rules-v1",
  outputSchema: "internal-knowledge-output-v1",
  features: {
    knowledgeBrowser: true,
    guidedQuestions: true,
    evidenceDrawer: true,
    workflowPreview: true,
    customKnowledgeUpload: false
  }
}
```

### 方針

- Brand固有値を入れない
- Provider固有値をUIへ直書きしない
- Trial上限をDemo Configへ固定しない
- Sample Packの差し替えをConfigで可能にする

---

## Task 04: Sample Knowledge Pack Skeleton

### 実装対象

- `manifest.json`
- 会社プロフィール
- 8文書のMarkdown
- `scenarios.json`
- `ground-truth.json`

### 初期Vertical Slice

最初は次の3文書を完成させる。

1. 勤怠・休暇運用細則
2. 在宅勤務規程
3. 就業規則

最初のガイド質問:

> 子どもの体調不良で午前半休を取り、午後から自宅で勤務できますか。

この質問が通った後、残り5文書とシナリオを追加する。

### 完了条件

- [ ] Manifestから3文書を読み込める
- [ ] 文書一覧に表示できる
- [ ] 見出しと本文を取得できる
- [ ] 文書間参照が保持される

---

# Phase 2 — Knowledge Browser

## Task 05: Knowledge Pack Summary

### 表示項目

- 架空企業表示
- 会社概要
- 文書数
- カテゴリ
- 更新日
- 体験可能な内容

### 完了条件

- [ ] デモを開いた直後に表示される
- [ ] 架空データであることが分かる
- [ ] LPではなくツール画面として表示される

---

## Task 06: Knowledge Library

### 実装機能

- 文書カード
- カテゴリフィルター
- 文書選択
- 関連文書表示
- 現在開いている文書の強調
- AIが参照可能な文書の表示

### 完了条件

- [ ] 8文書を一覧表示できる
- [ ] 文書メタデータが見える
- [ ] 文書を開ける
- [ ] 現在の参照対象が分かる

---

## Task 07: Document Viewer

### 実装機能

- 目次
- 見出しジャンプ
- 条項番号
- 本文
- 文書内検索
- 関連文書リンク
- 「この文書について質問」
- Citationからの該当箇所ジャンプ

### 状態

- Loading
- Loaded
- Not Found
- Error

### モバイル

DrawerまたはFull Screen Sheetで表示する。

### 完了条件

- [ ] 質問前に全文を確認できる
- [ ] 文書内検索が動作する
- [ ] Citationから正しい見出しへ移動できる

---

# Phase 3 — Knowledge Ingest / Retrieval

## Task 08: Pack Loader

### 処理

```text
Manifest読込
↓
Document読込
↓
Frontmatter / Heading解析
↓
Section生成
↓
Chunk生成
↓
Index構築または既存Ingestへ投入
```

### 方針

既存CoreまたはISOデモにDocument Ingestがある場合は再利用する。

### 完了条件

- [ ] 全文書を読み込める
- [ ] 文書・見出し・条項メタデータを保持できる
- [ ] 同一Packを重複投入しない
- [ ] 文書更新時に再構築できる

---

## Task 09: Chunk Builder

### ルール

- 見出し・条項単位を優先
- 500〜900日本語文字目安
- 80〜120文字の重複
- 表を分断しない
- 原則と例外を可能な限り同一文脈に保持
- `relatedDocumentIds`を保持

### テスト

- 条項途中で不自然に分断されない
- メタデータが失われない
- 数値条件が保持される
- 空チャンクを生成しない

---

## Task 10: Retrieval Adapter

### 処理

```text
質問正規化
↓
検索クエリ作成
↓
上位チャンク取得
↓
文書の偏りを調整
↓
関連文書参照を展開
↓
隣接チャンク補完
↓
Prompt用Context作成
```

### 要件

- 複数文書から候補を取得
- 単一文書の上位結果だけで埋めない
- 金額、期限、回数などの数値を落とさない
- 原則と例外を同時に取得
- 検索結果なしを明示

### テスト質問

- 午前半休 + 在宅勤務
- 領収書紛失 + 出張精算
- 10万円SaaS + 緊急購入
- 顧客契約書 + 生成AI

---

# Phase 4 — AI Query / Structured Output

## Task 11: Input Adapter

### ファイル候補

`adapters/internal-knowledge-input-adapter.ts`

### 責務

- UI入力検証
- Pack Context付与
- Conversation Context整理
- Retrieval入力生成
- Core `ask`契約へ変換

### 禁止

- Provider SDK直接呼出し
- Trial Code検証
- 料金計算
- Demo UIでPrompt文字列を組み立てる

---

## Task 12: Internal Knowledge Prompt

### 実装内容

- Demo Role
- 回答ルール
- Structured Output Schema
- Citationルール
- 不足情報ルール
- 矛盾検出ルール
- Workflow Previewルール

### 必須テスト

- ナレッジ外質問で推測しない
- 禁止を許可と誤判定しない
- 条件付き判断を断定しない
- 根拠のない文書名を出さない
- 文書中の命令文をSystem Instructionとして扱わない

---

## Task 13: Output Adapter

### ファイル候補

`adapters/internal-knowledge-output-adapter.ts`

### 処理

```text
AI Structured Output
↓
Schema Validation
↓
Citation ID検証
↓
元チャンクとの一致確認
↓
UI View Modelへ変換
```

### Fallback

Structured Outputが不正な場合:

1. 1回だけ修復処理
2. 修復失敗時は安全なエラー
3. 未検証の引用を表示しない

### 完了条件

- [ ] Statusが正規化される
- [ ] Citationが実在する
- [ ] 結論とStatusが矛盾しない
- [ ] Workflow PreviewがUI表示可能

---

# Phase 5 — Chat / Evidence / Workflow UI

## Task 14: Guided Questions

### 実装機能

- Level 1 / 2 / 3
- 関連カテゴリ
- 参照が予想される文書数
- 1クリック送信
- 質問送信後はチャット履歴へ追加

### 完了条件

- [ ] 初回ユーザーが迷わない
- [ ] 横断性能を確認できる質問が目立つ
- [ ] 同じ質問を再実行できる

---

## Task 14a: Intent Tree / Conversation UX Rails

**正本:** `internal_knowledge_conversation_ux.md`（P01/P02/P08）

### 実装機能

- `intent-tree.json` の読込
- Intent Rails（起動時カテゴリ）
- Guided Drill-down（最大3階層）
- Limit Disclosure（できること／できないこと）
- 葉ノードから既存ガイド質問への合流
- ドリルダウン中も Composer を常設（P03）

### 完了条件

- [ ] カテゴリから最大2タップ程度で最初の質問を送信できる
- [ ] 既存ガイド質問12件がツリー葉または短縮導線から到達できる
- [ ] LINE / フロートランチャーを模していない

---

## Task 15: Chat Interface

### 実装機能

- Message List
- Composer
- Submit
- Loading
- Retry
- Copy
- Reset
- Follow-up Chips（P06）
- Clarifying Choice（P07）
- 利用状況表示

### 方針

汎用チャットUIをそのまま置くだけではなく、Knowledge LibraryとEvidence / Workflowを主役にする。  
Conversation UXパターンID（P01–P08）をPR・完了条件の参照単位にする。

---

## Task 16: Retrieval Progress

### 表示

```text
関連規程を確認しています
条件と例外を照合しています
根拠と次の手続きを整理しています
```

### 禁止

- 実態と異なるパーセンテージ
- 実際には確認していない文書名の表示
- 長すぎる演出

Conversation UX上のパターンIDは P04。

---

## Task 17: Decision Card

### 表示順（Answer Skeleton / P05）

1. Status Badge
2. 結論
3. 要点（短文）
4. 必要手続き / 次のアクション
5. 条件（折りたたみ可）
6. 例外・注意（折りたたみ可）
7. 不足情報（ある場合は折りたたまない）
8. 根拠（デフォルト折りたたみ）
9. Follow-up Chips

Status:

- `allowed`
- `conditional`
- `needs_confirmation`
- `not_allowed`
- `not_found`

### 完了条件（追加）

- [ ] 結論が根拠より先に見える
- [ ] 根拠がデフォルト折りたたみである

---

## Task 18: Workflow Preview

### 表示項目

- 必要な手続き
- 必要書類
- 承認者
- 担当部署
- 期限
- 振り分け先
- フォームへ渡せる候補値
- 自動化候補

### 目的

チャット回答を、申請・承認・振り分けへ接続できることを可視化する。

---

## Task 19: Evidence Drawer

### 表示項目

- 文書名
- バージョン
- 施行日
- 条項・見出し
- 抜粋
- 回答への利用理由
- 原文を開く

### 完了条件

- [ ] 回答の主要事実に根拠がある
- [ ] 原文位置へ移動できる
- [ ] 同じ引用を重複表示しない
- [ ] 引用元が存在しない場合は表示しない

---

# Phase 6 — Access Mode / Trial接続

## Task 20: Access Mode Integration

### 対応

- Sample
- BYOK
- Trial Code

### 方針

既存CoreのMode Systemを利用する。

Demo側は、Modeに応じた表示と`ask`呼出しだけを担当する。

### 完了条件

- [ ] SampleでUI確認可能
- [ ] BYOKで実AI質問可能、または既存契約へ接続済み
- [ ] Trial Codeで実AI質問可能、または既存契約へ接続済み
- [ ] Mode切替で会話状態が破損しない

---

## Task 21: Usage / Limit Display

### 表示候補

- 残り回数
- 有効期限
- 利用モデル
- 制限到達

### 原則

- Trial Policyの値を表示する
- Demo側に10回・7日をHard Codeしない
- 制限超過時はAIを呼ばない
- CSV等の非AI操作は利用回数へ加算しない

---

# Phase 7 — Sample Pack完成

## Task 22: Remaining Documents

Vertical Slice成功後、残りを追加する。

4. 出張・旅費規程
5. 経費精算・購買規程
6. 稟議・承認権限規程
7. 情報セキュリティ・生成AI利用規程
8. 相談・事故・緊急時対応ガイド

### 完了条件

- [ ] 8文書完成
- [ ] 合計40,000文字以上
- [ ] 文書間参照15件以上
- [ ] ガイド質問12件以上
- [ ] Ground Truth 20件以上

---

## Task 23: Ground Truth Test Runner

### 目的

モデル変更やPrompt変更で回答品質が崩れていないか確認する。

### 評価

- 必須文書参照
- 必須事実
- 禁止主張
- Status
- 不足情報
- 次のアクション
- Citation整合

### 出力

```text
Case ID
Pass / Fail
Referenced Documents
Missing Required Facts
Forbidden Claims
Citation Errors
```

自動評価だけで完了とせず、主要ケースは人間が原文と比較する。

---

# Phase 8 — 品質・レスポンシブ・デプロイ

## Task 24: Error and Empty States

### 対象

- Pack読込失敗
- 文書なし
- 検索結果なし
- AI接続失敗
- JSON不正
- Citation不整合
- Trial期限切れ
- Trial上限
- Rate Limit
- Context Too Large

### 完了条件

- [ ] 画面全体が白くならない
- [ ] 次の行動が表示される
- [ ] 技術的な生エラーを出さない
- [ ] ナレッジ閲覧は可能な限り維持

---

## Task 25: Responsive

### PC

- 3ペイン
- Evidenceを常時表示可能

### Tablet

- 2ペイン
- KnowledgeまたはEvidenceを切替

### Mobile

- Chat中心
- Knowledge Drawer
- Evidence Bottom Sheet

### 確認

- 320px幅
- 768px幅
- 1024px以上
- Keyboard操作
- 長文引用
- 長い文書名

---

## Task 26: Accessibility

- Semantic HTML
- Button / Linkの役割明確化
- DrawerのFocus管理
- Escapeで閉じる
- Loadingをaria-liveで通知
- Statusを色だけで表現しない
- 引用リンクに文書名と条項を含める

---

## Task 27: Performance

- サンプル全文を初期HTMLへ重複埋込しない
- 文書本文は必要に応じて遅延読込
- 大きなコンポーネントを適切に分割
- AI SDKをUIへ複数読み込まない
- 検索Indexを不要に再生成しない
- 送信後すぐLoading状態へ移行

---

## Task 28: Security Review

- API KeyをConsoleへ出さない
- Provider SecretをBrowserへ返さない
- Trial Codeをログへ生出力しない
- Sample Dataに実在情報を含めない
- Markdown描画をSanitize
- Prompt Injection対策
- Citation excerptを安全に描画
- ユーザー質問を無期限保存しない

---

## Task 29: Acceptance E2E

### E2E-01 文書閲覧

```text
デモを開く
→ 文書一覧を確認
→ 在宅勤務規程を開く
→ 目次から情報セキュリティへ移動
```

### E2E-02 横断質問

```text
午前半休 + 在宅勤務質問
→ 3文書参照
→ 条件付き回答
→ 不足情報表示
→ 引用から原文へ移動
```

### E2E-03 禁止判断

```text
顧客契約書を無料生成AIへアップロード
→ not_allowed
→ 情報セキュリティ規程引用
→ 情シス確認を表示
```

### E2E-04 ワークフロー

```text
10万円SaaS緊急購入
→ 追加情報確認
→ 承認者・情シスレビュー・期限表示
→ Workflow Preview表示
```

### E2E-05 制限

```text
Trial上限到達
→ AIを呼ばない
→ 制限表示
→ 次の導線表示
```

### E2E-06 モバイル

```text
Chat
→ Knowledge Drawer
→ 文書閲覧
→ 質問
→ Evidence Bottom Sheet
```

---

## Task 30: Deploy and Handoff

### 実施項目

- Staging Deploy
- Production Build
- 環境変数整理
- Trial Portal / Return URL確認
- Sample Pack読込確認
- Provider接続確認
- 主要Ground Truth確認
- README更新
- HANDOFF更新

### README最低項目

- デモの目的
- 起動方法
- サンプルデータ構造
- Pack差し替え方法
- Core接続
- Access Mode
- Ground Truth実行方法
- Known Limitations
- 本番用途ではないこと

---

# 4. テスト計画

## 4.1 Unit Test

- Manifest Parser
- Heading Parser
- Chunk Builder
- Input Schema
- Output Schema
- Citation Validator
- Workflow View Model
- Ground Truth Evaluator

## 4.2 Integration Test

- Pack Load → Chunk
- Query → Retrieval
- Retrieval → Prompt
- AI Output → Adapter
- Citation → Document Jump
- Access Mode → Core ask
- Limit → No Request

## 4.3 E2E Test

- 文書閲覧
- Intent Rails → Drill-down → 送信
- ガイド質問
- 自由質問（ドリルダウン中含む）
- 横断回答
- Answer Skeleton（結論先出し）
- 不足情報 / Clarifying Choice
- 禁止判断
- Follow-up Chips
- Reset
- Trial制限
- Mobile Drawer

## 4.4 Content QA

- 金額の整合
- 期限の整合
- 承認権限の整合
- 文書バージョン
- 相互参照リンク
- Ground Truthの正解
- 架空情報であること

---

# 5. 実装順序まとめ

```text
Task 00-01  現状調査・環境確認
↓
Task 02-04  型・Config・3文書Vertical Slice
↓
Task 05-07  ナレッジ事前閲覧
↓
Task 08-10  Ingest・Chunk・Retrieval
↓
Task 11-13  Input・Prompt・Output Adapter
↓
Task 14-19  Chat・根拠・Workflow UI（含 Task 14a Conversation UX）
↓
Task 20-21  Access Mode・Trial接続
↓
Task 22-23  8文書完成・Ground Truth
↓
Task 24-30  品質・E2E・Deploy
```

---

# 6. Cursorへの実装依頼ルール

各Taskで次を必ず行う。

```text
1. 関連ファイルを読む
2. 既存実装の再利用可否を確認
3. 変更対象を提示
4. コード変更
5. Build / Type Check / Test
6. 変更内容と残課題を記録
```

禁止:

- 関係ないファイルの大規模リファクタ
- Core機能のDemo側コピー
- Provider SDKの直接呼出し
- Trial上限のHard Code
- サンプル規程本文のComponent直書き
- テストを通すためだけの型回避
- 根拠がないCitationの生成

---

# 7. Definition of Done

## Documentation

- [ ] Requirements完成
- [ ] Demo Definition完成
- [ ] Sample Data Spec完成
- [x] Conversation UX Spec完成（`internal_knowledge_conversation_ux.md`）
- [ ] Reuse Audit完成
- [ ] README / HANDOFF完成

## Sample Knowledge

- [ ] 8文書
- [ ] 40,000文字以上
- [ ] 相互参照15件以上
- [ ] ガイド質問12件以上
- [ ] Intent Tree定義
- [ ] Ground Truth 20件以上

## Experience

- [ ] 文書を事前閲覧できる
- [ ] Intent Railsから質問開始できる
- [ ] 自由質問できる
- [ ] 複数文書を横断できる
- [ ] 結論・条件・例外を表示できる（Answer Skeleton）
- [ ] Follow-up Chipsで次操作できる
- [ ] 根拠から原文へ移動できる
- [ ] 次の手続き・承認者・期限を表示できる
- [ ] Workflow Previewが見える
- [ ] 情報不足時に推測しない

## Core

- [ ] ProviderはCore経由
- [ ] Access ModeはCore経由
- [ ] TrialはCore契約経由
- [ ] LimitはCore契約経由
- [ ] Demo固有Deltaが分離されている
- [ ] 既存ISO機能を重複実装していない

## Quality

- [ ] Build成功
- [ ] Type Check成功
- [ ] Unit Test成功
- [ ] Integration Test成功
- [ ] 主要E2E成功
- [ ] Ground Truth主要ケース合格
- [ ] PC / Mobile成功
- [ ] Staging成功
- [ ] Production Deploy可能
