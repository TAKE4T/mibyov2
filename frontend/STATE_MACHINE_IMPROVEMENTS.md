# 質問フロー管理の構造的改善

## 問題の根本原因

前回の質問繰り返し問題は、以下の構造的な問題により発生していました：

1. **非同期状態更新の競合**: `setCurrentQuestionIndex()` と `askNextQuestion()` の実行タイミングが不整合
2. **複数の状態管理**: `waitingForResponse`, `currentQuestionIndex`, `isTyping` など複数の状態が連携不足
3. **setTimeout の重複**: 複数箇所で setTimeout を使用し、実行順序が不明確
4. **状態の明確性不足**: アプリケーションの現在状態が不明確

## 実装した改善策

### 1. 状態機械（State Machine）パターンの導入

```typescript
type DiagnosisState = 
  | 'welcome'           // 挨拶画面
  | 'ready'            // 開始準備
  | 'asking'           // 質問中
  | 'waiting_answer'   // 回答待ち
  | 'processing'       // 処理中
  | 'completed';       // 完了
```

### 2. 中央集権的な状態管理

```typescript
// 状態遷移を管理するメインuseEffect
useEffect(() => {
  switch (diagnosisState) {
    case 'welcome':
      // 挨拶メッセージを表示し、ready状態に遷移
      break;
    case 'asking':
      // 現在の質問を表示し、waiting_answer状態に遷移
      break;
    case 'completed':
      // 診断完了処理
      break;
  }
}, [diagnosisState, currentQuestionIndex, language]);
```

### 3. 状態ガード付きイベントハンドラ

```typescript
const handleOptionClick = (option: string, questionId: string) => {
  // 状態チェック：回答待ち状態でのみ処理
  if (diagnosisState !== 'waiting_answer') return;
  
  // ... 処理
  
  // 次の状態に明示的に遷移
  setDiagnosisState('processing');
  setTimeout(() => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setDiagnosisState('asking');
  }, 1500);
};
```

## 改善効果

### 1. **確実な質問進行**
- 状態機械により、各質問は正確に1回のみ表示される
- 非同期処理の競合が完全に解決

### 2. **デバッグの容易性**
- 現在の状態が明確にわかる（`diagnosisState`）
- 状態遷移のログが簡単に追加可能

### 3. **保守性の向上**
- 新しい状態や機能の追加が容易
- 状態遷移ロジックが一箇所に集約

### 4. **ユーザー体験の向上**
- 状態に応じたUI表示（ボタンの表示制御）
- 不正な操作の防止

## 今後の同様問題の防止策

### 1. **状態機械パターンの継続使用**
- 複雑なフローは必ず状態機械で管理
- 状態の定義を明確にする

### 2. **ガード条件の実装**
- すべてのイベントハンドラに状態チェックを追加
- 不正な状態での操作を防ぐ

### 3. **テストの充実**
- 状態遷移のテストケースを作成
- エッジケースの検証

### 4. **ドキュメント化**
- 状態遷移図の作成と維持
- 新機能追加時の状態影響の確認

## 状態遷移図

```
welcome → ready → asking → waiting_answer → processing → asking
                     ↓                                       ↑
                 completed ←----------------------------------┘
```

この改善により、同様の問題が再発する可能性は大幅に低減されました。