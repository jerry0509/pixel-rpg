/**
 * 游戏配置文件
 * 所有游戏常量和参数都在这里定义
 */

const CONFIG = {
    // 画布设置
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 768,
    
    // 瓦片设置
    TILE_SIZE: 64,
    
    // 地图设置
    MAP_WIDTH: 100,  // 每张地图100格宽
    MAP_HEIGHT: 80,  // 每张地图80格高
    
    // 可视区域（屏幕显示多少格）
    VIEW_TILES_X: 20,  // 1280 / 64 = 20格
    VIEW_TILES_Y: 12,  // 768 / 64 = 12格
    
    // 玩家设置
    PLAYER_SPEED: 4,  // 像素/帧
    MOVE_DELAY: 150,  // 移动延迟（毫秒）
    
    // 帧率
    FPS: 60,
    
    // 瓦片类型
    TILE_TYPES: {
        GRASS: 0,
        TREE: 1,
        WATER: 2,
        PATH: 3,
        HOUSE_WALL: 4,
        HOUSE_DOOR: 5,
        TALL_GRASS: 6,  // 高草丛（遇敌）
        FLOWER: 7,
        BRIDGE: 8,
        STAIRS: 9,
        MOUNTAIN: 10,
        LAVA: 11,
        SWAMP: 12,
        CHEST: 13,
        TORCH: 14,
        SIGN: 15
    },
    
    // 颜色配置
    COLORS: {
        GRASS: '#4a7c59',
        TREE: '#2d5a27',
        TREE_TOP: '#1a4d1a',
        WATER: '#3498db',
        WATER_ANIM: '#2980b9',
        PATH: '#95a5a6',
        HOUSE_WALL: '#8b4513',
        HOUSE_DOOR: '#654321',
        TALL_GRASS: '#6b8e23',
        FLOWER_PINK: '#ff69b4',
        FLOWER_RED: '#ff1493',
        FLOWER_YELLOW: '#ffd700',
        BRIDGE: '#a0522d',
        STAIRS: '#708090',
        MOUNTAIN: '#696969',
        LAVA: '#ff4500',
        LAVA_ANIM: '#ff6347',
        SWAMP: '#556b2f',
        CHEST: '#daa520',
        TORCH: '#ff8c00',
        TORCH_FLAME: '#ffd700',
        SIGN: '#deb887',
        PLAYER_BODY: '#3498db',
        PLAYER_HEAD: '#f39c12',
        PLAYER_DIR: '#e74c3c',
        NPC_BODY: '#e74c3c',
        NPC_HEAD: '#f1c40f',
        UI_BG: 'rgba(0,0,0,0.8)',
        UI_BORDER: '#fff',
        UI_TEXT: '#fff',
        UI_GOLD: '#f1c40f',
        UI_RED: '#e74c3c',
        UI_GREEN: '#2ecc71',
        UI_BLUE: '#3498db'
    },
    
    // 动画帧数
    ANIM: {
        GRASS_FRAMES: 3,
        WATER_FRAMES: 4,
        TORCH_FRAMES: 2,
        PLAYER_FRAMES: 4,
        NPC_FRAMES: 2
    },
    
    // 战斗设置
    BATTLE: {
        ENCOUNTER_RATE: 0.08,  // 高草丛遇敌率
        CRIT_RATE: 0.1,  // 暴击率
        CRIT_MULTIPLIER: 1.5,  // 暴击伤害倍率
        ESCAPE_RATE: 0.5,  // 逃跑成功率
        EXP_PER_LEVEL: 50,  // 每级所需经验
        HP_PER_LEVEL: 20,  // 每级增加HP
        ATK_PER_LEVEL: 3,  // 每级增加ATK
        DEF_PER_LEVEL: 2,  // 每级增加DEF
        MAX_LEVEL: 50
    },
    
    // 属性类型
    ELEMENTS: {
        NORMAL: 'normal',
        FIRE: 'fire',
        ICE: 'ice',
        THUNDER: 'thunder',
        WATER: 'water',
        LIGHT: 'light',
        DARK: 'dark',
        POISON: 'poison'
    },
    
    // 属性相克表
    ELEMENT_CHART: {
        fire: { strong: 'ice', weak: 'water' },
        ice: { strong: 'thunder', weak: 'fire' },
        thunder: { strong: 'water', weak: 'ice' },
        water: { strong: 'fire', weak: 'thunder' },
        light: { strong: 'dark', weak: 'dark' },
        dark: { strong: 'light', weak: 'light' },
        poison: { strong: 'normal', weak: 'fire' },
        normal: { strong: '', weak: '' }
    },
    
    // 状态效果
    STATUS_EFFECTS: {
        POISON: { name: '中毒', damage: 0.05, duration: 3 },
        BURN: { name: '灼烧', damage: 0.03, duration: 3 },
        FREEZE: { name: '冰冻', skipTurn: true, duration: 1 },
        STUN: { name: '眩晕', skipTurn: true, duration: 1 },
        SHIELD: { name: '护盾', defBonus: 0.5, duration: 3 },
        BERSERK: { name: '狂暴', atkBonus: 0.5, duration: 3 }
    }
};

// 导出配置
if (typeof module !== 'undefined') {
    module.exports = CONFIG;
}
