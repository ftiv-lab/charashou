# 検証ルール — charashou

Codex/Claude が手動ブラウザ確認で詰まらないための、軽量な検証手順。

## 原則
- まずコマンドで確認する。手動ブラウザ操作は最後の補助にする。
- 常駐 dev server を手で起動した場合は、作業終了前に必ず止める。
- UI変更でも、最初からスクショや手動クリックを繰り返さない。`npm run e2e` で足りるか先に判断する。
- テストを増やす時は「壊れると困る既存挙動」を1つずつ固定する。新機能の仕様拡張は別handoffに分ける。

## コマンド
- `npm run lint`：Biomeのformat/lint/import確認。
- `npm run lint:fix`：Biomeの安全な修正と整形を適用。
- `npm run test`：Vitest。FIELD定義、Reactの入力反映、PNG出力関数などを高速確認。
- `npm run build`：TypeScript strict と Vite build。
- `npm run check`：通常の必須確認。`lint` → `test` → `build`。
- `npm run e2e`：Playwright最小スモーク。Canvas画像差分、写真アップロード検証とズーム／位置調整、内容要素の選択／ドラッグ／スナップ／リサイズ／解除／リセット、カード寸法、Blob経由の3倍PNG download。
- `npm run check:e2e`：UI挙動を触った時の推奨確認。`check` → `e2e`。
- `npm run shots`：レビュー用の現状画像5枚を `docs/screenshots/` へ固定名で上書き生成。検証やCIには含めない。
- `npm run ci`：GitHub Actionsと同じ確認。Biome CI → test → build → e2e。

## Codex運用
- 通常変更：`npm run check` を実行してから報告。
- UI/PNG/写真アップロード変更：`npm run check:e2e` を実行してから報告。
- in-app Browser が使えない場合でも、すぐ手動検証に寄せず `npm run e2e` を使う。
- Playwrightが dev server を管理するため、E2Eのために別途 `npm run dev` を常駐起動しない。
- `review/screenshots.spec.ts` は成果物生成専用。検証ケースを置かず、通常の `e2e/` と別設定を維持する。

## Claudeレビュー
- 差分レビューの先頭で、どのコマンドが通ったかを見る。
- GitHub上では `CI and Pages` workflowの成功を確認する。
- 見た目レビューは必要な時だけ。Canvas内テキストをDOM検索せず、まず `e2e/app.spec.ts` の画像差分とPNG寸法確認が受け入れ基準を覆っているか確認する。
- 新しいhandoffには「どのコマンドでDoneとするか」を必ず書く。

## GitHub Actions / Pages
- pull requestでは検証のみを行う。
- main pushでは検証成功後に `dist/` をPagesへdeployする。
- GitHubの Settings → Pages → Source は `GitHub Actions` を選ぶ。
