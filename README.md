# mail.sender

Cloud Functions と Firestore を用いたシンプルなメール送信ツールです。テスト用の Node.js 環境も用意しています。

## システム構成

本ツールでは GCP 上の Cloud Functions を利用して API を提供し、データ永続化に Firestore を使用します。認証は Firebase Authentication により行われます。

- **login**: Firebase Authentication でサインインし ID トークンを返します。
- **sheetPuller**: Google スプレッドシートからデータを取得し Firestore に保存します。
- **sendMail**: Firestore のデータを参照してメールを送信し、送信件数を記録します。
- **getCount**: Firestore に保存された送信済み件数を返します。

## 利用手順
1. このリポジトリをクローンします。
2. 必要に応じて `npm install` を実行します（現状依存パッケージはありません）。
3. `npm test` を実行しテストが成功することを確認します。

### ワークフロー
1. `sheetPuller` 関数でスプレッドシートの内容を Firestore に取り込みます。
2. `sendMail` 関数を呼び出してメールを送信します。処理後は送信件数が Firestore に記録されます。
3. 送信状況は `getCount` 関数で取得できます。

## フロントエンドでのログインとトークン保存
Web アプリを開くと Firebase Authentication を用いたログイン画面が表示されます。ログイン成功時に取得した ID トークンはブラウザの `localStorage` に保存され、以降の API 呼び出し時に `Authorization` ヘッダーとして付与されます。

## API の利用方法
各 API は HTTPS の Cloud Functions エンドポイントとして公開されています。`POST` メソッドで次の URL を呼び出します。

### /login
- ボディ: `{ "username": "...", "password": "..." }`
- レスポンス: `{ "token": "<Firebase ID token>" }`

### /sheetPuller
- ヘッダー: `Authorization: Bearer <token>`
- レスポンス: `{ "pulled": <件数> }`

### /sendMail
- ヘッダー: `Authorization: Bearer <token>`
- レスポンス: `{ "sent": <送信件数> }`

### /getCount
- ヘッダー: `Authorization: Bearer <token>`
- レスポンス: `{ "count": <送信済み件数> }`

## デプロイ手順
1. Firebase プロジェクトを作成し Firestore を有効化します。
2. Cloud Functions のソースを配置したディレクトリで以下を実行します。
   ```bash
   gcloud functions deploy login --runtime nodejs18 --trigger-http --allow-unauthenticated
   gcloud functions deploy sheetPuller --runtime nodejs18 --trigger-http --allow-unauthenticated
   gcloud functions deploy sendMail --runtime nodejs18 --trigger-http --allow-unauthenticated
   gcloud functions deploy getCount --runtime nodejs18 --trigger-http --allow-unauthenticated
   ```
3. 発行されたエンドポイント URL をフロントエンド設定に入力して利用します。
