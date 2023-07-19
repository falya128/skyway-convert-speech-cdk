# SkyWay Convert Speech CDK

## 概要

与えられた言葉を敬語の音声データに変換するための AWS CDK プロジェクトです。  
敬語に変換する処理は ChatGPT、音声データに変換する処理は Amazon Polly を用いて実現しております。  
全体的な構成についてはこちらのQiita記事をご参照ください。  
https://qiita.com/falya128/items/8ae563059b5d024188ac

また、本プロジェクトは別リポジトリの Vue プロジェクトと併せてご利用ください。  
https://github.com/falya128/skyway-convert-speech

## 開始手順

### 各種ライブラリのインストール

```powershell
cd skyway-convert-speech-cdk
npm install

cd skyway-convert-speech-cdk/lambda_layer/openai
npm install

cd skyway-convert-speech-cdk/lambda_layer/client_polly
npm install
```

### 環境設定

```powershell
cp .env.example .env
```

以下の箇所を変更

```
OPENAI_API_KEY=[OpenAI API の管理画面から取得したアクセスキー]
```

### デプロイ

```powershell
cdk deploy
```
