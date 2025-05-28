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
2. ルートの `.env.example` と `frontend/.env.example` をコピーし、それぞれ `.env` を作成して値を設定します。
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   # エディタで .env と frontend/.env を編集
   ```
   `.env` に含まれる `FIREBASE_API_KEY` は `<YOUR_FIREBASE_API_KEY>` というダミー値です。実際の Firebase API キーに置き換えてください。
   `SHEET_ID` は sheetPuller が参照するスプレッドシートの ID、`SHEET_NAME` は対象シート名、`SHEET_RANGE` は取得する列範囲を入力します。`SHEET_FIELD_MAP` を設定すると列番号と Firestore フィールドの対応を変更できます。
   フロントエンドの `.env` では `REACT_APP_FUNCTIONS_BASE_URL` に Cloud Functions のベース URL を設定してください。

   ### 環境変数設定例（functions 用）

   ```env
   GOOGLE_API_KEY=あなたのGoogle Sheets APIキー
   SHEET_ID=スプレッドシートのID
   SHEET_NAME=対象シート名（例: 一覧・操作）
   SHEET_RANGE=取得する範囲（例: A:G）
   SHEET_FIELD_MAP={"id":0,"send_date":0,"progress":1,"manager_name":2,"number":3,"facility_name":4,"operator_name":5,"email":6}
   TEMPLATE_SHEET_ID=テンプレート用スプレッドシートのID
   TEMPLATE_SHEET_NAME=テンプレートシート名
   TEMPLATE_SHEET_RANGE=テンプレート取得範囲（例: A:B）
   TEMPLATE_FIELD_MAP={"subject1":0,"body1":1}
   FIREBASE_API_KEY=FirebaseのAPIキー
   TASKS_AUDIENCE=Cloud Tasksの認証先URL（sendMail関数のURL）
   TASKS_SERVICE_ACCOUNT=Cloud Tasksが使用するサービスアカウント
   QUEUE_NAME=Cloud Tasksキューの名前
   TASKS_REGION=Cloud Tasksのリージョン（例: asia-northeast1）
   SEND_MAIL_URL=sendMail関数のURL
   PROJECT_ID=GCPのプロジェクトID（ローカル用）
   GCP_PROJECT=GCPのプロジェクトID（デプロイ用）
   ```

   ### フロントエンド（React）の環境変数設定例

   ```env
   REACT_APP_FIREBASE_API_KEY=FirebaseのAPIキー
   REACT_APP_FIREBASE_AUTH_DOMAIN=Firebaseの認証ドメイン（例: your-project.firebaseapp.com）
   REACT_APP_FIREBASE_PROJECT_ID=FirebaseのプロジェクトID
   REACT_APP_FUNCTIONS_BASE_URL=Cloud FunctionsのベースURL（例: https://asia-northeast1-your-project.cloudfunctions.net）
   ```
3. 依存パッケージをインストールします。
   ```bash
   npm install
   cd functions && npm install
   cd ../frontend && npm install
   cd ..
   ```
4. Firestore をローカルで利用する場合、最初に Application Default Credentials を設定します。

   ```bash
   gcloud auth application-default login
   ```
5. `npm test` を実行しテストが成功することを確認します。

このコマンドは Node.js の assert モジュールを利用した簡単なテストを実行し、環境が正しく設定されていることを確認します。

### Firestore へ接続できない場合
Firestore に接続できない場合は、以下の点を確認してください。

1. `.env` と `frontend/.env` の Firebase 関連の設定値が正しいか
   - `FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `REACT_APP_FIREBASE_PROJECT_ID`
   - `REACT_APP_FUNCTIONS_BASE_URL`
2. Firebase コンソールで Firestore が有効になっているか
3. Firebase コンソールで認証ドメインが許可されているか

### ワークフロー
1. `sheetPuller` 関数でスプレッドシートの内容を Firestore に取り込みます。
2. `sendMail` 関数を呼び出してメールを送信します。処理後は送信件数が Firestore に記録されます。
3. 送信状況は `getCount` 関数で取得できます。

## フロントエンドでのログインとトークン保存
Web アプリを開くと Firebase Authentication を用いたログイン画面が表示されます。ログイン成功時に取得した ID トークンはブラウザの `localStorage` に保存され、以降の API 呼び出し時に `Authorization` ヘッダーとして付与されます。

## フロントエンド利用方法
ブラウザから `index.html` を開くか、React の開発サーバを起動してログインします。開発サーバは次のコマンドで開始できます。

```bash
cd frontend && npm install && npm start
```

API を利用した後、本番環境用の静的ファイルを作成する場合は `frontend` ディレクトリで以下を実行します。

```bash
npm run build
```

ビルド結果は `frontend/build` 以下に生成されます。設定ファイルに Cloud Functions の URL を入力しておくと、
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
4. 発行されたエンドポイント URL をフロントエンド設定に入力して利用します。

5. Cloud Build で全関数をデプロイする場合は、`cloudbuild.yaml` に定義された Substitution 変数を指定してビルドを実行します。
   ```bash
   gcloud builds submit --config cloudbuild.yaml \
     --substitutions=_SHEET_ID=<SHEET_ID>,_SEND_MAIL_URL=<SEND_MAIL_URL>,_QUEUE_NAME=<QUEUE_NAME>,_TASKS_REGION=<TASKS_REGION>,_TASKS_SERVICE_ACCOUNT=<TASKS_SA>,_TASKS_AUDIENCE=<TASKS_AUDIENCE>,_FIREBASE_API_KEY=<API_KEY>
   ```
   Secret Manager を利用する場合は、`--substitutions` の代わりに `--set-secrets` を用いて環境変数を設定してください。

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

続けて `sendMail` を定期実行するジョブを作成する例です。
```bash
gcloud scheduler jobs create http send-mail \
  --schedule="0 * * * *" \
  --http-method=POST \
  --uri="https://asia-northeast1-PROJECT_ID.cloudfunctions.net/sendMail" \
  --oidc-service-account-email=SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com
```

`functions/sheetPuller.ts` ではタスク作成時にキュー名とリージョンを `QUEUE_NAME` と `TASKS_REGION` の環境変数から取得します。`functions/sendMail.ts` は Cloud Tasks から送られる認証ヘッダーを検証してから処理を行います。
