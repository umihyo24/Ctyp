# タイピングで戦う育成RPG（ローグライト版）

Node.js で動く CLI ローグライトです。  
**入力速度だけでは勝てない**ように、スタミナ・集中力・スキルコスト・敵特性・報酬選択・メタ進行を入れています。

## 1. 設計説明

### ゲームループ（1ラン）
- スタート（ビルド選択）
- Stage 1〜3: 戦闘 → 報酬選択
- Stage 4: ボス戦
- ラン終了（Legacy Point 獲得・永続解放）

### 「速度だけで決まらない」設計
- **リソース管理**: タイピング成功でも長文はスタミナ消費が重い。短文はコンボに強いが火力が低い。
- **スキル入力**: `burst` / `guard` / `recover` のキーワード入力で効果発動（集中力・スタミナ消費）。
- **ミスの意味付け**: ミスで「露出」増加（被ダメ増）、連続ミスで混乱、さらに敵のミス反撃が入る。
- **敵差分**: 短文耐性／長文耐性／ミス誘発圧の違いで最適解が変わる。

### 成長
- **ラン内成長**: 戦闘勝利で EXP、レベルアップ、報酬でビルド分岐。
- **メタ進行**: Legacy Point を次ランへ持ち越し。一定値で新スキル解放。

## 2. 構成

```text
main.js
systems/
  runSystem.js
  rewardSystem.js
  skillSystem.js
  metaSystem.js
  inputSystem.js
  comboSystem.js
  combatSystem.js
data/
  skills.js
  rewards.js
  enemies.js
  words.js
meta-progress.json  # 初回実行後に自動生成
```

## 3. コード全文（実行方法）

### 起動

```bash
node main.js
```

### 画面の見方
- `Type:` の文を正確に入力
- `burst / guard / recover` と入力するとスキル発動（解放済みのみ）
- 戦闘後に報酬を1つ選択
- 最終的にボスを倒すとランクリア

## 4. 拡張方法

- **新スキル追加**: `data/skills.js` に定義を追加し、`metaSystem.js` の解放条件に紐付け。
- **新報酬追加**: `data/rewards.js` に `apply(player, runState)` を実装。
- **敵追加**: `data/enemies.js` に特性を追加し、`pickEnemy` のステージテーブルを更新。
- **入力難易度拡張**: `data/words.js` の tier を増やし、`pickWord` の選択ロジックを変更。
- **UI強化**: 将来的に Web 化する場合は、`systems/*` をそのままロジック層として流用可能。
