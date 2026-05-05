/**
 * 怪物系统
 * 定义所有怪物数据和怪物行为
 */

// 怪物数据
const MONSTER_DATA = {
    // 翡翠草原怪物
    slime: { name: '史莱姆', emoji: '🟢', hp: 20, atk: 5, def: 2, exp: 10, gold: 5, element: 'normal', drops: ['slime_jelly'] },
    butterfly: { name: '蝴蝶', emoji: '🦋', hp: 15, atk: 3, def: 1, exp: 8, gold: 3, element: 'normal', drops: ['butterfly_dust'] },
    wolf: { name: '小狼', emoji: '🐺', hp: 30, atk: 8, def: 3, exp: 15, gold: 8, element: 'normal', drops: ['wolf_pelt'] },
    
    // 幽暗森林怪物
    bat: { name: '蝙蝠', emoji: '🦇', hp: 40, atk: 12, def: 5, exp: 20, gold: 12, element: 'dark', drops: ['bat_wing'] },
    snake: { name: '毒蛇', emoji: '🐍', hp: 50, atk: 15, def: 6, exp: 25, gold: 15, element: 'poison', drops: ['snake_gall'] },
    treant: { name: '树精', emoji: '🌳', hp: 80, atk: 18, def: 12, exp: 35, gold: 20, element: 'normal', drops: ['life_leaf'] },
    
    // 烈焰火山怪物
    fire_salamander: { name: '火蜥蜴', emoji: '🦎', hp: 100, atk: 25, def: 15, exp: 40, gold: 25, element: 'fire', drops: ['fire_scale'] },
    rock_golem: { name: '岩石怪', emoji: '🗿', hp: 150, atk: 20, def: 30, exp: 50, gold: 30, element: 'normal', drops: ['rock_core'] },
    fire_bird: { name: '火焰鸟', emoji: '🐦', hp: 120, atk: 35, def: 10, exp: 55, gold: 35, element: 'fire', drops: ['fire_feather'] },
    
    // 魔王城堡怪物
    skeleton: { name: '骷髅兵', emoji: '💀', hp: 180, atk: 35, def: 20, exp: 60, gold: 40, element: 'dark', drops: ['bone'] },
    dark_knight: { name: '暗影骑士', emoji: '🗡️', hp: 250, atk: 45, def: 35, exp: 80, gold: 55, element: 'dark', drops: ['dark_shard'] },
    necromancer: { name: '死灵法师', emoji: '🧙', hp: 200, atk: 50, def: 15, exp: 90, gold: 60, element: 'dark', drops: ['magic_book'] },
    
    // 隐藏地图怪物
    swamp_croc: { name: '沼泽巨鳄', emoji: '🐊', hp: 300, atk: 55, def: 40, exp: 100, gold: 70, element: 'poison', drops: ['croc_skin'] },
    poison_sprite: { name: '毒雾精灵', emoji: '👻', hp: 250, atk: 60, def: 25, exp: 110, gold: 75, element: 'poison', drops: ['poison_orb'] },
    gargoyle: { name: '石像鬼', emoji: '🗿', hp: 400, atk: 50, def: 60, exp: 120, gold: 80, element: 'normal', drops: ['gargoyle_fragment'] },
    ancient_warrior: { name: '远古战士', emoji: '⚔️', hp: 350, atk: 65, def: 45, exp: 130, gold: 85, element: 'normal', drops: ['ancient_weapon'] },
    dragon_kin: { name: '龙裔', emoji: '🐲', hp: 500, atk: 70, def: 50, exp: 150, gold: 100, element: 'fire', drops: ['dragon_blood'] },
    dragon_knight: { name: '龙骑士', emoji: '🛡️', hp: 600, atk: 80, def: 60, exp: 180, gold: 120, element: 'fire', drops: ['dragon_armor'] }
};

// Boss数据
const BOSS_DATA = {
    boar_king: { name: '野猪王', emoji: '🐗', hp: 200, atk: 25, def: 15, exp: 100, gold: 100, element: 'normal', weakness: 'fire', drops: ['boar_tusk'] },
    wolf_king: { name: '狼王', emoji: '🐺', hp: 400, atk: 40, def: 25, exp: 200, gold: 200, element: 'dark', weakness: 'light', drops: ['wolf_king_pelt'] },
    fire_dragon: { name: '火龙', emoji: '🐉', hp: 800, atk: 60, def: 40, exp: 400, gold: 400, element: 'fire', weakness: 'water', drops: ['dragon_scale'] },
    demon_king: { name: '魔王', emoji: '👹', hp: 1500, atk: 80, def: 50, exp: 800, gold: 800, element: 'dark', weakness: 'light', drops: ['demon_horn'] },
    swamp_king: { name: '沼泽之王', emoji: '🐊', hp: 2000, atk: 90, def: 60, exp: 1000, gold: 1000, element: 'poison', weakness: 'fire', drops: ['swamp_heart'] },
    ancient_golem: { name: '远古巨像', emoji: '🗿', hp: 2500, atk: 100, def: 80, exp: 1200, gold: 1200, element: 'normal', weakness: 'thunder', drops: ['ancient_core'] },
    ancient_dragon: { name: '远古巨龙', emoji: '🐲', hp: 3000, atk: 120, def: 90, exp: 1500, gold: 1500, element: 'fire', weakness: 'ice', drops: ['legendary_dragon_scale'] }
};

// 物品掉落数据
const ITEM_DATA = {
    // 消耗品
    potion_small: { name: '小药水', type: 'consumable', effect: 'heal', value: 50, price: 20 },
    potion_medium: { name: '中药水', type: 'consumable', effect: 'heal', value: 150, price: 50 },
    potion_large: { name: '大药水', type: 'consumable', effect: 'heal', value: 300, price: 100 },
    antidote: { name: '解毒草', type: 'consumable', effect: 'cure_poison', price: 30 },
    thaw_stone: { name: '解冻石', type: 'consumable', effect: 'cure_freeze', price: 30 },
    revive: { name: '复活药', type: 'consumable', effect: 'revive', price: 200 },
    attack_potion: { name: '攻击药水', type: 'consumable', effect: 'buff_atk', value: 0.3, duration: 3, price: 80 },
    defense_potion: { name: '防御药水', type: 'consumable', effect: 'buff_def', value: 0.3, duration: 3, price: 80 },
    escape_scroll: { name: '逃跑卷轴', type: 'consumable', effect: 'escape', price: 50 },
    
    // 装备
    wooden_sword: { name: '木剑', type: 'equipment', slot: 'weapon', atk: 5, price: 50 },
    iron_sword: { name: '铁剑', type: 'equipment', slot: 'weapon', atk: 15, price: 200 },
    steel_sword: { name: '钢剑', type: 'equipment', slot: 'weapon', atk: 30, price: 500 },
    fire_sword: { name: '火焰剑', type: 'equipment', slot: 'weapon', atk: 50, element: 'fire', price: 1000 },
    legendary_sword: { name: '传说之剑', type: 'equipment', slot: 'weapon', atk: 100, price: 5000 },
    
    cloth_armor: { name: '布甲', type: 'equipment', slot: 'armor', def: 5, price: 50 },
    leather_armor: { name: '皮甲', type: 'equipment', slot: 'armor', def: 15, price: 200 },
    iron_armor: { name: '铁甲', type: 'equipment', slot: 'armor', def: 30, price: 500 },
    dragon_armor: { name: '龙鳞甲', type: 'equipment', slot: 'armor', def: 60, price: 2000 },
    legendary_armor: { name: '传说铠甲', type: 'equipment', slot: 'armor', def: 100, price: 5000 },
    
    herb_ring: { name: '草药戒指', type: 'equipment', slot: 'accessory', effect: 'regen', value: 0.05, price: 300 },
    power_ring: { name: '力量戒指', type: 'equipment', slot: 'accessory', atkBonus: 0.2, price: 500 },
    guard_ring: { name: '守护戒指', type: 'equipment', slot: 'accessory', defBonus: 0.2, price: 500 },
    speed_ring: { name: '速度戒指', type: 'equipment', slot: 'accessory', spdBonus: 0.3, price: 800 },
    legendary_ring: { name: '传说戒指', type: 'equipment', slot: 'accessory', atkBonus: 0.1, defBonus: 0.1, spdBonus: 0.1, price: 5000 },
    
    // 材料（怪物掉落）
    slime_jelly: { name: '粘液', type: 'material', price: 5 },
    butterfly_dust: { name: '鳞粉', type: 'material', price: 3 },
    wolf_pelt: { name: '兽皮', type: 'material', price: 8 },
    bat_wing: { name: '蝙蝠翼', type: 'material', price: 12 },
    snake_gall: { name: '蛇胆', type: 'material', price: 15 },
    life_leaf: { name: '生命之叶', type: 'material', price: 20 },
    fire_scale: { name: '火鳞片', type: 'material', price: 25 },
    rock_core: { name: '岩石核', type: 'material', price: 30 },
    fire_feather: { name: '火焰羽毛', type: 'material', price: 35 },
    bone: { name: '骨头', type: 'material', price: 40 },
    dark_shard: { name: '暗影碎片', type: 'material', price: 55 },
    magic_book: { name: '魔法书', type: 'material', price: 60 },
    croc_skin: { name: '鳄鱼皮', type: 'material', price: 70 },
    poison_orb: { name: '毒雾珠', type: 'material', price: 75 },
    gargoyle_fragment: { name: '石像碎片', type: 'material', price: 80 },
    ancient_weapon: { name: '远古武器', type: 'material', price: 85 },
    dragon_blood: { name: '龙血', type: 'material', price: 100 },
    dragon_armor: { name: '龙骑士铠甲', type: 'material', price: 120 },
    
    // Boss掉落
    boar_tusk: { name: '野猪牙', type: 'material', price: 100 },
    wolf_king_pelt: { name: '狼王皮', type: 'material', price: 200 },
    dragon_scale: { name: '龙鳞', type: 'material', price: 400 },
    demon_horn: { name: '魔王之角', type: 'material', price: 800 },
    swamp_heart: { name: '沼泽之心', type: 'material', price: 1000 },
    ancient_core: { name: '远古核心', type: 'material', price: 1200 },
    legendary_dragon_scale: { name: '传说龙鳞', type: 'material', price: 1500 }
};

// 怪物类
class Monster {
    constructor(id, data) {
        this.id = id;
        this.name = data.name;
        this.emoji = data.emoji;
        this.hp = data.hp;
        this.maxHp = data.hp;
        this.atk = data.atk;
        this.def = data.def;
        this.exp = data.exp;
        this.gold = data.gold;
        this.element = data.element;
        this.weakness = data.weakness || null;
        this.drops = data.drops || [];
        this.isBoss = !!data.weakness;
    }
    
    // 受到伤害
    takeDamage(damage) {
        this.hp = Math.max(0, this.hp - damage);
        return this.hp <= 0;
    }
    
    // 是否存活
    isAlive() {
        return this.hp > 0;
    }
    
    // 掉落物品
    getDrops() {
        let drops = [];
        
        // 每个掉落物品有50%概率掉落
        for (let itemId of this.drops) {
            if (Math.random() < 0.5) {
                drops.push(itemId);
            }
        }
        
        return drops;
    }
}

// 导出
const monsterManager = {
    MONSTER_DATA,
    BOSS_DATA,
    ITEM_DATA,
    Monster
};
