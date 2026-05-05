/**
 * 玩家系统
 * 管理玩家属性、移动、升级、装备
 */

class Player {
    constructor() {
        this.x = 49;
        this.y = 40;
        this.direction = 'down';
        this.isMoving = false;
        
        // 基础属性
        this.name = '勇者';
        this.level = 1;
        this.exp = 0;
        this.gold = 100;
        
        // 战斗属性
        this.hp = 100;
        this.maxHp = 100;
        this.atk = 10;
        this.def = 5;
        this.spd = 10;
        
        // 装备加成
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
        
        // 技能列表
        this.skills = [
            { id: 'normal_attack', name: '普通攻击', type: 'physical', power: 1.0, element: 'normal', mp: 0 },
            { id: 'heal', name: '治愈术', type: 'heal', power: 0.3, element: 'normal', mp: 10 }
        ];
        
        // 背包
        this.inventory = {
            items: [],  // { id, name, type, count }
            equipment: []  // 装备列表
        };
        
        // 状态效果
        this.statusEffects = [];
        
        // 好感度系统
        this.favorability = {};
        
        // 当前地图
        this.currentMap = 'village';
    }
    
    // 移动
    move(dx, dy) {
        let newX = this.x + dx;
        let newY = this.y + dy;
        
        // 设置方向
        if (dx > 0) this.direction = 'right';
        if (dx < 0) this.direction = 'left';
        if (dy > 0) this.direction = 'down';
        if (dy < 0) this.direction = 'up';
        
        // 检查碰撞
        if (mapManager.canPass(newX, newY)) {
            this.x = newX;
            this.y = newY;
            this.isMoving = true;
            
            // 检查传送点
            let tp = mapManager.check传送(newX, newY);
            if (tp) {
                this.teleport(tp.targetMap, tp.targetX, tp.targetY);
            }
            
            return true;
        }
        
        this.isMoving = false;
        return false;
    }
    
    // 传送
    teleport(mapId, x, y) {
        this.currentMap = mapId;
        this.x = x;
        this.y = y;
        mapManager.loadMap(mapId);
        
        uiManager.addMessage(`到达了${MAP_DATA[mapId].name}！`);
    }
    
    // 获得经验
    gainExp(amount) {
        this.exp += amount;
        
        // 升级检查
        while (this.exp >= this.getNextLevelExp() && this.level < CONFIG.BATTLE.MAX_LEVEL) {
            this.levelUp();
        }
    }
    
    // 获取下一级所需经验
    getNextLevelExp() {
        return this.level * CONFIG.BATTLE.EXP_PER_LEVEL;
    }
    
    // 升级
    levelUp() {
        this.level++;
        this.maxHp += CONFIG.BATTLE.HP_PER_LEVEL;
        this.hp = this.maxHp;  // 升级回满血
        this.atk += CONFIG.BATTLE.ATK_PER_LEVEL;
        this.def += CONFIG.BATTLE.DEF_PER_LEVEL;
        
        // 学习新技能
        this.learnSkills();
        
        uiManager.addMessage(`🎉 升级了！现在是Lv.${this.level}`);
    }
    
    // 学习技能
    learnSkills() {
        let newSkills = {
            3: { id: 'heavy_strike', name: '重击', type: 'physical', power: 1.5, element: 'normal', mp: 5, critRate: 0.3 },
            5: { id: 'whirlwind', name: '旋风斩', type: 'physical', power: 0.8, element: 'normal', mp: 8, target: 'all' },
            7: { id: 'fireball', name: '火球术', type: 'magic', power: 1.2, element: 'fire', mp: 12 },
            9: { id: 'ice', name: '冰冻术', type: 'magic', power: 1.0, element: 'ice', mp: 12, status: 'freeze' },
            12: { id: 'thunder', name: '雷电术', type: 'magic', power: 1.8, element: 'thunder', mp: 20 },
            4: { id: 'shield', name: '护盾术', type: 'buff', power: 0, element: 'normal', mp: 15, status: 'shield' },
            6: { id: 'berserk', name: '狂暴', type: 'buff', power: 0, element: 'normal', mp: 15, status: 'berserk' },
            8: { id: 'poison_blade', name: '毒刃', type: 'physical', power: 0.8, element: 'poison', mp: 10, status: 'poison' },
            15: { id: 'holy_light', name: '圣光', type: 'magic', power: 2.0, element: 'light', mp: 25 },
            18: { id: 'ultimate_slash', name: '终极斩', type: 'physical', power: 3.0, element: 'normal', mp: 30, hpCost: 0.1 }
        };
        
        if (newSkills[this.level]) {
            let skill = newSkills[this.level];
            this.skills.push(skill);
            uiManager.addMessage(`✨ 学会了新技能：${skill.name}！`);
        }
    }
    
    // 获取总ATK（含装备）
    getTotalAtk() {
        let bonus = 0;
        if (this.equipment.weapon) bonus += this.equipment.weapon.atk || 0;
        if (this.equipment.accessory) bonus += this.equipment.accessory.atkBonus ? this.atk * this.equipment.accessory.atkBonus : 0;
        return this.atk + bonus;
    }
    
    // 获取总DEF（含装备）
    getTotalDef() {
        let bonus = 0;
        if (this.equipment.armor) bonus += this.equipment.armor.def || 0;
        if (this.equipment.accessory) bonus += this.equipment.accessory.defBonus ? this.def * this.equipment.accessory.defBonus : 0;
        return this.def + bonus;
    }
    
    // 穿戴装备
    equip(item) {
        let slot = item.slot;  // weapon, armor, accessory
        
        // 如果已有装备，先卸下
        if (this.equipment[slot]) {
            this.unequip(slot);
        }
        
        this.equipment[slot] = item;
        
        // 从背包移除
        this.inventory.equipment = this.inventory.equipment.filter(e => e !== item);
        
        uiManager.addMessage(`装备了${item.name}！`);
    }
    
    // 卸下装备
    unequip(slot) {
        if (this.equipment[slot]) {
            this.inventory.equipment.push(this.equipment[slot]);
            this.equipment[slot] = null;
        }
    }
    
    // 使用道具
    useItem(itemId) {
        let itemIndex = this.inventory.items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return false;
        
        let item = this.inventory.items[itemIndex];
        
        switch(item.id) {
            case 'potion_small':
                this.hp = Math.min(this.maxHp, this.hp + 50);
                uiManager.addMessage('使用了小药水，恢复50 HP！');
                break;
            case 'potion_medium':
                this.hp = Math.min(this.maxHp, this.hp + 150);
                uiManager.addMessage('使用了中药水，恢复150 HP！');
                break;
            case 'potion_large':
                this.hp = Math.min(this.maxHp, this.hp + 300);
                uiManager.addMessage('使用了大药水，恢复300 HP！');
                break;
            case 'revive':
                if (this.hp <= 0) {
                    this.hp = Math.floor(this.maxHp * 0.3);
                    uiManager.addMessage('使用了复活药，复活了！');
                }
                break;
            case 'escape_scroll':
                // 逃跑卷轴在战斗中使用
                break;
            default:
                uiManager.addMessage('这个道具不能在这里使用。');
                return false;
        }
        
        // 减少数量
        item.count--;
        if (item.count <= 0) {
            this.inventory.items.splice(itemIndex, 1);
        }
        
        return true;
    }
    
    // 恢复HP（旅馆）
    rest() {
        this.hp = this.maxHp;
        uiManager.addMessage('休息了一晚，HP已完全恢复！');
    }
    
    // 检查是否在战斗区域
    isInBattleArea() {
        return mapManager.isTallGrass(this.x, this.y);
    }
    
    // 渲染
    render(cameraX, cameraY) {
        renderer.drawCharacter(this.x, this.y, this.direction, 'player', cameraX, cameraY, this.isMoving);
    }
}

// 导出
const player = new Player();
