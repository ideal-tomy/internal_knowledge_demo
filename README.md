# 社内ナレッジAI

`internal-knowledge` — 就業規則・業務マニュアル等の社内ナレッジに質問できるチャット型デモ

## Setup

```bash
npm run vendor-core
npm install
npm run dev
```

## Docs

- [トップの紹介アニメーション：構造・変更方法](src/components/demo-intro/README.md)
- トップは紹介ページ。既存のチャットへ直接進む場合は `/#demo` を使用。
- `docs/internal_knowledge_requirements.md`
- `docs/internal_knowledge_demo_definition.md`
- `docs/internal_knowledge_implementation_plan.md`
- `docs/internal_knowledge_sample_data_spec.md`

## Core

AI 接続は `@axeon/ai-demo-core` 経由。体験コード取得は `VITE_TRIAL_PORTAL_URL` → Studio `/admin/trial`。
