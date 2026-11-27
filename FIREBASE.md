# ランキング（Firebase）の設定

ゲームに勝つと、名前を入れてランキングに登録できる。保存先は Firebase の Firestore。
設定がないときは、ランキングの表示とボタンが出ないだけで、ゲームは今までどおり遊べる。

## 1. Firebase のプロジェクトを作る

1. [Firebase コンソール](https://console.firebase.google.com/) でプロジェクトを作る
2. 「Firestore Database」を作る（本番モードで開始）
3. 「プロジェクトの設定」→「ウェブアプリを追加」して、`apiKey` / `projectId` / `appId` を控える

## 2. ルールを公開する

`firestore.rules` の中身を、Firestore の「ルール」に貼り付けて公開する。
誰でも読めて、追加だけできる（変更・削除はできない）。名前は 1〜12 文字、点数は 0〜6200、タイムは 10 秒〜1 時間の整数だけ受け付ける。

## 3. 環境変数を入れる

`.env`（手元）と、Vercel の Environment Variables に、同じ名前で入れる。

```
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_APP_ID=
```

`apiKey` はブラウザに出ても問題ない値（守っているのは上のルール）。

## 手元で試す

Firebase なしで試したいときは、開発サーバーで `http://localhost:4321/?lbmock` を開く。登録はブラウザの中だけに保存される。

## ランキングの並び

点数が高い順。同点なら、早くクリアした順。
