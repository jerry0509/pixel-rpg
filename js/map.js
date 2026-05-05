/**
 * 地图系统
 * 负责地图加载、碰撞检测、传送点、动态元素
 */

class MapManager {
    constructor() {
        this.currentMap = null;
        this.currentMapId = null;
        this.teleportPoints = [];
        this.npcs = [];
        this.monsters = [];
        this.chests = [];
    }
    
    // 加载地图数据
    loadMap(mapId) {
        if (!MAP_DATA[mapId]) {
            console.error(`地图 ${mapId} 不存在`);
            return false;
        }
        
        this.currentMap = MAP_DATA[mapId];
        this.currentMapId = mapId;
        
        // 初始化宝箱状态
        this.chests = new Array(this.currentMap.width * this.currentMap.height).fill(false);
        
        return true;
    }
    
    // 获取瓦片类型
    getTile(x, y) {
        if (!this.currentMap) return CONFIG.TILE_TYPES.MOUNTAIN;
        if (x < 0 || x >= this.currentMap.width || y < 0 || y >= this.currentMap.height) {
            return CONFIG.TILE_TYPES.MOUNTAIN;
        }
        return this.currentMap.tiles[y][x];
    }
    
    // 设置瓦片类型
    setTile(x, y, type) {
        if (!this.currentMap) return;
        if (x < 0 || x >= this.currentMap.width || y < 0 || y >= this.currentMap.height) {
            return;
        }
        this.currentMap.tiles[y][x] = type;
    }
    
    // 检查是否可通行
    canPass(x, y) {
        let tile = this.getTile(x, y);
        
        // 不可通行的瓦片
        const blocked = [
            CONFIG.TILE_TYPES.TREE,
            CONFIG.TILE_TYPES.WATER,
            CONFIG.TILE_TYPES.HOUSE_WALL,
            CONFIG.TILE_TYPES.MOUNTAIN,
            CONFIG.TILE_TYPES.LAVA
        ];
        
        return !blocked.includes(tile);
    }
    
    // 检查是否是高草丛（可遇敌）
    isTallGrass(x, y) {
        return this.getTile(x, y) === CONFIG.TILE_TYPES.TALL_GRASS;
    }
    
    // 检查是否是宝箱
    isChest(x, y) {
        return this.getTile(x, y) === CONFIG.TILE_TYPES.CHEST;
    }
    
    // 打开宝箱
    openChest(x, y) {
        let index = y * this.currentMap.width + x;
        if (this.chests[index]) {
            return null; // 已经开过了
        }
        
        this.chests[index] = true;
        
        // 随机奖励
        let rewards = [
            { type: 'gold', amount: Math.floor(Math.random() * 100) + 50 },
            { type: 'item', id: 'potion_small', name: '小药水' },
            { type: 'item', id: 'ether', name: '以太' }
        ];
        
        return rewards[Math.floor(Math.random() * rewards.length)];
    }
    
    // 检查传送点
    checkTeleport(x, y) {
        if (!this.currentMap || !this.currentMap.teleportPoints) {
            return null;
        }
        
        for (let tp of this.currentMap.teleportPoints) {
            if (tp.x === x && tp.y === y) {
                return tp;
            }
        }
        
        return null;
    }
    
    // 获取NPC列表
    getNPCs() {
        if (!this.currentMap) return [];
        return this.currentMap.npcs || [];
    }
    
    // 获取怪物刷新区域
    getMonsterAreas() {
        if (!this.currentMap) return [];
        return this.currentMap.monsterAreas || [];
    }
    
    // 渲染地图
    render(cameraX, cameraY) {
        if (!this.currentMap) return;
        
        // 计算可视区域
        let startX = Math.floor(cameraX);
        let startY = Math.floor(cameraY);
        let endX = startX + CONFIG.VIEW_TILES_X + 2;
        let endY = startY + CONFIG.VIEW_TILES_Y + 2;
        
        // 绘制瓦片
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                let tile = this.getTile(x, y);
                renderer.drawTile(x, y, tile, cameraX, cameraY);
            }
        }
    }
}

// 地图数据
const MAP_DATA = {
    // 新手村
    'village': {
        name: '新手村',
        width: 100,
        height: 80,
        tiles: [],
        teleportPoints: [
            { x: 49, y: 79, targetMap: 'grassland', targetX: 49, targetY: 1 }
        ],
        npcs: [
            { id: 'village_chief', name: '村长', x: 25, y: 30, direction: 'down', 
              dialogues: [
                  '欢迎来到新手村！这里是世界上最安全的地方...',
                  '...除了村口那只史莱姆，它昨天偷吃了我的早餐。',
                  '对了，你知道吗？森林深处有个神秘祭坛...',
                  '据说那里藏着通往远古遗迹的入口...',
                  '嘘！别告诉别人是我告诉你的。'
              ]},
            { id: 'merchant', name: '商人', x: 60, y: 25, direction: 'down',
              dialogues: [
                  '欢迎光临！要买点什么吗？',
                  '我这里什么都有，价格公道！',
                  '对了，最近森林里出现了一只狼王...',
                  '听说它怕火，你要是遇到它，记得带火把！'
              ]},
            { id: 'innkeeper', name: '旅馆老板', x: 70, y: 40, direction: 'down',
              dialogues: [
                  '住一晚10金币，包早餐。',
                  '对了，你有没有觉得这游戏有点怪？',
                  '比如...为什么我们都能说话？',
                  '算了，别想太多，睡吧。'
              ]},
            { id: 'blacksmith', name: '铁匠', x: 35, y: 50, direction: 'down',
              dialogues: [
                  '我这把剑可是祖传的！',
                  '我爷爷的爷爷的爷爷...',
                  '...其实我也不知道传了多少代了。',
                  '反正很厉害就是了！'
              ]}
        ],
        monsterAreas: []
    },
    
    // 翡翠草原
    'grassland': {
        name: '翡翠草原',
        width: 100,
        height: 80,
        tiles: [],
        teleportPoints: [
            { x: 49, y: 0, targetMap: 'village', targetX: 49, targetY: 78 },
            { x: 99, y: 40, targetMap: 'forest', targetX: 1, targetY: 40 }
        ],
        npcs: [
            { id: 'hunter', name: '猎人', x: 30, y: 35, direction: 'down',
              dialogues: [
                  '嘘！别吓跑我的猎物！',
                  '那只野猪王皮糙肉厚...',
                  '但它最怕火！用火属性攻击能打出双倍伤害！',
                  '我上次用火把把它吓跑了，哈哈！'
              ]}
        ],
        monsterAreas: [
            { x: 20, y: 20, width: 60, height: 40, monsters: ['slime', 'butterfly', 'wolf'] }
        ],
        boss: { id: 'boar_king', name: '野猪王', x: 70, y: 60 }
    },
    
    // 幽暗森林
    'forest': {
        name: '幽暗森林',
        width: 100,
        height: 80,
        tiles: [],
        teleportPoints: [
            { x: 0, y: 40, targetMap: 'grassland', targetX: 98, targetY: 40 },
            { x: 99, y: 40, targetMap: 'volcano', targetX: 1, targetY: 40 }
        ],
        npcs: [
            { id: 'lost_traveler', name: '迷路的旅人', x: 50, y: 30, direction: 'down',
              dialogues: [
                  '终于见到人了！我在这里迷路三天了！',
                  '这片森林太诡异了，总觉得有什么在看着我...',
                  '对了，我听说狼王怕光属性攻击。',
                  '你要是有光属性技能，打它会很轻松！'
              ]}
        ],
        monsterAreas: [
            { x: 10, y: 10, width: 80, height: 60, monsters: ['bat', 'snake', 'treant'] }
        ],
        boss: { id: 'wolf_king', name: '狼王', x: 80, y: 50 }
    },
    
    // 烈焰火山
    'volcano': {
        name: '烈焰火山',
        width: 100,
        height: 80,
        tiles: [],
        teleportPoints: [
            { x: 0, y: 40, targetMap: 'forest', targetX: 98, targetY: 40 },
            { x: 99, y: 40, targetMap: 'castle', targetX: 1, targetY: 40 }
        ],
        npcs: [
            { id: 'miner', name: '矿工', x: 40, y: 50, direction: 'down',
              dialogues: [
                  '这火山里到处都是宝贝！',
                  '但也有危险的怪物...',
                  '火龙就住在火山口，它怕水！',
                  '用水属性攻击它，能打出双倍伤害！'
              ]}
        ],
        monsterAreas: [
            { x: 10, y: 10, width: 80, height: 60, monsters: ['fire_salamander', 'rock_golem', 'fire_bird'] }
        ],
        boss: { id: 'fire_dragon', name: '火龙', x: 50, y: 20 }
    },
    
    // 魔王城堡
    'castle': {
        name: '魔王城堡',
        width: 100,
        height: 80,
        tiles: [],
        teleportPoints: [
            { x: 0, y: 40, targetMap: 'volcano', targetX: 98, targetY: 40 }
        ],
        npcs: [
            { id: 'princess', name: '被囚公主', x: 80, y: 30, direction: 'down',
              dialogues: [
                  '终于有人来救我了！',
                  '魔王就在王座间，他怕光属性攻击！',
                  '但要小心，他很强大...',
                  '你一定要打败他！'
              ]},
            { id: 'swordsmith', name: '铸剑师', x: 40, y: 60, direction: 'down',
              dialogues: [
                  '我可以帮你打造传说武器！',
                  '但需要材料：火龙鳞、狼王牙、魔王角...',
                  '有了这些，我就能打造出最强的剑！'
              ]}
        ],
        monsterAreas: [
            { x: 10, y: 10, width: 80, height: 60, monsters: ['skeleton', 'dark_knight', 'necromancer'] }
        ],
        boss: { id: 'demon_king', name: '魔王', x: 80, y: 15 }
    },
    
    // 迷雾沼泽（隐藏）
    'swamp': {
        name: '迷雾沼泽',
        width: 100,
        height: 80,
        tiles: [],
        teleportPoints: [
            { x: 0, y: 40, targetMap: 'forest', targetX: 50, targetY: 50 }
        ],
        npcs: [
            { id: 'mystic_healer', name: '神秘药师', x: 60, y: 40, direction: 'down',
              dialogues: [
                  '欢迎来到迷雾沼泽...',
                  '这里很少有人能找到...',
                  '我这里有稀有药水，要买吗？',
                  '对了，沼泽之王怕火，但它的毒很厉害...'
              ]}
        ],
        monsterAreas: [
            { x: 10, y: 10, width: 80, height: 60, monsters: ['swamp_croc', 'poison_sprite'] }
        ],
        boss: { id: 'swamp_king', name: '沼泽之王', x: 50, y: 50 }
    },
    
    // 远古遗迹（隐藏）
    'ruins': {
        name: '远古遗迹',
        width: 100,
        height: 80,
        tiles: [],
        teleportPoints: [
            { x: 0, y: 40, targetMap: 'volcano', targetX: 50, targetY: 50 }
        ],
        npcs: [
            { id: 'ancient_guardian', name: '古代守护者', x: 50, y: 30, direction: 'down',
              dialogues: [
                  '你找到了这里...看来你不是普通人。',
                  '这个遗迹里藏着远古的秘密...',
                  '远古巨像守护着这里，它怕雷属性攻击。',
                  '如果你能打败它，就能获得远古的力量。'
              ]}
        ],
        monsterAreas: [
            { x: 10, y: 10, width: 80, height: 60, monsters: ['gargoyle', 'ancient_warrior'] }
        ],
        boss: { id: 'ancient_golem', name: '远古巨像', x: 50, y: 50 }
    },
    
    // 龙之巢穴（隐藏）
    'dragon_nest': {
        name: '龙之巢穴',
        width: 100,
        height: 80,
        tiles: [],
        teleportPoints: [
            { x: 0, y: 40, targetMap: 'castle', targetX: 90, targetY: 70 }
        ],
        npcs: [
            { id: 'dragon_elder', name: '龙族长老', x: 50, y: 30, direction: 'down',
              dialogues: [
                  '你终于来了...我等了你很久。',
                  '你是被选中的人，能够打败远古巨龙。',
                  '它怕冰属性攻击，但它的火焰能融化一切...',
                  '去吧，用你的力量证明自己！'
              ]}
        ],
        monsterAreas: [
            { x: 10, y: 10, width: 80, height: 60, monsters: ['dragon_kin', 'dragon_knight'] }
        ],
        boss: { id: 'ancient_dragon', name: '远古巨龙', x: 50, y: 50 }
    }
};

// 生成地图瓦片数据
function generateMapTiles(mapId) {
    let map = MAP_DATA[mapId];
    if (!map) return;
    
    let tiles = [];
    
    for (let y = 0; y < map.height; y++) {
        tiles[y] = [];
        for (let x = 0; x < map.width; x++) {
            // 根据地图类型生成不同的地形
            switch(mapId) {
                case 'village':
                    tiles[y][x] = generateVillageTile(x, y);
                    break;
                case 'grassland':
                    tiles[y][x] = generateGrasslandTile(x, y);
                    break;
                case 'forest':
                    tiles[y][x] = generateForestTile(x, y);
                    break;
                case 'volcano':
                    tiles[y][x] = generateVolcanoTile(x, y);
                    break;
                case 'castle':
                    tiles[y][x] = generateCastleTile(x, y);
                    break;
                case 'swamp':
                    tiles[y][x] = generateSwampTile(x, y);
                    break;
                case 'ruins':
                    tiles[y][x] = generateRuinsTile(x, y);
                    break;
                case 'dragon_nest':
                    tiles[y][x] = generateDragonNestTile(x, y);
                    break;
            }
        }
    }
    
    map.tiles = tiles;
}

// 新手村地图生成
function generateVillageTile(x, y) {
    // 边界
    if (x === 0 || x === 99 || y === 0 || y === 79) {
        return CONFIG.TILE_TYPES.TREE;
    }
    
    // 房子
    if ((x >= 20 && x <= 30 && y >= 25 && y <= 35) ||  // 村长家
        (x >= 55 && x <= 65 && y >= 20 && y <= 30) ||  // 商人屋
        (x >= 65 && x <= 75 && y >= 35 && y <= 45) ||  // 旅馆
        (x >= 30 && x <= 40 && y >= 45 && y <= 55)) {  // 铁匠铺
        return CONFIG.TILE_TYPES.HOUSE_WALL;
    }
    
    // 门
    if ((x === 25 && y === 35) || (x === 60 && y === 30) || (x === 70 && y === 45) || (x === 35 && y === 55)) {
        return CONFIG.TILE_TYPES.HOUSE_DOOR;
    }
    
    // 道路
    if ((y === 40 && x >= 10 && x <= 90) || (x === 50 && y >= 10 && y <= 70)) {
        return CONFIG.TILE_TYPES.PATH;
    }
    
    // 花
    if ((x === 15 || x === 85) && (y === 15 || y === 65)) {
        return CONFIG.TILE_TYPES.FLOWER;
    }
    
    // 火把
    if ((x === 10 && y === 10) || (x === 90 && y === 10) || (x === 10 && y === 70) || (x === 90 && y === 70)) {
        return CONFIG.TILE_TYPES.TORCH;
    }
    
    // 默认草地
    return CONFIG.TILE_TYPES.GRASS;
}

// 翡翠草原地图生成
function generateGrasslandTile(x, y) {
    // 边界
    if (x === 0 || x === 99 || y === 0 || y === 79) {
        return CONFIG.TILE_TYPES.TREE;
    }
    
    // 道路
    if ((y === 40 && x >= 0 && x <= 100) || (x === 50 && y >= 0 && y <= 80)) {
        return CONFIG.TILE_TYPES.PATH;
    }
    
    // 高草丛（怪物区域）
    if (x >= 20 && x <= 80 && y >= 20 && y <= 60 && Math.random() < 0.3) {
        return CONFIG.TILE_TYPES.TALL_GRASS;
    }
    
    // 花
    if (Math.random() < 0.05) {
        return CONFIG.TILE_TYPES.FLOWER;
    }
    
    // 默认草地
    return CONFIG.TILE_TYPES.GRASS;
}

// 幽暗森林地图生成
function generateForestTile(x, y) {
    // 边界
    if (x === 0 || x === 99 || y === 0 || y === 79) {
        return CONFIG.TILE_TYPES.TREE;
    }
    
    // 道路
    if ((y === 40 && x >= 0 && x <= 100) || (x === 50 && y >= 0 && y <= 80)) {
        return CONFIG.TILE_TYPES.PATH;
    }
    
    // 树木（密集）
    if (Math.random() < 0.4) {
        return CONFIG.TILE_TYPES.TREE;
    }
    
    // 高草丛
    if (Math.random() < 0.2) {
        return CONFIG.TILE_TYPES.TALL_GRASS;
    }
    
    // 默认草地
    return CONFIG.TILE_TYPES.GRASS;
}

// 烈焰火山地图生成
function generateVolcanoTile(x, y) {
    // 边界
    if (x === 0 || x === 99 || y === 0 || y === 79) {
        return CONFIG.TILE_TYPES.MOUNTAIN;
    }
    
    // 道路
    if ((y === 40 && x >= 0 && x <= 100) || (x === 50 && y >= 0 && y <= 80)) {
        return CONFIG.TILE_TYPES.PATH;
    }
    
    // 岩浆区域
    if (x >= 30 && x <= 70 && y >= 10 && y <= 30 && Math.random() < 0.3) {
        return CONFIG.TILE_TYPES.LAVA;
    }
    
    // 山地
    if (Math.random() < 0.3) {
        return CONFIG.TILE_TYPES.MOUNTAIN;
    }
    
    // 默认草地（火山灰）
    return CONFIG.TILE_TYPES.GRASS;
}

// 魔王城堡地图生成
function generateCastleTile(x, y) {
    // 边界
    if (x === 0 || x === 99 || y === 0 || y === 79) {
        return CONFIG.TILE_TYPES.HOUSE_WALL;
    }
    
    // 道路
    if ((y === 40 && x >= 0 && x <= 100) || (x === 50 && y >= 0 && y <= 80)) {
        return CONFIG.TILE_TYPES.PATH;
    }
    
    // 墙壁
    if ((x === 20 || x === 80) && y >= 10 && y <= 70) {
        return CONFIG.TILE_TYPES.HOUSE_WALL;
    }
    
    // 火把
    if ((x === 20 || x === 80) && (y === 20 || y === 40 || y === 60)) {
        return CONFIG.TILE_TYPES.TORCH;
    }
    
    // 默认地面
    return CONFIG.TILE_TYPES.PATH;
}

// 迷雾沼泽地图生成
function generateSwampTile(x, y) {
    // 边界
    if (x === 0 || x === 99 || y === 0 || y === 79) {
        return CONFIG.TILE_TYPES.TREE;
    }
    
    // 道路
    if ((y === 40 && x >= 0 && x <= 100) || (x === 50 && y >= 0 && y <= 80)) {
        return CONFIG.TILE_TYPES.PATH;
    }
    
    // 沼泽
    if (Math.random() < 0.4) {
        return CONFIG.TILE_TYPES.SWAMP;
    }
    
    // 默认草地
    return CONFIG.TILE_TYPES.GRASS;
}

// 远古遗迹地图生成
function generateRuinsTile(x, y) {
    // 边界
    if (x === 0 || x === 99 || y === 0 || y === 79) {
        return CONFIG.TILE_TYPES.MOUNTAIN;
    }
    
    // 道路
    if ((y === 40 && x >= 0 && x <= 100) || (x === 50 && y >= 0 && y <= 80)) {
        return CONFIG.TILE_TYPES.PATH;
    }
    
    // 宝箱
    if ((x === 30 && y === 30) || (x === 70 && y === 50) || (x === 50 && y === 70)) {
        return CONFIG.TILE_TYPES.CHEST;
    }
    
    // 石柱
    if (Math.random() < 0.1) {
        return CONFIG.TILE_TYPES.MOUNTAIN;
    }
    
    // 默认地面
    return CONFIG.TILE_TYPES.PATH;
}

// 龙之巢穴地图生成
function generateDragonNestTile(x, y) {
    // 边界
    if (x === 0 || x === 99 || y === 0 || y === 79) {
        return CONFIG.TILE_TYPES.MOUNTAIN;
    }
    
    // 道路
    if ((y === 40 && x >= 0 && x <= 100) || (x === 50 && y >= 0 && y <= 80)) {
        return CONFIG.TILE_TYPES.PATH;
    }
    
    // 岩浆
    if (Math.random() < 0.2) {
        return CONFIG.TILE_TYPES.LAVA;
    }
    
    // 山地
    if (Math.random() < 0.3) {
        return CONFIG.TILE_TYPES.MOUNTAIN;
    }
    
    // 默认地面
    return CONFIG.TILE_TYPES.GRASS;
}

// 导出
const mapManager = new MapManager();

// 初始化所有地图
function initMaps() {
    for (let mapId in MAP_DATA) {
        generateMapTiles(mapId);
    }
}
