# React + XState デモプロジェクト

このプロジェクトは、ReactとXStateを使用して、複雑なUIの状態遷移を管理する方法を示すデモンストレーションです。

## 概要

このプロジェクトでは、ツアー機能を例に取り、以下の点を実証しています：

- コンポーネントとロジック、ステートマシンの分離
   − コンポーネント: componentXXX.tsx, ロジック: useXXX.ts, ステートマシン: xxxMachine.ts
- 複数のコンポーネント間での状態管理
   - ツアー機能を例に取り、ComponentAとComponentBの状態遷移を管理
- 状態遷移の可視化と制御
   - XState Inspectorを使用して、状態遷移を可視化

## アーキテクチャ

- ComponentXXX: UIを表示する
  - UIの表示のためのロジックを持つ。useXXX, xxxMachineを参照する
- useXXX: ロジックを管理する
  - 状態に応じた処理を持つ。ステートマシンを参照する
- xxxMachine: ステートマシンを管理する
  - 状態遷移のロジックを持つ
  - 状態に応じた処理を持つこともできるが、基本的には処理のロジックはuseXXXに記載する

状態遷移に関するロジックもできるだけuseXXXに記載する。stateMachineはをシンプルにしたほうが全体の可読性が上がると判断。以下のような方法を推奨する。
- useXXXで行った処理結果(booleanなど)をxxxMachineに渡し、その値をstateMachine検証する
- stateMachineの外で処理を定義し、callbackとして渡す


既存のstateMachineを使いまわすため、修正する必要がある場合
- 基本的に修正をする場合は別のstateMachineとして作り直す
- パラメータを変えるくらいであれば引数やGlobal変数などを用いても良い

stateMachineのContextが参照する変数はglobal変数などを用いても良い。


## 動作

### 1. ComponentA、ComponentB

- ダイアログを表示
- ダイアログに1, 0ボタンを表示し、謳歌されたボタンの数値を加算
- 上記を3回実施
- ダイアログが完了状態となる 

### 2. Tour

- ツアーが開始される
- ComponentAのシーケンスを実施する、その後
- ComponentBのシーケンスを実施する
- ツアーが完了する

### 1. ツアーマシン（Tour State Machine）

メインのステートマシンで、全体のフローを制御します：

```typescript
// context stateMachineの状態
interface TourContext {
  componentA: AnyActorRef | null;
  componentB: AnyActorRef | null;
  componentAComplete: boolean;
  componentBComplete: boolean;
  isTourActive: boolean;
}

// event stateMachineのイベント
type TourEvent =
  | { type: 'START' }
  | { type: 'COMPLETE_A' }
  | { type: 'COMPLETE_B' }
  | { type: 'RESET' };

// state stateMachineの状態
type TourState =
  | { value: 'idle'; context: TourContext }
  | { value: 'componentA'; context: TourContext }
  | { value: 'componentB'; context: TourContext };
```

### 2. 状態遷移フロー

1. **初期状態（idle）**
   - ツアーが開始されていない状態
   - `START`イベントでツアーを開始

2. **ComponentA**
   - ComponentAのダイアログを表示
   - ダイアログが完了状態すると次のステップへ

3. **ComponentB**
   - ComponentBのダイアログを表示
   - ダイアログが完了状態すると初期状態へ戻る

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 主要なファイル構成

```
src/
├── features/
│   ├── Tour/
│   │   ├── tourMachine.ts    # メインのステートマシン
│   │   └── TourComponent.tsx # ツアーのUIコンポーネント
│   ├── A/
│   │   └── ...              # ComponentA関連のファイル
│   └── B/
│       └── ...              # ComponentB関連のファイル
```

## 学習ポイント

1. **状態管理の集中化**
   - XStateによる状態遷移の一元管理
   - 複雑なUIフローの可視化

2. **型安全性**
   - TypeScriptによる型定義
   - コンパイル時のエラー検知

3. **コンポーネント間の疎結合**
   - ステートマシンを介した状態共有
   - イベントベースの通信

4. **デバッグのしやすさ**
   - XState Inspectorによる状態遷移の可視化
   - 予測可能な状態遷移

## 感想

ファイルごとの責務が明確になった（UI, ロジック、状態遷移）。
可読性が高まったかはこのレベルのシンプルなアプリだと疑問。xstateを使わないほうが見やすいかもしれない。
ただし責務を分けていることで実装時のメンタルモデルがシンプルになったと感じる。
Web frontendを開発するときはこの構成で実装してみる。

設計に関して考慮が足りていない点
- エラー処理
- globalなstateMachineとlocalなstateMachineの使い分け
- stateMachineの共有方
  - 本サンプルではglobalなstateMachineを使用したが、localなstateMachineを共有することも必要