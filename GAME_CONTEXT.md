# AI像素冒险 - 项目上下文摘要

> 本文件供团队成员快速了解项目结构，避免每次阅读2000行的 index.html。
> 主文件：`D:/AAA AI Agent/projects/pixel-rpg/index.html`（约1966行，单文件架构）

---

## 1. 代码位置索引

| 系统 | 行范围 | 说明 |
|------|--------|------|
| **HTML/CSS** | 1-35 | Canvas 1280x768，状态栏HP/MP/ATK/DEF/Gold/Lv/EXP |
| **配置常量 CFG** | 40-46 | 瓦片类型T、元素克制ELEM、遇敌率ENC_RATE=0.05、暴击率CRIT=0.1 |
| **像素画工具 px()** | 51 | `px(ctx,x,y,w,h,c)` 简单矩形填充 |
| **技能数据 SKILLS** | 56-69 | 12个技能：atk/heavy/wind/fire/ice/thunder/heal/shield/rage/poison/holy/ulti |
| **物品数据 ITEMS** | 74-103 | 消耗品(potion/antidote/escape/ball) + 装备(weapon/armor/acc) |
| **材料数据 MATS** | 105-115 | 26种掉落材料，用于合成/开门 |
| **怪物数据 MONS** | 120-146 | 25种普通怪物（6种有behavior字段） |
| **Boss数据 BOSS** | 148-157 | 8个Boss + 1个最终Boss(游戏开发者) |
| **隐藏宝箱 HIDDEN_CHESTS** | 159-171 | 10个隐藏宝箱，支持条件触发 |
| **NPC数据 NPCS** | 162-211 | 16个NPC，分布在8张地图 |
| **地图数据 MAPS** | 216-247 | 8张地图定义（village/grassland/forest/volcano/castle/swamp/ruins/dragon） |
| **室内数据 INTERIORS** | 250-326 | 5个室内地图（player_home/chief_home/shop/inn/smithy） |
| **门映射 DOOR_MAP** | 328 | 5个门坐标到室内ID的映射 |
| **输入系统 Input类** | 333-340 | 键盘输入，支持方向键/Shift加速/空格/ESC/I/M/S |
| **精灵系统 SpriteSheet类** | 345-650 | 调色板+hex解码+图块+角色+怪物精灵 |
| **渲染引擎 Renderer类** | 655-1018 | 瓦片绘制、昼夜系统、天气系统 |
| **地图系统 MapMgr类** | 1023-1187 | 地图加载、碰撞检测、传送点、宝箱 |
| **玩家系统 Player类** | 1192-1239 | 属性、装备、背包、技能、升级 |
| **怪物类 Monster类** | 1244-1254 | 战斗中的怪物实例（含behavior/revived/adapted字段） |
| **战斗系统 Battle类** | 1259-1600+ | 战斗逻辑+渲染（含攻击动画状态机+连击系统+怪物行为系统） |
| **UI系统 UI类** | 1547-1663 | 消息、对话框、菜单、背包UI、装备UI、地图UI |
| **存档系统 Save类** | 1668-1692 | localStorage存档，key='pxrpg_v3' |
| **音频系统 Audio类** | 1697-1708 | Web Audio API，程序生成音效 |
| **游戏主循环** | 1712-1962+ | init/loop/update/render + 各种check函数 + checkHiddenChest |

---

## 2. 精灵数据

### 调色板（第347-356行）

单字符映射到颜色，共约40个颜色：
```
'1':'#000000'  '2':'#ffffff'  '3':'#f4c7a0'  '4':'#2d2d2d'  '5':'#666666'
'6':'#999999'  '7':'#3a7d44'  '8':'#5fa85f'  '9':'#1a4d1a'  'a':'#8b5e3c'
'b':'#d4a76a'  'c':'#5d3a1a'  'd':'#4a90d9'  'e':'#3a78c0'  'f':'#a0d0ff'
'g':'#e74c3c'  'h':'#ff7070'  'i':'#d42020'  'j':'#f39c12'  'k':'#ffd700'
'l':'#ff69b4'  'm':'#6b4a8e'  'n':'#2e1a47'  'o':'#708090'  'p':'#505050'
'q':'#deb887'  'r':'#8b6914'  's':'#ff8c00'  't':'#ff4500'  'u':'#2c1810'
'v':'#1e90ff'  'w':'#40e0d0'  'x':'#8b4513'  'y':'#6b8e23'  'z':'#f5f5dc'
'B':'#b87333'  'E':'#c0392b'  '0':'#00000000'  '.':'透明'
```

### hex编码格式

- 1个字符 = 1个像素
- `.` 表示透明像素
- 16x16像素 = 256字符的hex字符串
- Boss精灵为32x32 = 1024字符
- `decode(hex, w, h)` 方法将hex字符串转为Canvas

### 已实现的精灵（SpriteSheet.init，第377-632行）

**图块精灵 tiles：**
| 名称 | 行号 | 尺寸 | 帧数 |
|------|------|------|------|
| grass | 379-395 | 16x16 | 1帧 |
| tree | 398-414 | 16x16 | 1帧 |
| water | 417-449 | 16x16 | 2帧动画 |
| path | 452-468 | 16x16 | 1帧 |
| tall_grass | 471-519 | 16x16 | 3帧动画 |
| mountain | 522-538 | 16x16 | 1帧 |
| lava | 541-573 | 16x16 | 2帧动画 |
| swamp | 576-592 | 16x16 | 1帧 |

**角色精灵 chars：**
| 名称 | 行号 | 说明 |
|------|------|------|
| player_down_0/1 | 595-596 | 玩家朝下（2帧） |
| player_up_0/1 | 597-598 | 玩家朝上（2帧） |
| player_left_0/1 | 599-600 | 玩家朝左（2帧） |
| player_right_0/1 | 601-602 | 玩家朝右（2帧） |
| npc_down_0/1 | 603-604 | NPC朝下（2帧） |

**怪物精灵 mons（16x16，各2帧）：**
| 名称 | 行号 | 对应怪物ID |
|------|------|------------|
| slime_0/1 | 606-607 | slime |
| wolf_0/1 | 608-609 | wolf |
| bat_0/1 | 610-611 | bat |
| skeleton_0/1 | 612-613 | skeleton |
| butterfly_0/1 | 614-615 | butterfly |
| boar_0/1 | 616-617 | boar |
| snake_0/1 | 618-619 | snake |
| treant_0/1 | 620-621 | treant |
| fire_salamander_0/1 | 622-623 | fsalam |
| fire_bird_0/1 | 624-625 | fbird |
| rock_golem_0/1 | 626-627 | rgolem |

### 缺失精灵的怪物（使用emoji替代）

以下怪物没有像素精灵，战斗中显示emoji：
- mslime(岩浆史莱姆), fsprite(森林精灵), dknight(暗影骑士), necro(死灵法师)
- ghost(幽灵), scroc(沼泽巨鳄), psprite(毒雾精灵), sslime(沼泽史莱姆)
- gargoyle(石像鬼), awarrior(远古战士), statue(石像), dkin(龙裔)
- dknight_d(龙骑士), fwyrm(火龙蜥)

所有Boss均无像素精灵（使用emoji或32x32 boss sprite框架）。

---

## 3. 地图数据

### 8张世界地图（MAPS，第216-247行）

所有地图尺寸：**100x80** 瓦片，每瓦片64像素。

| ID | 名称 | 传送点 | NPC | 怪物区域 | Boss | 遇敌率 |
|----|------|--------|-----|----------|------|--------|
| village | 新手村 | ->grassland(y=78) | chief,merchant,innkeeper,blacksmith | 无 | 无 | 0 |
| grassland | 翡翠草原 | ->village(y=0), ->forest(x=99) | hunter,wander_merchant | slime,butterfly,wolf,boar | boar_k(70,60) | 0.05 |
| forest | 幽暗森林 | ->grassland(x=0), ->volcano(x=99) | traveler,hermit | bat,snake,treant,fsprite | wolf_k(80,50) | 0.06 |
| volcano | 烈焰火山 | ->forest(x=0), ->castle(x=99) | miner,sage | fsalam,rgolem,fbird,mslime | fire_d(50,20) | 0.06 |
| castle | 魔王城堡 | ->volcano(x=0) | princess,swordsmith | skeleton,dknight,necro,ghost | demon_k(80,15) | 0.07 |
| swamp | 迷雾沼泽 | ->grassland(x=0) | healer,elder | scroc,psprite,sslime | swamp_k(50,50) | 0.05 |
| ruins | 远古遗迹 | ->volcano(x=0) | guardian | gargoyle,awarrior,statue | golem(50,50) | 0.05 |
| dragon | 龙之巢穴 | ->castle(x=0) | dragon_e | dkin,dknight_d,fwyrm | dragon(50,50) | 0.06 |

### 隐藏传送（非地图tp，通过interact触发）

- grassland(95,75) -> swamp(50,70)
- volcano(85,65) -> ruins(5,40)
- castle(85,10) -> dragon(5,40)

### 5个室内地图（INTERIORS，第250-326行）

| ID | 名称 | 尺寸 | 返回位置 |
|----|------|------|----------|
| player_home | 主角家 | 14x12 | village(18,19) |
| chief_home | 村长家 | 14x12 | village(75,21) |
| shop | 商人屋 | 14x12 | village(50,33) |
| inn | 旅馆 | 14x12 | village(75,56) |
| smithy | 铁匠铺 | 14x12 | village(20,56) |

### 地图格式

- 室内地图用二维数组 `t[y][x]` 定义，数值对应CFG.T中的瓦片类型
- 世界地图由 `gen()` 函数程序化生成（第1087-1186行），每个地图有专属生成函数
- 图块类型：GRASS=0, TREE=1, WATER=2, PATH=3, WALL=4, DOOR=5, TGRASS=6, FLOWER=7, BRIDGE=8, MTN=10, LAVA=11, SWAMP=12, CHEST=13, TORCH=14, SIGN=15, ALTAR=18, FOUNTAIN=19, DEV_HOUSE=20, FLOOR=21, IWALL=22, EXIT=23, BOOK=24, BED=25, COUNTER=26, ANVIL=27, ROOF=28, GATE=29

---

## 4. 战斗系统核心逻辑

### 伤害公式（第1328行）

```javascript
calc(a, d) = max(1, floor(a * (1 + random()*0.1) - d * 0.5))
```
- `a` = 攻击方ATK（含装备加成）
- `d` = 防御方DEF（含装备加成）
- 10%随机浮动
- 最低伤害为1

### 元素克制表（第44行 CFG.ELEM）

| 元素 | 克制 | 被克 |
|------|------|------|
| fire(火) | ice | water |
| ice(冰) | thunder | fire |
| thunder(雷) | water | ice |
| water(水) | fire | thunder |
| light(光) | dark | dark |
| dark(暗) | light | light |
| poison(毒) | normal | fire |
| normal(普通) | - | - |

克制倍率：1.5x（getEm函数，第1329行）
Boss弱点额外2x（第1299行）

### 遇敌机制（checkEnc，第1766-1777行）

1. **Boss遇敌**：与Boss相邻1格自动触发（曼哈顿距离<=1）
2. **普通遇敌**：只在高草丛(TGRASS)中触发，概率8%
3. 遇敌后有120帧冷却（encCd）
4. 室内不遇敌
5. 新手村(village)无怪物区域，遇敌率=0

### 战斗动画状态机（第1361-1379行）

```
atkAnim状态: none -> rush(15帧冲刺) -> hit(10帧命中) -> return(15帧退回) -> none
```

### 关键战斗参数

- 暴击率：10%（CFG.CRIT），暴击倍率1.5x（CFG.CRIT_M）
- 逃跑成功率：50%（CFG.ESC），Boss战无法逃跑
- 最终Boss(游戏开发者)：普通攻击/技能伤害降至30%，需要创世之钥
- 失败惩罚：失去一半金币，传回新手村，HP/MP恢复30%

### 战斗连击系统（Battle.combo）

连续使用同属性技能/攻击，伤害递增：
- 连击倍率表：`[1x, 1.2x, 1.5x, 1.8x, 2.2x, 3x]`
- 连击数 0-5，超过5按5计算
- 使用不同属性会重置连击
- 连击数显示在怪物信息面板下方
- 怪物死亡/战斗结束时重置

关键字段：
- `Battle.combo = {count: 0, elem: null}` - 当前连击状态
- `Battle.lastPElem` - 玩家上次使用的元素（用于龙裔适应）
- `Battle.getComboMult(elem)` - 获取连击倍率并更新连击数

### 怪物行为系统（MONS.behavior）

6种怪物拥有特殊行为模式：

| 怪物 | behavior值 | 触发条件 | 行为 |
|------|-----------|----------|------|
| 小狼 wolf | `'wolf'` | HP<50% | 召唤同伴，恢复20%HP（一次性） |
| 蝙蝠 bat | `'bat'` | HP<30% | 惊慌逃跑（视为击败） |
| 树精 treant | `'treant'` | 每3回合 | 进入防御姿态，DEF提升50% |
| 火蜥蜴 fsalam | `'fire_salamander'` | HP<20% | 暴走，ATK翻倍（一次性） |
| 骷髅兵 skeleton | `'skeleton'` | HP降至0 | 复活一次，恢复50%HP |
| 龙裔 dkin | `'dragon_kin'` | 被弱点攻击后 | 适应，DEF提升30%（一次性） |

关键字段：
- `Monster.behavior` - 行为类型标识
- `Monster.revived` - 是否已复活（骷髅用）
- `Monster.adapted` - 是否已适应（龙裔用）
- `Battle.turnCnt` - 回合计数（树精用）
- `Battle.checkBehavior()` - 行为检查方法，在mTurn中调用

---

## 5. 升级与成长

- 升级经验：`lv * 50`（第1217行）
- 最高等级：50
- 升级奖励：HP+20, MP+5, ATK+3, DEF+2
- 技能学习：到达对应等级自动学会

---

## 5.5 隐藏宝箱系统

### 数据格式（HIDDEN_CHESTS数组）

```javascript
{
  id: 'hc_grass_1',        // 唯一ID
  map: 'grassland',        // 所在地图
  x: 15, y: 25,           // 坐标
  reward: {t:'g', v:200}, // 奖励：{t:'g', v:金币数} 或 {t:'i', id:'物品ID'}
  desc: '草丛深处的宝箱',   // 描述文本
  cond: 'night'            // 条件（可选）
}
```

### 条件类型

| cond值 | 说明 |
|--------|------|
| 无 | 无条件，互动即可获取 |
| `'night'` | 仅夜晚(ren.phase()==='night')可开启 |
| `'boss_defeated'` | 需收集全部7个Boss掉落物 |
| `'has_ancient_c'` | 需拥有远古核心材料 |

### 关键函数

- `checkHiddenChest(x,y)` - 在interact()中调用，检查玩家面对的位置是否有隐藏宝箱
- `player.hChests` - 已开启的隐藏宝箱记录（对象，key为宝箱ID）
- 存档系统已支持hChests的保存/读取

### 已配置的10个隐藏宝箱

| 地图 | 数量 | 条件宝箱 |
|------|------|----------|
| grassland | 2 | 无 |
| forest | 2 | 1个夜晚限定 |
| volcano | 2 | 1个夜晚限定 |
| castle | 1 | Boss掉落物限定 |
| swamp | 1 | 无 |
| ruins | 1 | 远古核心限定 |
| dragon | 1 | 夜晚限定 |

---

## 6. 已知Bug列表

来源：`BUGS_AND_ISSUES.md`

### 严重问题
1. **美术整体质量差** - 所有怪物/角色像素画太简陋，需要口袋妖怪GBA级别
2. **战斗动画太快** - 攻击动画0.1秒不到，看不到敌方攻击动画
3. **游戏时间流逝太快** - 需调整timeSpeed

### Bug
4. **狼王过不去** - Boss区域无法通过（碰撞范围太大或位置问题）
5. **旅馆出不来** - 进入旅馆后无法离开（出口检测问题）
6. **草原空旷** - 翡翠草原缺少装饰物

### 待优化
7. **Boss碰撞范围** - 2x2碰撞可能太大导致堵路
8. **像素精灵数据** - 需要用更好的方法生成高质量像素画

---

## 7. 操作说明

| 按键 | 功能 |
|------|------|
| 方向键 | 移动 |
| Shift+方向键 | 加速跑 |
| 空格 | 对话/确认 |
| ESC | 菜单 |
| I | 背包 |
| M | 地图 |
| S | 快速存档 |

---

## 8. 全局实例

```javascript
const input = new Input();      // 输入
const ren = new Renderer('gameCanvas');  // 渲染
const map = new MapMgr();       // 地图
const player = new Player();    // 玩家
const battle = new Battle();    // 战斗
const ui = new UI();            // UI
const save = new Save();        // 存档
const audio = new Audio();      // 音频
```

游戏状态：`state` 变量，值为 `'playing'` 或 `'battle'`
