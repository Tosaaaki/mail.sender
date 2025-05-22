# mail.sender

Google Apps Script を用いたシンプルなメール送信ツールです。テスト用の Node.js 環境も用意しています。

## 現行実装と仕様書の差異

このリポジトリはバックエンド処理をすべて Google Apps Script (GAS) で実装しており、データ保存には `PropertiesService` を利用しています。
仕様書では GCP のサーバレス構成、具体的には Cloud Functions と Firestore を用いたシステムを想定しています。そのため、現在の実装は次の点で仕様と異なります。

- API は GAS の `doGet`/`doPost` で提供している
- 認証トークンや送信件数を Firestore ではなく `PropertiesService` に保存している
- Cloud Functions での認証やデプロイ設定が存在しない

## 利用手順
1. このリポジトリをクローンします。
2. 必要に応じて `npm install` を実行します（現状依存パッケージはありません）。
3. `npm test` を実行しテストが成功することを確認します。
4. Google Apps Script 側の設定後、Web アプリにアクセスしボタンを押すとサンプルメールが送信されます。

## フロントエンドでのログインとトークン保存
Web アプリを開くとログイン画面が表示されます。既定のユーザー名は `user`、パスワードは `pass` です。ログインに成功すると `login` API から発行されたトークンがブラウザの `localStorage` に保存され、メール送信やカウント取得の操作が可能になります。

## API の利用方法
すべての API は Web アプリの URL へ `POST` し、`action` パラメータで呼び出します。

### login
- `action=login`
- パラメータ: `username`, `password`
- レスポンス: `{ "token": "<uuid>" }`

### sendEmails
- `action=sendEmails`
- パラメータ: `token`
- レスポンス: `{ "sent": <送信件数> }`

### getCount
- `action=getCount`
- パラメータ: `token`
- レスポンス: `{ "count": <送信済み件数> }`

## デプロイ手順
1. Google Apps Script プロジェクトを作成し、このリポジトリの `*.gs` と `*.html` ファイルをすべてアップロードします。
2. スクリプトエディタで **公開** → **ウェブアプリケーションとして導入** を選択します。
3. 新しいバージョンを作成し、実行権限を **自分** に、アクセス権を **全員（匿名ユーザーを含む）** に設定してデプロイします。
4. 発行された URL を開き、上記の手順でログイン後に表示される画面からメール送信を行います。トークンはブラウザに自動保存されるため、次回からはログインなしで利用可能です。
5. 認証情報や送信先メールアドレスを変更したい場合は `Auth.gs` や `MailSender.gs` を編集してから再デプロイしてください。

## TODO: GCP サーバレス移行に向けた実装方針

- Firestore を用いてトークンや送信件数を永続化する
- Cloud Functions で `login`、`sendEmails`、`getCount` のエンドポイントを提供する
- フロントエンドからは上記 Cloud Functions を呼び出すように修正する
- Firestore のインデックス設計やアクセス権設定を検討する
