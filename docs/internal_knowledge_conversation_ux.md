# 社内ナレッジAI — Conversation UX Spec

**Demo ID:** `internal-knowledge-ai`  
**バージョン:** v1.0  
**ステータス:** 仕様確定（実装前）  
**参考調査:** `design.md`（東京電力チャットボット機能デザイン分解）  
**関連文書:**

- `internal_knowledge_requirements.md` — テーマ要件の正本
- `internal_knowledge_demo_definition.md` — Core接続・Adapter・受け入れの正本
- `internal_knowledge_sample_data_spec.md` — Intent Tree / ガイド質問データ
- `internal_knowledge_implementation_plan.md` — 実装タスク

---

# 0. 本書の役割

本書は、調査メモ `design.md` から抽出した **チャネル非依存の会話UX原則** を、社内ナレッジAIデモへ反映するための正本である。

- **定義する:** 採用するUX原則、パターンカタログ、データ契約、表示契約、体感品質指標、受け入れ観点
- **定義しない:** サイト埋め込みランチャー、LINE公式アカウント、電話／有人オペレーター連携、認証ポップアップ

テーマ要件（何を証明するか）は Requirements、Core接続は Demo Definition を正とする。  
本書は **Conversation 列の操作品質** と、それに必要な入出力契約だけを拘束する。

---

# 1. 採用方針

## 1.1 取り込むもの（Must）

東京電力チャットボット調査から、次の体験品質を取り込む。

| 体感 | 本質 | 本デモでの実現 |
|---|---|---|
| 選択式で迷わず進む | ゼロ入力開始＋ドリルダウン | Intent Rails → Guided Drill-down |
| 解答が早い | 待ち時間の意味づけ＋結論先出し | Progressive Status＋Answer Skeleton |
| 見やすい | 短文ブロック＋段階開示 | 結論→要点→手続き→根拠（折りたたみ） |
| 次が分かる | 行き止まりゼロ | Follow-up Chips＋Clarifying Choice |
| 初心者もリピーターも | 選択×自由入力ハイブリッド | ガイド経路と自由文の同一合流 |

## 1.2 取り込まないもの（Out of Scope）

| 調査対象の要素 | 理由 |
|---|---|
| サイト右下フローティングランチャー | 本デモは併設サイト体験を提供しない |
| LINE友だち追加・トークUIそのもの | チャネル実装ではなく操作原則のみ移植 |
| EP / PG のチャネル二重化 | 文書カテゴリと Intent Rails で代替 |
| ログインポップアップ認証 | Access Mode（Sample / BYOK / Trial）が担う |
| 有人オペレーター・電話誘導 | デモ範囲外。不足情報と対象外案内で代替 |

## 1.3 既存体験との関係

本デモの差別化は「規程を事前閲覧してから質問する」ことにある。  
Conversation UX はチャットだけに閉じず、Knowledge Library / Evidence への相互導線を維持する。

```text
Knowledge（読む） ←→ Conversation（選ぶ・聞く） ←→ Evidence / Workflow（確かめる・次へ）
```

---

# 2. UX原則

実装・文言・データ設計は次の7原則に従う。

### P-Principle-01 ハイブリッド入力

初心者はボタン、慣れたユーザーは自由文。どちらも同じ Query Adapter へ合流する。

### P-Principle-02 ゼロ入力開始

起動直後、キーボードなしで最初の質問送信まで到達できる。

### P-Principle-03 最大3階層の絞り込み

カテゴリ → シナリオ →（必要なら）条件チップ。4階層以上は作らない。

### P-Principle-04 先出し結論＋段階開示

回答の先頭で結論ステータスと1〜2文の結論を見せる。根拠詳細はデフォルト折りたたみ。

### P-Principle-05 知覚速度

モデル応答速度だけに頼らない。検索・照合・整理の3段階表示で待ち時間に意味を与える。  
虚偽の進捗率（%）は表示しない（Demo Definition 8.1 と同一）。

### P-Principle-06 行き止まりゼロ

回答後、必ず次の一手（再質問・根拠確認・文書を開く・不足情報選択）を提示する。

### P-Principle-07 期待値の事前調整

起動時に「このパックでできること／できないこと」を短く開示し、AIの限界を体験内で予告する。

---

# 3. UXパターンカタログ

実装単位。IDは実装・テスト・受け入れで共通利用する。

| ID | パターン名 | 概要 | 主担当UI |
|---|---|---|---|
| P01 | Intent Rails | 起動時のカテゴリボタン列 | Conversation 空状態 |
| P02 | Guided Drill-down | 最大3階層で質問を確定して送信 | Conversation |
| P03 | Free-text Merge | 自由文を同一入力契約へ合流 | Composer |
| P04 | Progressive Status | 3段階の処理中表示 | Conversation |
| P05 | Answer Skeleton | 結論先行の構造化回答表示 | Decision Card / Chat |
| P06 | Follow-up Chips | 回答直後の次アクションボタン | Conversation |
| P07 | Clarifying Choice | 不足情報を選択肢で聴取 | Conversation |
| P08 | Limit Disclosure | できること／できないことの事前開示 | Conversation 空状態 |

## 3.1 P01 Intent Rails

**目的:** 「何を聞けばいいか分からない」空白状態を解消する。

**表示タイミング:** `ready` かつ会話が空、またはリセット直後。

**初期カテゴリ（サンプルパック）:**

1. 勤怠・休暇
2. 在宅勤務
3. 出張・経費
4. 購買・稟議
5. 情報セキュリティ
6. 緊急・事故対応

**制約:**

- 1画面に出すトップカテゴリは最大6個
- タップで P02 に進む（この時点では AI を呼ばない）

## 3.2 P02 Guided Drill-down

**階層:**

```text
Level 0: Intent Rails（カテゴリ）
Level 1: シナリオ候補（ガイド質問のグループ）
Level 2: 具体質問（guidedQuestionId へ結合）または条件チップ
```

**ルール:**

- 深さは最大3（Level 0〜2）
- 葉ノードは必ず `guidedQuestionId` または Clarifying Choice 起点を持つ
- 葉確定時に質問文を Composer へ投入し、即送信してよい（1クリック完走）
- 既存の難易度 Level 1/2/3（単一／横断／判断）は、ドリルダウン階層ではなく **質問メタデータ** として併記する

**戻る:**

- 各階層に「戻る」を置く
- トップへ戻ると Intent Rails 再表示

## 3.3 P03 Free-text Merge

**目的:** リピーターがキーワード直打ちで同じゴールに到達できるようにする。

**ルール:**

- Composer は常時表示（ドリルダウン中も隠さない）
- 送信ペイロードはガイド質問と同じ `InternalKnowledgeQueryInput`
- ガイド質問経由の場合は `guidedQuestionId` を付与、自由文は省略可
- フリーテキストでも Output Schema / Answer Skeleton は同一

## 3.4 P04 Progressive Status

Demo Definition 8.1 を Conversation UX 契約としても再掲する。

```text
関連規程を確認しています
↓
条件と例外を照合しています
↓
根拠と次の手続きを整理しています
```

**禁止:**

- 実態と異なるパーセンテージ
- 実際には確認していない文書名の先出し
- 10秒超の演出だけの待機

## 3.5 P05 Answer Skeleton

**表示順（必須）:**

1. Status Badge（`allowed` / `conditional` / `needs_confirmation` / `not_allowed` / `not_found`）
2. 結論（1〜2文）
3. 要点（短文3〜5個）
4. 必要手続き・次のアクション
5. 適用条件 / 例外（折りたたみ可）
6. 不足情報（ある場合は折りたたまず表示）
7. 根拠（デフォルト折りたたみ。展開または Evidence パネルへ）

**見やすさルール（LINE的体感の移植）:**

- 結論と要点は長文1塊にしない
- 1バブル／1カードあたりの主文は短く保つ
- 根拠の長文抜粋を結論より上に置かない

## 3.6 P06 Follow-up Chips

回答成功後、キーボードなしで次操作できるチップを出す。

**標準チップ種別:**

| action | 用途 | 例ラベル |
|---|---|---|
| `resend_variant` | 条件を変えた再質問を投入 | 金額を変えて聞く |
| `open_evidence` | Evidence パネルを開く | 根拠を見る |
| `open_document` | 指定文書を Knowledge で開く | 在宅勤務規程を開く |
| `clarify` | Clarifying Choice を開始 | 条件を追加する |
| `ask_related` | 関連ガイド質問を送信 | 承認者は誰ですか |

**制約:**

- 1回答あたり表示は最大5個
- 回答内容と無関係な汎用チップを並べない
- Sample Data / Ground Truth 側で想定チップを定義できる

## 3.7 P07 Clarifying Choice

`needs_information` または回答中の不足情報がある場合、自由入力だけに頼らない。

**ルール:**

- `missingInformation` を選択肢化できるときは Choice を出す
- 選択肢タップで、不足情報を埋めた追質問として再送信する
- 選択肢にない場合のみ Composer へ誘導する
- 推測で不足情報を埋めない（Requirements FR-011 と同一）

## 3.8 P08 Limit Disclosure

起動空状態に、次を各1行以内で表示する。

- できること: 選択中パックの規程横断確認、手続き・承認の整理
- できないこと: ナレッジ外の社内ルール作成、最終的な人事・法務判断の確定

詳細な対象外制御は FR-012 / Prompt 必須ルールに従う。

---

# 4. 会話フロー

## 4.1 メインフロー（選択式）

```text
起動
 └─ P08 Limit Disclosure + P01 Intent Rails
     └─ P02 Drill-down（最大3階層）
         └─ 質問確定・送信
             └─ P04 Progressive Status
                 └─ P05 Answer Skeleton
                     ├─ P06 Follow-up Chips
                     └─ 必要なら P07 Clarifying Choice
```

## 4.2 合流フロー（自由入力）

```text
起動または会話中
 └─ P03 Free-text
     └─ 同一 Query Adapter
         └─ P04 → P05 → P06/P07
```

## 4.3 Knowledge 連動

- 文書閲覧中の「この文書について質問」は、Intent Rails の該当カテゴリを開いた状態、または Composer に文書コンテキスト付きでフォーカスする
- Citation / `open_document` から原文へ戻れること（既存要件）

## 4.4 Experience State との対応

| State | Conversation UX の見え方 |
|---|---|
| `browsing_knowledge` | Intent Rails は維持可。Composer は利用可 |
| `ready` | P01 / P08 または履歴＋Composer |
| `searching` / `cross_checking` / `generating` | P04 |
| `succeeded` | P05 + P06 |
| `needs_information` | P05（不足情報強調）+ P07 |
| `not_found` / `limited` / `failed` | 短文説明＋次アクション（再質問・設定確認・リセット） |

---

# 5. データ契約

## 5.1 Intent Tree

Sample Data に Intent Tree を定義する。ガイド質問12件以上は、フラット一覧を廃さず **ツリーの葉として再利用** する。

```ts
export type IntentNode = {
  id: string;
  label: string;
  description?: string;
  children?: IntentNode[];
  /** 葉ノードでガイド質問へ合流 */
  guidedQuestionId?: string;
  /** 葉ノードで不足条件の選択から開始 */
  clarifyOptions?: Array<{
    id: string;
    label: string;
    appendText: string;
  }>;
};

export type IntentTree = {
  packId: string;
  version: string;
  roots: IntentNode[];
};
```

**制約:**

- `roots.length <= 6`
- 任意ノードの深さは root から数えて最大3
- 葉は `guidedQuestionId` または `clarifyOptions` のどちらかを必須とする
- `guidedQuestionId` は Sample Data のガイド質問 ID と一致すること

## 5.2 Input 拡張

既存 `InternalKnowledgeQueryInput` を拡張する。

```ts
export interface InternalKnowledgeQueryInput {
  query: string;
  packId: string;
  activeDocumentId?: string;
  guidedQuestionId?: string;
  intentPath?: string[]; // 例: ["remote-work", "half-day-then-wfh"]
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

- `intentPath` / `guidedQuestionId` は分析・Ground Truth照合用。検索の必須条件にはしない
- 空の `query` は不可（選択肢確定時は質問文を必ず生成する）

## 5.3 Answer Blocks（表示契約）

Output Adapter の論理出力を、UIが必ずこの順でマッピングする。

```ts
export type FollowUpAction =
  | "resend_variant"
  | "open_evidence"
  | "open_document"
  | "clarify"
  | "ask_related";

export type FollowUpChip = {
  id: string;
  label: string;
  action: FollowUpAction;
  payload?: Record<string, string>;
};

export type AnswerBlocks = {
  status: "allowed" | "conditional" | "needs_confirmation" | "not_allowed" | "not_found";
  conclusion: string;
  bullets: string[];
  procedures: string[];
  nextActions: string[];
  conditions: string[];
  exceptions: string[];
  missingInfoChoices: Array<{ id: string; label: string; appendText: string }>;
  followUps: FollowUpChip[];
  evidenceCollapsedByDefault: true;
};
```

`InternalKnowledgeOutput` からのマッピング規則:

| AnswerBlocks | 出力元 |
|---|---|
| `status` / `conclusion` | 同名フィールド |
| `bullets` | `answer` を短文分割、またはモデルの要点配列（実装で正規化） |
| `procedures` | `requiredActions` |
| `nextActions` | `requiredActions` 後半、または Workflow Preview のアクション |
| `conditions` / `exceptions` | 同名 |
| `missingInfoChoices` | `missingInformation` を Choice 化（Sample/Adapterで生成可） |
| `followUps` | Sample の想定チップ＋共通チップ（根拠を見る 等） |

## 5.4 Ground Truth 拡張（任意だが推奨）

既存 `GroundTruthCase` に次を追加できる。

```ts
expectedFollowUpActions?: FollowUpAction[];
expectedMissingInfoChoiceIds?: string[];
intentPath?: string[];
```

評価は既存項目を優先し、Follow-up は UX受け入れで確認する。

---

# 6. UI配置契約

## 6.1 Conversation 列（空状態）

```text
Limit Disclosure（P08）
Intent Rails（P01）
難易度別ガイド質問への短縮導線（任意・折りたたみ可）
Composer（常時）
```

## 6.2 Conversation 列（ドリルダウン中）

```text
パンくず or 戻る
現在階層の選択肢
Composer（常時・自由文合流）
```

## 6.3 Conversation 列（回答後）

```text
履歴
Answer Skeleton（P05）
Follow-up Chips（P06）
必要なら Clarifying Choice（P07）
Composer
```

## 6.4 モバイル

- Main は Conversation
- Intent Rails / Drill-down / Chips は親指到達しやすい下部寄り
- Evidence / Knowledge は Drawer / Bottom Sheet（既存方針）

## 6.5 やってはいけないUI

- ヒーローマーケティング型の装飾で Intent を隠す
- カード過剰（境界・影が操作理解に不要なら付けない）
- 結論より先に長い根拠抜粋を出す
- 進捗%の擬似表示
- LINE / サイト埋め込みを模した偽ランチャー

---

# 7. 体感品質指標

実装後の確認用。完璧な計測基盤は必須ではない。

| 指標 | 定義 | 目標 |
|---|---|---|
| Time-to-First-Action | 起動〜最初の質問送信 | 選択式なら最大2タップ（カテゴリ→質問）で送信可能 |
| Time-to-Conclusion | 送信〜結論バッジ／結論文の表示開始 | 長文完了を待たず、スケルトンまたはストリーム先頭で結論が見える |
| Zero-Keyboard Continuity | 回答後、キーボードなしで有用な次操作が可能か | Follow-up または Clarifying Choice が1つ以上ある |

---

# 8. 受け入れ条件（Conversation UX）

## 8.1 操作

- [ ] 起動直後にできること／できないことが1画面で分かる（P08）
- [ ] 起動直後にカテゴリボタンから質問を開始できる（P01）
- [ ] カテゴリから最大3階層で具体質問を送信できる（P02）
- [ ] ドリルダウン中でも自由文送信できる（P03）
- [ ] ガイド質問と自由文が同じ回答構造で返る
- [ ] 処理中に3段階ステータスが見える（P04）
- [ ] 回答の先頭で Status と結論が見える（P05）
- [ ] 根拠はデフォルトで折りたたまれている（P05）
- [ ] 回答後に Follow-up Chips が出せる（P06）
- [ ] 不足情報があるとき選択肢で追加確認できる（P07）
- [ ] Follow-up から根拠パネルまたは文書閲覧へ移動できる

## 8.2 非目標（回帰防止）

- [ ] LINE追加手順やサイトフロートランチャーを模していない
- [ ] Knowledge 事前閲覧導線が Conversation UX 追加で消えていない
- [ ] 虚偽の進捗率を出していない

---

# 9. Demo Definition / Requirements への接続

| 本仕様 | 接続先 |
|---|---|
| P01–P08 | Definition 6.5 独自UI / 13.1 UI Delta |
| Intent Tree | Sample Data § Intent Tree |
| Input 拡張 | Definition 9.x Input Adapter |
| Answer Blocks | Definition 12.x Output Adapter |
| Progressive Status | Definition 8.1 |
| 受け入れ 8.1 | Definition 17 / Requirements 受け入れ |

実装時は、UIコンポーネント名より **パターンID（P01–P08）** をタスク・PR説明に使う。

---

# 10. 実装時の優先順位

仕様確定後の実装順（UI縦スライス）:

1. P05 Answer Skeleton（既存 Decision Card と統合）
2. P04 Progressive Status
3. P01 + P02 Intent Rails / Drill-down（既存ガイド質問を葉に接続）
4. P06 Follow-up Chips
5. P07 Clarifying Choice
6. P08 Limit Disclosure
7. P03 は Composer 常設で初期から満たす

データ準備は Intent Tree を Sample Pack に追加し、既存12問の `guidedQuestionId` を葉へ割当てるところから始める。

---

# 11. 設計判断の記録

1. **チャネルを真似ない:** 速さ・見やすさ・選択式進行はメッセージ設計と操作契約で再現する。
2. **ガイド質問を捨てない:** 難易度別12問は資産として残し、ツリーの葉とメタデータに再利用する。
3. **ナレッジ閲覧を弱めない:** Conversation を便利にしても、事前閲覧が本デモの主価値である。
4. **東電の認証フォールバックは移植しない:** 代わりに不足情報 Choice と対象外明示で「行き止まりゼロ」を満たす。
