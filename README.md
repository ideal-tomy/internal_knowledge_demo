# 社内ナレッジAI

`internal-knowledge` — 就業規則・業務マニュアル等の社内ナレッジに質問できるチャット型デモ

## Setup

```bash
npm run vendor-core
npm install
npm run dev
```

## Docs

- `docs/internal_knowledge_requirements.md`
- `docs/internal_knowledge_demo_definition.md`
- `docs/internal_knowledge_implementation_plan.md`
- `docs/internal_knowledge_sample_data_spec.md`

## Core

AI 接続は `@axeon/ai-demo-core` 経由。体験コード取得は `VITE_TRIAL_PORTAL_URL` → Studio `/admin/trial`。
