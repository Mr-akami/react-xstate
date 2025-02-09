# React + XState デモプロジェクト

このプロジェクトは、ReactとXStateを使用して、複雑なUIの状態遷移を管理する方法を示すデモンストレーションです。

## 概要

このプロジェクトでは、ツアー機能を例に取り、以下の点を実証しています：

- 複数のコンポーネント間での状態管理
- 状態遷移の可視化と制御
- コンポーネント間の連携

## アーキテクチャ

### 1. ツアーマシン（Tour State Machine）

メインのステートマシンで、全体のフローを制御します：

```typescript
interface TourContext {
  componentA: AnyActorRef | null;
  componentB: AnyActorRef | null;
  componentAComplete: boolean;
  componentBComplete: boolean;
  isTourActive: boolean;
}

type TourEvent =
  | { type: 'START' }
  | { type: 'COMPLETE_A' }
  | { type: 'COMPLETE_B' }
  | { type: 'RESET' };
```

### 2. 状態遷移フロー

1. **初期状態（idle）**
   - ツアーが開始されていない状態
   - `START`イベントでツアーを開始

2. **ComponentA**
   - ComponentAのダイアログを表示
   - ダイアログが完了状態から閉じられると次のステップへ

3. **ComponentB**
   - ComponentBのダイアログを表示
   - ダイアログが完了状態から閉じられると初期状態へ戻る

### 3. 状態遷移の検知

特に注目すべき点として、状態遷移の検知方法があります：

```typescript
invoke: {
  id: 'dialogBSubscription',
  src: fromCallback(({ sendBack }) => {
    let previousState = dialogActorB.getSnapshot();
    const subscription = dialogActorB.subscribe((state) => {
      if (previousState.matches('complete') && state.matches('closed')) {
        sendBack({ type: 'COMPLETE_B' });
      }
      previousState = state;
    });
    return subscription.unsubscribe;
  })
}
```

この実装により：
- 前の状態が`complete`
- 現在の状態が`closed`
という遷移を正確に検知できます。

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

## 技術スタック

- React
- XState v5
- TypeScript

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

## 今後の展開

- テストケースの追加
- より複雑なフローへの対応
- パフォーマンス最適化
