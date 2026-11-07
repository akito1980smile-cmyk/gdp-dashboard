# 競馬AI予想 v16 — Cloudflare Pages / D1

## 公開
`index.html` と `functions/` を含むフォルダを Git リポジトリに入れ、Cloudflare Pages の Git 連携でデプロイしてください。ZIPはソース配布用です。Direct Uploadでは Pages Functions がデプロイされない構成があるため、D1機能を使う場合はGit連携を推奨します。

## D1セットアップ
1. Cloudflare Dashboard → Workers & Pages → D1 → Create database（例: `keiba-v16`）。
2. D1のConsoleで `worker/schema.sql` のSQLを実行。
3. Pagesプロジェクト → Settings → Bindings → D1 database を追加。変数名を **DB** にして作成したDBを選択。
4. Pages → Settings → Variables and Secrets に **ARCHIVE_WRITE_TOKEN** をSecretとして設定（推測困難なランダム文字列）。
5. 再デプロイ後、画面の「D1からレースを読み込む」で接続確認。保存は管理用トークンを入力して実行。

## 注意
- D1保存はユーザーがボタンを押した時のみ実行します。Cronによるバックグラウンド収集はありません。
- 外部JSON配信元は `RACE_FEED_URL` を設定した場合に限り `/api/races` で取得します。JRA/NAR公式への自動接続は未実装です。
- NAR公式ZIPの実ファイルを用いた読み込み試験は未実施です。CSV列名形式等のみ対応。
- D1のGET APIは読み取り認証なしです。非公開データや個人情報を保存しないでください。書き込みのみSecretで保護しています。
- v15のデータを引き継ぐ場合は、更新前にv15からJSONバックアップを取ってください。保存キーの互換性は保証できません。
- ブラウザの予想は簡易スコア方式であり、学習済みAIではありません。的中・収益を保証しません。
