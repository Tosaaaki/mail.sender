# mail.sender

Cloud Functions と Firestore を用いたシンプルなメール送信ツールです。テスト用の Node.js 環境も用意しています。

## システム概要
GCP 上でメール送信を行うサンプルです。Cloud Functions が API を提供し、Firestore に送信状況を保存します。SMTP 認証情報は Secret Manager に格納し、ユーザー認証には Firebase Authentication を利用します。

## 必要な GCP サービス
- Cloud Functions
- Firestore
- Secret Manager (SMTP 認証情報の保存)
- Firebase Authentication

## システム構成

本ツールでは GCP 上の Cloud Functions を利用して API を提供し、データ永続化に Firestore を使用します。認証は Firebase Authentication により行われます。

- **login**: Firebase Authentication でサインインし ID トークンを返します。
- **sheetPuller**: Google スプレッドシートからデータを取得し Firestore に保存します。
- **sendMail**: Firestore のデータを参照してメールを送信し、送信件数を記録します。
- **getCount**: Firestore に保存された送信済み件数を返します。

## 利用手順
1. このリポジトリをクローンします。
2. ルートの `.env.example` をコピーして `.env` を作成し、各値を設定します。
   ```bash
   cp .env.example .env
   # エディタで .env を編集
   ```
3. 必要に応じて `npm install` を実行します（現状依存パッケージはありません）。
4. `npm test` を実行しテストが成功することを確認します。

このコマンドは Node.js の assert モジュールを利用した簡単なテストを実行し、環境が正しく設定されていることを確認します。

### ワークフロー
1. `sheetPuller` 関数でスプレッドシートの内容を Firestore に取り込みます。
2. `sendMail` 関数を呼び出してメールを送信します。処理後は送信件数が Firestore に記録されます。
3. 送信状況は `getCount` 関数で取得できます。

## フロントエンドでのログインとトークン保存
Web アプリを開くと Firebase Authentication を用いたログイン画面が表示されます。ログイン成功時に取得した ID トークンはブラウザの `localStorage` に保存され、以降の API 呼び出し時に `Authorization` ヘッダーとして付与されます。

## フロントエンド利用方法
ブラウザから index.html を開いてログインし、取得したトークンを使って各 API を呼び出します。設定ファイルに Cloud Functions の URL を入力しておくと、
ワンクリックで `sheetPuller` や `sendMail` を実行できます。`getCount` を呼び出すと送信状況が確認できます。

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
1. Firebase プロジェクトを作成し Firestore と Secret Manager を有効化します。
2. SMTP 認証情報を JSON ファイルとして用意し、Secret Manager に登録します。
   ```bash
   gcloud secrets create SMTP_CRED --data-file=smtp.json
   ```
3. Cloud Functions のソースを配置したディレクトリで以下を実行します。
   ```bash
   gcloud functions deploy login --runtime nodejs18 --trigger-http --allow-unauthenticated
   gcloud functions deploy sheetPuller --runtime nodejs18 --trigger-http --allow-unauthenticated
   gcloud functions deploy sendMail --runtime nodejs18 --trigger-http --allow-unauthenticated
   gcloud functions deploy getCount --runtime nodejs18 --trigger-http --allow-unauthenticated
   ```
3. 発行されたエンドポイント URL をフロントエンド設定に入力して利用します。

## Cloud Tasks と Cloud Scheduler の設定

以下のコマンド例では `send-queue` というキューを作成し、最大再試行回数を 5 回、指数バックオフを有効にしています。
```bash
gcloud tasks queues create send-queue \
  --max-attempts=5 \
  --max-doublings=5 \
  --location=asia-northeast1
```

続いて 5 分間隔で `sheetPuller` 関数を呼び出す Cloud Scheduler ジョブを作成します。サービスアカウントを指定して実行する例を示します。
```bash
gcloud scheduler jobs create http sheet-pull \
  --schedule="*/5 * * * *" \
  --http-method=POST \
  --uri="https://asia-northeast1-PROJECT_ID.cloudfunctions.net/sheetPuller" \
  --oidc-service-account-email=SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com
```

`functions/sheetPuller.ts` ではタスク作成時にキュー名とリージョンを `QUEUE_NAME` と `TASKS_REGION` の環境変数から取得します。`functions/sendMail.ts` は Cloud Tasks から送られる認証ヘッダーを検証してから処理を行います。
