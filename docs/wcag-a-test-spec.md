# WCAGアクセシビリティ テスト仕様書（レベルA）

- 対象サイト: https://nature-kitakyushu.aifroidedev.com/
- 基準: WCAG 2.1 レベルA（シングルA）準拠
- 実施日: 2026-07-06
- 実施方法: axe-core 4.9.1 を対象ページに注入し、`wcag2a` / `wcag21a` タグのルールを自動検査。自動検査で「要確認」と判定された項目は、DOM・属性を目視で追加確認した。
- 判定基準: 1画面（1ページ）につき1テスト、Level A違反が0件の場合のみ YES。1件以上ある場合は NO とし、対応が必要な項目を明記する。
- 総ページ数: 77ページ（サイトマップ・アーカイブページから実在確認したURLを全数対象。写真投稿37件はテンプレート共通のため代表4件をフルスキャン＋残り33件を軽量検証で全数確認）

## サマリー

| 項目 | 件数 |
|---|---|
| 検査対象ページ数 | 77 |
| YES（Level A違反なし） | 39 |
| NO（Level A違反あり） | 38 |
| 対象外（初期デフォルト投稿） | 1（hello-world） |
| 検出された固有の問題パターン | 4種類 |

## 検出されたLevel A違反（対応が必要な項目）

### 1. 動画にキャプション（字幕）が無い
- **該当ページ**: トップページ（`/`）
- **WCAG基準**: 1.2.2 キャプション（収録済み）— レベルA
- **詳細**: ヒーロー動画（`J30Y_WEBmix.mp4`）およびPR動画（`Kitakyushu-Nataure-Positive-Center_PR_Museum.mp4`）に `<track>` 要素（字幕トラック）が存在しない。
- **影響**: 音声に意味のある情報（ナレーション等）が含まれる場合、聴覚障害のあるユーザーが内容を理解できない。
- **対応案**: 各動画にキャプションファイル（.vtt）を用意し `<track kind="captions">` を追加する。音声が環境音のみで情報を含まない場合はその旨を明記のうえ対応不要と判断する。

### 2. 装飾用divのaria-labelが支援技術に伝わらない
- **該当ページ**: `/about/`（全体像）
- **WCAG基準**: 4.1.2 名前・役割・値 — レベルA
- **詳細**: `.concept-pyramid` の `<div aria-label="北九州市生物多様性戦略の3層構造">` に明示的なroleが無く、暗黙のrole（generic）はaria-labelを許容しないため、スクリーンリーダーにラベルが通知されない。
- **対応案**: `role="group"` または `role="img"`（画像的に扱う場合）を明示的に付与するか、視覚的に隠した見出し（`.sr-only` テキスト）に置き換える。

### 3. 地図マーカーにアクセシブルネームが無い
- **該当ページ**: `/center/`（活動拠点アーカイブ）
- **WCAG基準**: 4.1.2 名前・役割・値 — レベルA（axe impact: serious）
- **詳細**: Leaflet地図上のマーカー（`.leaflet-marker-icon.leaflet-interactive`）10件がARIAコマンド要素として扱われているが、アクセシブルネームが設定されていない。
- **対応案**: 各マーカーに `aria-label="{施設名}"` を設定する。Leafletの `L.marker(...).bindTooltip()` 等ではなく、マーカーDOM要素自体に `aria-label` / `title` を付与する実装に変更する。

### 4. 本文中のリンクが色のみで識別されている（写真投稿テンプレート共通）
- **該当ページ**: `single-nkk_photo` テンプレートを使用する全37ページ（`/photos/p-*/`）
- **WCAG基準**: 1.4.1 色の使用 — レベルA（axe impact: serious）
- **詳細**: 本文段落内のリンク（`p > a`）が、周囲のテキストと色以外の手段（下線等）で区別されていない。
- **影響**: 色覚特性によってはリンクの存在に気づけない。
- **対応案**: リンクに `text-decoration: underline` を付与するなど、色以外の視覚的な手がかりを追加する。テンプレート1箇所の修正で37ページ全てに反映される。

## ページ別判定一覧

### 固定ページ

| No | URL | タイトル | 判定 | 備考 |
|---|---|---|---|---|
| 1 | `/` | アーバンネイチャー北九州 | **NO** | 問題1（動画キャプション） |
| 2 | `/about/` | 全体像 | **NO** | 問題2（aria-label） |
| 3 | `/about/biodiversity/` | 生物多様性とは？ | YES | |
| 4 | `/about/strategy/` | 北九州市の取組 | YES | |
| 5 | `/about/spots/` | 北九州市の自然スポット | YES | ページ自体は適合。ただしspot個別ページへのリンク5件が404（下記「実装未了の確認事項」参照） |
| 6 | `/network/` | 地域との繋がり | YES | |
| 7 | `/join/` | 会員募集 | YES | |
| 8 | `/contact/` | お問合せ | YES | |
| 9 | `/privacy/` | プライバシーポリシー | YES | |
| 10 | `/blog/` | 活動ブログ | YES | |
| 11 | `/category/uncategorized/` | Uncategorized | YES | |

### 活動拠点（center）

| No | URL | タイトル | 判定 | 備考 |
|---|---|---|---|---|
| 12 | `/center/` | 活動拠点（アーカイブ） | **NO** | 問題3（地図マーカー） |
| 13 | `/center/hibikino-biotope/` | 北九州市響灘ビオトープ | YES | |
| 14 | `/center/greenpark/` | 響灘緑地グリーンパーク | YES | |
| 15 | `/center/hotarukan/` | 北九州市ほたる館 | YES | |
| 16 | `/center/inochi/` | いのちのたび博物館 | YES | |
| 17 | `/center/itouzu/` | 到津の森公園 | YES | |
| 18 | `/center/katsuki-hotaru/` | 香月・黒川ほたる館 | YES | |
| 19 | `/center/mizukankyokan/` | 水環境館 | YES | |
| 20 | `/center/soraland/` | ソラランド平尾台 | YES | |
| 21 | `/center/takamiya/` | タカミヤ環境ミュージアム | YES | |
| 22 | `/center/yamada/` | 山田緑地 | YES | |

### イベント・お知らせ・実践事例

| No | URL | タイトル | 判定 | 備考 |
|---|---|---|---|---|
| 23 | `/events/` | イベント（アーカイブ） | YES | |
| 24 | `/events/hiraodai-kansatsukai/` | 平尾台 春の自然観察会 | YES | |
| 25 | `/events/sone-higata-cleanup/` | 曽根干潟クリーンアップ大作戦 2026春 | YES | |
| 26 | `/events/biotope-kigyo/` | 企業向け生態系保全体験プログラム | YES | |
| 27 | `/events/hiraodai-tuk-tuk/` | 平尾台トゥクトゥクで巡る自然ツアー | YES | |
| 28 | `/events/yamada-kodomo-kyoshitsu/` | 子ども自然教室「森の生きもの探検隊」 | YES | |
| 29 | `/news/` | お知らせ（アーカイブ） | YES | |
| 30 | `/news/site-renewal-2026/` | サイトをリニューアルしました | YES | |
| 31 | `/cases/mine/` | 竹バイオマスと循環モデルで、未来をつなぐ | YES | |
| 32 | `/cases/nature-farm/` | 企業体験農園の可能性 | YES | |

### 活動ブログ記事

| No | URL | タイトル | 判定 | 備考 |
|---|---|---|---|---|
| 33 | `/sone-wataribird-2026/` | 曽根干潟の渡り鳥観察レポート | YES | |
| 34 | `/yamada-shokuju-2026/` | 山田緑地の森づくり | YES | |
| 35 | `/hibikino-chousa-2026/` | 響灘ビオトープ 早春の生き物調査結果 | YES | |
| 36 | `/murasaki-monitoring-2026/` | 紫川の水質モニタリング | YES | |
| 37 | `/aima-chikurin-2026/` | 合馬の竹林保全と農産物の魅力 | YES | |
| 38 | `/itouzu-winter-2026/` | 到津の森公園 冬の動物たちの暮らし | YES | |
| - | `/hello-world/` | Hello world! | 対象外 | WordPress初期デフォルト投稿。公開前に削除想定のため判定対象外 |

### みんなの写真（photos）

| No | URL | タイトル | 判定 | 備考 |
|---|---|---|---|---|
| 39 | `/photos/` | みんなの写真（アーカイブ） | YES | |
| 40〜76 | `/photos/p-*/` 全37件 | （個別タイトルは付録参照） | **NO**（全件） | 問題4（本文リンクが色のみで識別）。テンプレート共通の問題のため37件全てが同一理由でNO |

<details>
<summary>付録: photos個別ページ一覧（37件、全てNO・問題4）</summary>

| URL | タイトル |
|---|---|
| `/photos/p-sone-higata-1/` | 海・干潟の風景 |
| `/photos/p-higata-yugei/` | 干潟の夕景 |
| `/photos/p-sone-higata-2/` | 曽根干潟 |
| `/photos/p-hibikino-biotope/` | 響灘ビオトープ |
| `/photos/p-kaigan-fukei/` | 海岸の風景 |
| `/photos/p-higata-ikimono/` | 干潟の生き物 |
| `/photos/p-hiraodai-karst/` | 平尾台カルスト |
| `/photos/p-yama-fukei/` | 山の風景 |
| `/photos/p-shinrin-komichi/` | 森林の小道 |
| `/photos/p-yamada-mori/` | 山田緑地の森 |
| `/photos/p-sancyo-nagame/` | （山頂からの眺め） |
| `/photos/p-murasaki-fukei/` | （紫川の風景） |
| `/photos/p-kawabe-shizen/` | （川辺の自然） |
| `/photos/p-seiryuu/` | （清流） |
| `/photos/p-kawa-midori/` | （川と緑） |
| `/photos/p-keikoku-fukei/` | （渓谷の風景） |
| `/photos/p-karugamo/` | （カルガモ） |
| `/photos/p-yasei-doubutsu/` | （野生動物） |
| `/photos/p-chuuhi/` | （チュウヒ） |
| `/photos/p-sagisou/` | （サギソウ） |
| `/photos/p-yasou/` | （野草） |
| `/photos/p-hana/` | （花） |
| `/photos/p-kanokouo/` | （カノコユリ等） |
| `/photos/p-shokubutsu/` | （植物） |
| `/photos/p-kusabana/` | （草花） |
| `/photos/p-machi-shizen-1/` | （街の自然1） |
| `/photos/p-toshi-midori/` | （都市の緑） |
| `/photos/p-koen-fukei/` | （公園の風景） |
| `/photos/p-machi-shizen-2/` | （街の自然2） |
| `/photos/p-nousanpin-1/` | （農産物1） |
| `/photos/p-jimoto-nousanhin/` | （地元農産品） |
| `/photos/p-syukakubutsu/` | （収穫物） |
| `/photos/p-satoyama-megumi/` | （里山の恵み） |
| `/photos/p-aima-take/` | （合馬の竹） |
| `/photos/p-nousanpin-2/` | （農産物2） |
| `/photos/p-hatakeshimeji/` | （ハタケシメジ） |
| `/photos/p-yotsuboshi-tombo/` | ヨツボシトンボ |
| `/photos/p-kiibokasatake/` | キイボカサタケ |

</details>

## 実装未了の確認事項（WCAG判定対象外・参考情報）

サイトが段階的に構築中のため、以下は404（未実装）を確認した。Level A判定の対象には含めていないが、実装時に本仕様書のチェック観点を適用すること。

| URL / リンク | 状態 | 備考 |
|---|---|---|
| `/about/spots/genkai/`, `/sarakurayama/`, `/ouma/`, `/kanmon/`, `/murasakigawa/` | 404 | `/about/spots/` アーカイブページ内からリンクされているが遷移先が未実装。リンク切れとして別途要修正 |
| `/about/spots/hiraodai/`, `biotope/`, `sone-higata/`, `yamada/` 相当のスポット | 未確認 | `nkk_spot` CPTがREST非公開・サイトマップ非掲載のため個別URL未特定。実装後に追加検査が必要 |
| `/events/hiraodai-kansatsukai-apply/`, `/events/sone-higata-cleanup-apply/` 等の参加申込ページ | 404 | フォーム未実装 |
| `/network/hibikinadabiotope/` | 404 | 未実装 |
| `/network/cases/`（実践事例アーカイブ） | 404 | 未実装 |
| `/nature-symbiosis/` | 404 | 未実装 |

## 注記

- 本仕様書はレベルAのみを対象としている。レベルAA（コントラスト比等）は別途 `.claude/ichiki/rules/ichiki.md` に定義された pa11y-ci + axe-core のCI運用で担保する想定。
- axe-coreが自動判定できない項目（alt文言の妥当性、読み上げ順序の意味、キーボード操作の実使用感）は本仕様書の対象外。人手レビューを別途行うこと。
