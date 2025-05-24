プロジェクト: Mail Sender用の agents.md

概要

本プロジェクトは、FirebaseおよびCloud Functionsを用いてメール送信および関連処理を自動化するシステムです。Cloud Tasksを使用してメール送信タスクを非同期的に管理し、Firestoreでデータ管理を行います。

⸻

エージェント一覧

1. sheetPuller
	•	役割: Google Sheetsからデータを取得し、Cloud Tasksにメール送信タスクをスケジュールします。
	•	トリガータイプ: HTTP Cloud Function
	•	依存サービス: Google Sheets API, Cloud Tasks

2. sendMail
	•	役割: Cloud Tasksから呼び出され、メール送信処理を実施します。
	•	トリガータイプ: HTTP Cloud Function (Cloud Tasks経由)
	•	依存サービス: Firebase Authentication, Cloud Tasks, Firestore

3. getCount
	•	役割: Firestoreに保存されているデータの件数や送信数などを取得します。
	•	トリガータイプ: HTTP Cloud Function
	•	依存サービス: Firestore

⸻

利用する主な技術スタック
	•	Firebase (Authentication, Firestore)
	•	Google Cloud Functions
	•	Google Cloud Tasks
	•	Google Sheets API
	•	TypeScript
	•	React (フロントエンド)

⸻

環境設定

プロジェクトの環境変数は、.env ファイルを利用して設定されます。以下が主な環境変数の一覧です。
	•	FIREBASE_API_KEY: FirebaseプロジェクトのウェブAPIキー
	•	TASKS_AUDIENCE: Cloud TasksがCloud Functionsを呼び出す際の認証用URL
	•	TASKS_SERVICE_ACCOUNT: Cloud Tasks用サービスアカウント
	•	QUEUE_NAME: Cloud Tasksのキュー名
	•	TASKS_REGION: Cloud Tasksのリージョン
	•	SEND_MAIL_URL: メール送信用Cloud FunctionsのURL
	•	PROJECT_ID: GCPのプロジェクトID
	•	GCP_PROJECT: デプロイ環境で設定されるGCPプロジェクトID

⸻

以上が、Mail Senderプロジェクトで使用するエージェントおよび関連情報の一覧です。