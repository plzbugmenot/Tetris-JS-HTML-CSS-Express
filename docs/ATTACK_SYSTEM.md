# ⚔️ 攻擊系統說明文檔

## 📋 系統概述

本遊戲採用 **垃圾行攻擊 + Combo 連擊** 的組合攻擊系統，讓多人對戰更具策略性和刺激感。

---

## 🔥 Combo 連擊系統

### 基本規則

- **觸發條件**：連續消行
- **超時時間**：3 秒內沒有消行，Combo 重置為 0
- **計數方式**：每次消行，Combo +1

### Combo 獎勵

#### 分數獎勵
```
基礎分數 = 消行數 × 100
Combo 獎勵 = (Combo - 1) × 50

總分數 = 基礎分數 + Combo 獎勵

範例：
- 消 1 行，Combo x1：100 分
- 消 1 行，Combo x2：100 + 50 = 150 分
- 消 1 行，Combo x5：100 + 200 = 300 分
```

#### 攻擊力加成
```
Combo 2-3：+1 行攻擊
Combo 4-5：+2 行攻擊
Combo 6-7：+3 行攻擊
Combo 8+： +4 行攻擊
```

### Combo 顯示

#### 玩家頭部
```
🔥 Combo x2   (Combo >= 2 時顯示)
🔥 Combo x5   (金色文字)
```

#### 彈出提示
```
消行時彈出大字：
COMBO x3!    (金色發光，1秒後消失)
```

---

## ⚔️ 垃圾行攻擊系統

### 攻擊力計算公式

```javascript
基礎攻擊 = max(0, 消行數 - 1)
等級加成 = floor(玩家等級 / 3)
Combo 加成 = 
  - Combo 2-3: +1
  - Combo 4-5: +2
  - Combo 6-7: +3
  - Combo 8+:  +4

總攻擊力 = 基礎攻擊 + 等級加成 + Combo 加成
```

### 攻擊力對照表

| 消行數 | 等級 | Combo | 基礎 | 等級加成 | Combo加成 | **總攻擊** |
|--------|------|-------|------|----------|-----------|------------|
| 1 行   | 0    | x1    | 0    | 0        | 0         | **0 行**   |
| 2 行   | 0    | x1    | 1    | 0        | 0         | **1 行**   |
| 3 行   | 0    | x1    | 2    | 0        | 0         | **2 行**   |
| 4 行   | 0    | x1    | 3    | 0        | 0         | **3 行**   |
| 2 行   | 0    | x3    | 1    | 0        | 1         | **2 行**   |
| 2 行   | 3    | x1    | 1    | 1        | 0         | **2 行**   |
| 3 行   | 3    | x4    | 2    | 1        | 2         | **5 行**   |
| 4 行   | 6    | x8    | 3    | 2        | 4         | **9 行**！ |

### 垃圾行特性

#### 生成規則
```javascript
- 每行寬度：10 格
- 缺口數量：1 個（隨機位置）
- 位置：從底部開始
- 效果：將玩家現有的方塊向上推
```

#### 視覺外觀
```
垃圾行使用灰色方塊 (.block-ground)
帶 1 個隨機缺口

範例（10格寬）：
■ ■ ■ □ ■ ■ ■ ■ ■ ■  ← 第 3 格是缺口
■ ■ ■ ■ ■ ■ □ ■ ■ ■  ← 第 7 格是缺口
```

### 攻擊目標選擇

**當前版本**：
- 隨機選擇一個**活躍的挑戰者**（非觀戰者、非淘汰）
- 不會攻擊自己

**未來可擴展**：
- 攻擊分數最高的玩家
- 攻擊分數最低的玩家
- 平均分配給所有對手
- 玩家手動選擇目標

---

## 🎯 攻擊效果

### 視覺效果

#### 攻擊者（消行的玩家）
```css
- 整個棋盤閃紅光（0.5秒）
- 紅色陰影和內發光
```

#### 被攻擊者（收到垃圾行）
```css
- 整個棋盤左右震動（0.5秒）
- 震動幅度：±5px
```

### 訊息提示

#### 攻擊者看到
```
⚔️ 攻擊成功！給 玩家名 添加了 3 行垃圾！
```

#### 被攻擊者看到
```
🛡️ 受到攻擊！玩家名 給你添加了 3 行垃圾！
```

#### 控制台日誌
```
⚔️ 玩家A 攻擊 玩家B，造成 3 行垃圾！
💥 攻擊力計算: 基礎=2, 等級加成=1, Combo加成=0 → 總計=3行
```

---

## 🎮 實際戰鬥範例

### 場景 1：基礎攻擊
```
玩家A (Level 0, 無 Combo)：
1. 消除 2 行
2. 攻擊力 = 1 + 0 + 0 = 1 行
3. 玩家B 收到 1 行垃圾

結果：
- 玩家A：+200 分
- 玩家B：底部多 1 行垃圾，方塊向上推 1 格
```

### 場景 2：Combo 連擊
```
玩家A (Level 0)：
1. 消除 2 行 → Combo x1, 攻擊 1 行
2. 2秒後消除 2 行 → Combo x2, 攻擊 2 行（+1 Combo加成）
3. 2秒後消除 2 行 → Combo x3, 攻擊 2 行
4. 2秒後消除 2 行 → Combo x4, 攻擊 3 行（+2 Combo加成）

總攻擊：1 + 2 + 2 + 3 = 8 行垃圾！
```

### 場景 3：等級優勢
```
玩家A (Level 6, Combo x1)：
1. 消除 3 行
2. 攻擊力 = 2（基礎）+ 2（等級÷3）+ 0 = 4 行

玩家B (Level 0, Combo x1)：
1. 消除 3 行
2. 攻擊力 = 2（基礎）+ 0 + 0 = 2 行

結果：高等級玩家攻擊力明顯更強！
```

### 場景 4：終極組合技
```
玩家A (Level 9, Combo x10)：
1. 消除 4 行（Tetris）
2. 攻擊力 = 3（基礎）+ 3（等級）+ 4（Combo）= 10 行！

效果：
- 對手瞬間收到 10 行垃圾
- 幾乎必定導致對手失敗
- 玩家A 閃耀紅光
- 對手劇烈震動
```

---

## 📊 策略建議

### 進攻策略

1. **保持 Combo**
   - 持續消行，不要中斷
   - 3秒內必須再次消行
   - Combo x4+ 才有明顯攻擊加成

2. **一次多消**
   - 消 4 行（Tetris）= 基礎 3 攻擊
   - 比消 4 次單行更有效

3. **提升等級**
   - 每 3 級多 +1 攻擊
   - Level 6 vs Level 0 = +2 攻擊力

4. **組合技**
   - Combo + 多消 + 高等級 = 毀滅性攻擊
   - 可以一次送出 10+ 行垃圾

### 防守策略

1. **快速消除垃圾行**
   - 利用垃圾行的缺口
   - 優先消除垃圾，避免堆積

2. **打斷對手 Combo**
   - 快速消行反擊
   - 給對手壓力，讓其無法保持 Combo

3. **穩定操作**
   - 不要失誤，避免被壓制
   - 保持消行頻率

---

## 🔧 相關配置

### 服務器配置 (`server/config.js`)

```javascript
COMBO_TIMEOUT: 3000,        // Combo 超時時間（3秒）
GARBAGE_HOLE_COUNT: 1,      // 垃圾行缺口數量（1個）
```

### 修改難度

#### 增加難度
```javascript
COMBO_TIMEOUT: 2000,        // Combo 更難保持（2秒）
GARBAGE_HOLE_COUNT: 0,      // 垃圾行無缺口（幾乎無法消除）
```

#### 降低難度
```javascript
COMBO_TIMEOUT: 5000,        // Combo 更容易保持（5秒）
GARBAGE_HOLE_COUNT: 2,      // 垃圾行 2 個缺口（更容易消除）
```

---

## 🎨 技術實現

### 核心函數

#### 1. Combo 更新
```javascript
// server/gameLogic.js
function updateCombo(player, linesCleared) {
    const now = Date.now();
    const lastClearTime = player.lastClearTime;
    
    if (lastClearTime && (now - lastClearTime) > config.COMBO_TIMEOUT) {
        return 1; // 超時，重置為 1
    }
    
    return (player.combo || 0) + 1; // 增加 Combo
}
```

#### 2. 攻擊力計算
```javascript
// server/gameLogic.js
function calculateAttackPower(linesCleared, level, combo) {
    let baseAttack = Math.max(0, linesCleared - 1);
    const levelBonus = Math.floor(level / 3);
    
    let comboBonus = 0;
    if (combo >= 2) comboBonus = 1;
    if (combo >= 4) comboBonus = 2;
    if (combo >= 6) comboBonus = 3;
    if (combo >= 8) comboBonus = 4;
    
    return baseAttack + levelBonus + comboBonus;
}
```

#### 3. 生成垃圾行
```javascript
// server/gameLogic.js
function generateGarbageLines(lineCount, startY = 21) {
    const garbageBlocks = [];
    
    for (let line = 0; line < lineCount; line++) {
        // 隨機選擇缺口位置
        const hole = Math.floor(Math.random() * 10) + 1;
        
        // 創建垃圾行（除了缺口）
        for (let x = 1; x <= 10; x++) {
            if (x !== hole) {
                garbageBlocks.push({ x, y: startY - line });
            }
        }
    }
    
    return garbageBlocks;
}
```

#### 4. 添加垃圾行
```javascript
// server/gameLogic.js
function addGarbageLines(groundBlock, garbageLineCount) {
    // 將現有方塊向上移動
    const movedBlocks = groundBlock.map(block => ({
        x: block.x,
        y: block.y - garbageLineCount
    }));

    // 生成垃圾行（在底部）
    const garbageBlocks = generateGarbageLines(garbageLineCount);

    return [...movedBlocks, ...garbageBlocks];
}
```

---

## 📡 Socket 事件

### 1. `lineCleared` - 消行事件

**發送時機**：玩家消除一行或多行時

**數據結構**：
```javascript
{
    socketID: "玩家ID",
    userName: "玩家名稱",
    lineNumbers: [16, 17],        // 被消除的行號
    linesCleared: 2,               // 消行數量
    combo: 3                       // 當前 Combo 數
}
```

### 2. `playerAttacked` - 攻擊事件

**發送時機**：玩家攻擊其他玩家時

**數據結構**：
```javascript
{
    attackerID: "攻擊者ID",
    attackerName: "攻擊者名稱",
    targetID: "被攻擊者ID",
    targetName: "被攻擊者名稱",
    attackPower: 3,                // 攻擊力（垃圾行數）
    combo: 4                       // 攻擊者的 Combo 數
}
```

---

## 🎨 視覺效果

### CSS 動畫

#### Combo 彈出動畫
```css
@keyframes comboPopup {
  0%   → 縮小（scale: 0）+ 透明
  50%  → 放大（scale: 1.2）+ 完全顯示
  100% → 向上飄（translateY: -30%）+ 淡出
}
```

#### 攻擊者閃光
```css
@keyframes attackFlash {
  0%, 100% → 無陰影
  50%      → 紅色發光（外陰影 + 內陰影）
}
```

#### 被攻擊者震動
```css
@keyframes defendFlash {
  0%, 100% → 位置正常
  25%      → 向左 -5px
  75%      → 向右 +5px
}
```

### HTML 結構

#### 玩家頭部（有 Combo）
```html
<div class="player-header">
  <div class="player-name">🎮 玩家A (你)</div>
  <div class="player-status">USER1</div>
  <div class="player-stats">
    <div class="player-level">Level: 2</div>
    <div class="player-score">分數: 650</div>
    <div class="player-combo">🔥 Combo x4</div>  ← 動態添加
  </div>
</div>
```

---

## 📈 等級系統整合

### 當前等級提升規則

```
消行累積 ÷ 4 = 等級

範例：
- 消除 4 行 → Level 1
- 消除 8 行 → Level 2
- 消除 12 行 → Level 3
```

### 等級對攻擊的影響

```
Level 0-2:  攻擊力 +0
Level 3-5:  攻擊力 +1
Level 6-8:  攻擊力 +2
Level 9-11: 攻擊力 +3
Level 12+:  攻擊力 +4
```

---

## 🔄 遊戲流程

### 單人模式
```
1. 玩家消行 → 分數增加 + 等級提升 + Combo 累積
2. 無攻擊目標（只有自己）
3. Combo 僅影響分數獎勵
```

### 多人模式
```
1. 玩家A 消行 → 計算攻擊力
2. 隨機選擇目標（玩家B）
3. 玩家A 閃紅光 ⚔️
4. 玩家B 震動 🛡️
5. 玩家B 底部添加垃圾行
6. 玩家B 方塊向上推
7. 廣播攻擊事件給所有玩家
```

---

## 🐛 調試信息

### 控制台輸出範例

```
🎯 玩家 玩家A 消除了 2 行！Combo: 3, 分數: 450, 等級: 0, 攻擊力: 2
💥 攻擊力計算: 基礎=1, 等級加成=0, Combo加成=1 → 總計=2行
⚔️ 玩家A 攻擊 玩家B，造成 2 行垃圾！
✨ 消行動畫: 玩家A 消除了 2 行 (Combo x3)
```

---

## 🔮 未來擴展

### 可能的功能

1. **攻擊目標選擇**
   - UI 界面選擇攻擊對象
   - 戰略性攻擊

2. **防禦機制**
   - 連續消行可以抵消待接收的垃圾行
   - 反擊系統

3. **特殊技能**
   - 全體攻擊（分散給所有對手）
   - 雙倍攻擊（消耗 Combo）
   - 護盾（免疫下次攻擊）

4. **道具系統**
   - 炸彈：清除所有垃圾行
   - 冰凍：減慢對手速度
   - 混亂：反轉對手控制

5. **成就系統**
   - Combo Master：達到 Combo x10
   - Heavy Hitter：單次攻擊 10 行
   - Survivor：在 5 行垃圾下存活

---

## 📝 開發注意事項

### 平衡性調整

如果攻擊太強或太弱，可以調整：

```javascript
// server/gameLogic.js - calculateAttackPower()

// 降低攻擊力
let baseAttack = Math.max(0, linesCleared - 2);  // 改為 -2

// 增加攻擊力
let baseAttack = linesCleared;  // 不減 1

// 調整 Combo 加成
if (combo >= 2) comboBonus = 2;  // 提高加成
```

### 性能考量

- 垃圾行生成使用隨機數，性能良好
- 每次攻擊只修改目標玩家的數據，不影響其他玩家
- 動畫使用 CSS，硬件加速

---

## 🎯 總結

**攻擊系統特色**：
- ✅ 簡單易懂的規則
- ✅ 多維度的策略（消行數、等級、Combo）
- ✅ 豐富的視覺反饋
- ✅ 平衡的攻防機制
- ✅ 高擴展性

**遊戲體驗**：
- 🔥 連續消行產生 Combo，攻擊力暴增
- ⚔️ 高等級玩家有明顯優勢
- 🎯 策略性強，需要計算時機
- 💥 視覺效果華麗，戰鬥感十足

---

**最後更新**：2025 年 10 月 2 日  
**版本**：v2.1.0  
**狀態**：✅ 已實現

