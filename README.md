# 位置情報探索アプリ

Google Maps と PostGIS を使った周辺スポット検索アプリケーション

## 技術スタック
- Frontend: Next.js 16 (App Router) + Tailwind CSS + TypeScript
- Backend: NestJS + TypeORM + TypeScript
- Database: PostgreSQL 15 + PostGIS
- Infrastructure: Docker / Docker Compose
- 地図API: Google Maps JavaScript API / Geocoding API

## 主要機能
- ✅ 地図上でのスポット表示（マーカー）
- ✅ 半径検索（1〜10km、スライダーで調整可能）
- ✅ スポット一覧表示（距離順）
- ✅ 逆ジオコーディング（地図中心の住所をリアルタイム表示）
- ✅ debounce による API 呼び出し最適化
- ✅ ローディング表示
- ✅ 検索結果 0 件時のハンドリング

## 環境構築

### 前提条件
- Docker Desktop がインストールされていること
- Google Maps API キーを取得済みであること

### Google Maps API キーの取得
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成
3. 以下の API を有効化
   - Maps JavaScript API
   - Geocoding API
4. 認証情報から API キーを作成

### 環境変数の設定
.env.example をコピーして .env を作成し、API キーを設定してください。

bash
cp .env.example .env


.env の内容を編集：

bash
DB_USER=landit_user
DB_PASSWORD=landit_password
DB_NAME=spot_search_db
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here


## 実行手順

### 1. すべてのサービスを起動
bash
docker-compose up


初回起動時は以下の処理が自動で実行されます：

- PostgreSQL + PostGIS のセットアップ
- シードデータ（約200件のスポット）の投入
- バックエンド API の起動
- フロントエンドの起動

### 2. アプリケーションにアクセス

ブラウザで以下にアクセスしてください：


http://localhost:3000


### 3. 動作確認
- 地図が表示され、東京駅周辺のマーカーが表示されることを確認
- 地図を動かすと住所が更新されることを確認
- 半径スライダーを動かすとスポット数が変化することを確認

## 使用した主要ライブラリとその選定理由

### Frontend
@vis.gl/react-google-maps
Google Mapsの公式React対応ライブラリ。Next.jsのApp Routerで発生しがちなSSR（サーバーサイドレンダリング）のエラーを避けられるため採用しました。

Tailwind CSS
クラス名を組み合わせるだけで素早くUIを構築でき、レスポンシブ対応も簡単なため選定しました。

### Backend
TypeORM
NestJSとの統合がスムーズで、TypeScriptの型チェックを活かした安全なDB操作ができます。PostGISの地理関数を使ったカスタムクエリも問題なく実行できました。

@nestjs/config
環境変数（APIキーなど）をTypeScriptで型安全に扱えるため導入しました。

### Database
PostGIS
PostgreSQLの地理空間データ拡張機能です。ST_DWithin関数を使うことで「半径N km以内」の検索を地球の球面を考慮して正確に計算できます。GISTインデックスにより、データが増えても高速に検索できる点も魅力でした。

## 実装時に特に工夫した点

### 1. debounce による API 呼び出し最適化
地図を高速で動かした際に API が大量に呼ばれることを防ぐため、useEffect 内で setTimeout を使った debounce を実装しました（500ms）。

typescript
useEffect(() => {
  const timer = setTimeout(() => {
    fetchSpots(center.lat, center.lng, radius);
    fetchAddress(center.lat, center.lng);
  }, 500);

  return () => clearTimeout(timer);
}, [center, radius]);


効果： 地図移動が止まってから 0.5 秒後に API を呼ぶことで、不要なリクエストを削減。

### 2. PostGIS による高精度な半径検索
単純な緯度経度の計算ではなく、PostGIS の ST_DWithin と GEOGRAPHY 型を使用することで、地球の球面を考慮した正確な距離計算を実現しました。

sql
SELECT * FROM spots
WHERE ST_DWithin(
  location,
  ST_MakePoint(139.7671, 35.6812)::GEOGRAPHY,
  3000  -- メートル単位
)


### 3. Plus Code の除外
逆ジオコーディングで返される Plus Code（例：GXM2+JQ）を正規表現で除外し、通常の住所のみを表示するようにしました。

typescript
const address = data.results[0].formatted_address.replace(/^[A-Z0-9+]+\s+/, "");


### 4. ローディング状態の視覚化
データ取得中であることをユーザーに伝えるため、地図上部にローディングインジケーターを表示しました。

## 技術的な判断を行った箇所

### 1. Docker volumes の削除
Apple Silicon Mac と Docker の相性問題により、node_modules のマウントでエラーが発生したため、volumes を削除しコンテナ内でビルドする方式を採用しました。

トレードオフ：
- メリット：安定して動作
- デメリット：コード変更時に docker-compose build が必要

### 2. CSV の直接読み込み方式
当初 COPY コマンドで CSV を読み込む実装でしたが、Docker のボリュームマウントとの相性問題が発生。最終的に /tmp にマウントする方式で解決しました。

### 3. シードデータの自動投入
docker-compose up 一発で動作する環境を目指し、/docker-entrypoint-initdb.d の仕組みを活用して初回起動時に自動でシードデータを投入するようにしました。

## 今後の改善点
### 機能拡張の可能性

**フロントエンドキャッシュの導入**  
現在は同じ場所を再度検索すると毎回APIを呼んでいますが、検索結果をキャッシュすることでさらなるAPI呼び出し削減とレスポンス速度向上すると思った。

**マーカークリック時の詳細表示**  
現在はマーカーにホバーすると名前が表示されるのみですが、クリック時にスポットの詳細情報（住所、カテゴリ、距離など）をポップアップ表示する機能を実装していきたい。

**エラーハンドリングの強化**  
APIエラー時のリトライ処理やユーザーへの通知機能があると、ネットワーク不安定時にユーザーにわかりやすいと思った

**その他のアイデア**
- スポットのカテゴリ絞り込み検索
- 現在地からのルート検索機能
- お気に入り機能（LocalStorageやDBに保存）
- スポットの詳細情報表示（写真・営業時間・レビューなど）
